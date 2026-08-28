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
import { getCatalogEntry, REPAIR_PACKS, resolveRepairPack } from "@/domain/repairPack";
import { getRepairSnapshot, getToolAvailabilityKey } from "@/domain/selectors";
import type {
  ActivitySource,
  RepairSnapshot,
  RepairState,
  RepairToolName,
  SupportedSymptomId,
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
const MAX_STORED_SESSION_BYTES = 100_000;

export interface StoredSession {
  version: 2;
  state: RepairState;
  undoStack: RepairState[];
}

function migrateRepairState(value: Partial<RepairState>): RepairState {
  const fallback = createInitialRepairState(value.webMcpStatus ?? "detecting");
  const applianceId =
    typeof value.applianceId === "string"
      ? (() => {
          try {
            return getCatalogEntry(value.applianceId).id;
          } catch {
            return null;
          }
        })()
      : null;
  const entry = applianceId ? getCatalogEntry(applianceId) : null;
  const requestedSymptom =
    value.symptomId ?? value.catalogSymptomId ?? entry?.symptomCoverage[0]?.symptomId ?? null;
  const resolvedPack =
    entry && requestedSymptom
      ? resolveRepairPack(entry.id, requestedSymptom as SupportedSymptomId)
      : value.packId && REPAIR_PACKS.has(value.packId)
        ? REPAIR_PACKS.get(value.packId)!
        : null;
  return {
    ...fallback,
    ...value,
    applianceId,
    packId: resolvedPack?.id ?? null,
    catalogSymptomId: (resolvedPack?.symptom.id as SupportedSymptomId | undefined) ?? null,
    symptomId: resolvedPack?.symptom.id ?? null,
    activity: Array.isArray(value.activity) ? value.activity : fallback.activity,
    catalogResultIds: Array.isArray(value.catalogResultIds)
      ? value.catalogResultIds
      : fallback.catalogResultIds,
    completedChecks: value.completedChecks ?? {},
  };
}

// This pure export is shared with migration tests; it does not hold component state.
// eslint-disable-next-line react-refresh/only-export-components
export function migrateStoredSession(value: unknown): StoredSession | null {
  try {
    if (!value || typeof value !== "object") return null;
    const parsed = value as {
      version?: number;
      state?: Partial<RepairState>;
      undoStack?: Array<Partial<RepairState>>;
    };
    if (![1, 2].includes(parsed.version ?? 0) || !parsed.state || !Array.isArray(parsed.undoStack))
      return null;
    const migrated = {
      version: 2,
      state: migrateRepairState(parsed.state),
      undoStack: parsed.undoStack.slice(-12).map(migrateRepairState),
    } satisfies StoredSession;
    if (
      !new Set(["catalog", "idle", "preparing", "checking", "result", "escalated"]).has(
        migrated.state.phase,
      )
    )
      return null;
    getRepairSnapshot(migrated.state);
    return migrated;
  } catch {
    return null;
  }
}

function loadStoredSession(): StoredSession {
  const fallback: StoredSession = {
    version: 2,
    state: createInitialRepairState(),
    undoStack: [],
  };
  try {
    if (typeof window === "undefined") return fallback;
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return fallback;
    if (stored.length > MAX_STORED_SESSION_BYTES) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return fallback;
    }
    return migrateStoredSession(JSON.parse(stored)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStoredSession(state: RepairState, undoStack: RepairState[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ version: 2, state, undoStack } satisfies StoredSession),
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
