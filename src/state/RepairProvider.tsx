import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

import { createInitialRepairState, executeRepairTool, withWebMcpStatus } from "@/domain/engine";
import { getRepairSnapshot } from "@/domain/selectors";
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
  setWebMcpStatus: (status: WebMcpStatus) => void;
}

type StateAction = { type: "replace"; state: RepairState };

function repairReducer(_state: RepairState, action: StateAction): RepairState {
  return action.state;
}

const RepairContext = createContext<RepairContextValue | null>(null);

export function RepairProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(repairReducer, undefined, () => createInitialRepairState());
  const stateRef = useRef(state);
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
      const execution = executeRepairTool(stateRef.current, name, input, source);
      replaceState(execution.state);
      return execution;
    },
    [replaceState],
  );

  const reset = useCallback(() => {
    replaceState(createInitialRepairState(stateRef.current.webMcpStatus));
  }, [replaceState]);

  const setWebMcpStatus = useCallback(
    (status: WebMcpStatus) => {
      replaceState(withWebMcpStatus(stateRef.current, status));
    },
    [replaceState],
  );

  useEffect(() => {
    const controller = registerClunkTools(invokeTool, setWebMcpStatus);
    return () => controller?.abort();
  }, [invokeTool, setWebMcpStatus]);

  const value = useMemo<RepairContextValue>(
    () => ({
      state,
      snapshot: getRepairSnapshot(state),
      invokeTool,
      reset,
      setWebMcpStatus,
    }),
    [invokeTool, reset, setWebMcpStatus, state],
  );

  return <RepairContext.Provider value={value}>{children}</RepairContext.Provider>;
}

export function useRepair(): RepairContextValue {
  const value = useContext(RepairContext);
  if (!value) {
    throw new Error("useRepair must be used inside RepairProvider.");
  }
  return value;
}
