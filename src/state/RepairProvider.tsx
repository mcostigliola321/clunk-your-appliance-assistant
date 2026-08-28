import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { createInitialRepairState, executeRepairTool, withWebMcpStatus } from "@/domain/engine";
import { getRepairSnapshot, getToolAvailabilityKey } from "@/domain/selectors";
import type {
  ActivitySource,
  RepairSnapshot,
  RepairState,
  RepairToolName,
  ToolExecutionResult,
  WebMcpStatus,
} from "@/domain/types";
import { registerClunkTools } from "@/webmcp/registerTools";

interface RepairContextValue {
  state: RepairState;
  snapshot: RepairSnapshot;
  invokeTool: (
    name: RepairToolName,
    input?: Record<string, unknown>,
    source?: ActivitySource,
  ) => ToolExecutionResult;
  reset: () => void;
  undoLastObservation: () => boolean;
  canUndo: boolean;
  setWebMcpStatus: (status: WebMcpStatus) => void;
}

type StateAction = { type: "replace"; state: RepairState };

function repairReducer(_state: RepairState, action: StateAction): RepairState {
  return action.state;
}

const RepairContext = createContext<RepairContextValue | null>(null);

const SESSION_STORAGE_KEY = "clunk-repair-session-v1";

interface StoredSession {
  version: 1;
  state: RepairState;
  undoStack: RepairState[];
}

function loadStoredSession(): StoredSession {
  const fallback: StoredSession = {
    version: 1,
    state: createInitialRepairState(),
    undoStack: [],
  };
  try {
    if (typeof window === "undefined") return fallback;
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<StoredSession>;
    if (
      parsed.version !== 1 ||
      !parsed.state ||
      !Array.isArray(parsed.state.activity) ||
      !Array.isArray(parsed.state.catalogResultIds) ||
      !parsed.state.completedChecks ||
      !Array.isArray(parsed.undoStack)
    )
      return fallback;
    getRepairSnapshot(parsed.state);
    return parsed as StoredSession;
  } catch {
    return fallback;
  }
}

function saveStoredSession(state: RepairState, undoStack: RepairState[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ version: 1, state, undoStack } satisfies StoredSession),
    );
  } catch {
    // Repair guidance still works when storage is blocked or full.
  }
}

export function RepairProvider({ children }: PropsWithChildren) {
  const startup = useMemo(loadStoredSession, []);
  const [state, dispatch] = useReducer(repairReducer, startup.state);
  const [canUndo, setCanUndo] = useState(startup.undoStack.length > 0 && !startup.state.escalation);
  const stateRef = useRef(state);
  const undoStackRef = useRef(startup.undoStack);
  stateRef.current = state;

  const replaceState = useCallback((nextState: RepairState) => {
    stateRef.current = nextState;
    dispatch({ type: "replace", state: nextState });
  }, []);

  const invokeTool = useCallback(
    (
      name: RepairToolName,
      input: Record<string, unknown> = {},
      source: ActivitySource = "agent",
    ) => {
      const previousState = stateRef.current;
      const execution = executeRepairTool(previousState, name, input, source);
      if (execution.ok && (name === "select_appliance" || name === "start_diagnosis")) {
        undoStackRef.current = [];
      }
      if (execution.ok && name === "record_observation" && source === "human") {
        undoStackRef.current = [...undoStackRef.current, previousState].slice(-12);
      }
      setCanUndo(undoStackRef.current.length > 0 && !execution.state.escalation);
      replaceState(execution.state);
      return execution;
    },
    [replaceState],
  );

  const reset = useCallback(() => {
    undoStackRef.current = [];
    setCanUndo(false);
    replaceState(createInitialRepairState(stateRef.current.webMcpStatus));
  }, [replaceState]);

  const undoLastObservation = useCallback(() => {
    if (stateRef.current.escalation) return false;
    const previousState = undoStackRef.current.at(-1);
    if (!previousState) return false;
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    const sequence = previousState.sequence + 1;
    const restoredState: RepairState = {
      ...previousState,
      webMcpStatus: stateRef.current.webMcpStatus,
      exampleMode: false,
      sequence,
      activity: [
        ...previousState.activity,
        {
          id: `event-${sequence}`,
          sequence,
          source: "human",
          action: "undo_observation",
          arguments: {},
          outcome: "accepted",
          message: "Returned to the previous question so the last answer can be changed.",
        },
      ],
    };
    setCanUndo(undoStackRef.current.length > 0);
    replaceState(restoredState);
    return true;
  }, [replaceState]);

  const setWebMcpStatus = useCallback(
    (status: WebMcpStatus) => {
      replaceState(withWebMcpStatus(stateRef.current, status));
    },
    [replaceState],
  );

  const toolAvailabilityKey = getToolAvailabilityKey(state);

  useEffect(() => {
    saveStoredSession(state, undoStackRef.current);
  }, [state]);

  useEffect(() => {
    const controller = registerClunkTools(invokeTool, setWebMcpStatus, stateRef.current);
    return () => controller?.abort();
  }, [invokeTool, setWebMcpStatus, toolAvailabilityKey]);

  const value = useMemo<RepairContextValue>(
    () => ({
      state,
      snapshot: getRepairSnapshot(state),
      invokeTool,
      reset,
      undoLastObservation,
      canUndo,
      setWebMcpStatus,
    }),
    [canUndo, invokeTool, reset, setWebMcpStatus, state, undoLastObservation],
  );

  return <RepairContext.Provider value={value}>{children}</RepairContext.Provider>;
}

// The provider and its hook intentionally share this small state boundary.
// eslint-disable-next-line react-refresh/only-export-components
export function useRepair(): RepairContextValue {
  const value = useContext(RepairContext);
  if (!value) {
    throw new Error("useRepair must be used inside RepairProvider.");
  }
  return value;
}
