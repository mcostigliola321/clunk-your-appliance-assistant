import {
  getCheck,
  isCheckId,
  isComponentId,
  isResultForCheck,
  repairPack,
} from "./repairPack";
import { assertSafeRepairStep, canShowCheck, escalationForReason, escalationForResult } from "./safety";
import { getAvailablePartId, getRepairSnapshot } from "./selectors";
import type {
  ActivityEvent,
  ActivitySource,
  ApplianceId,
  CheckId,
  ComponentId,
  EscalationReason,
  RepairState,
  RepairToolName,
  ResultId,
  SymptomId,
  ToolExecutionResult,
  WebMcpStatus,
} from "./types";

const ESCALATION_REASONS = new Set<EscalationReason>([
  "electrical",
  "burning-smell",
  "hot-water",
  "active-leak",
  "internal-access",
  "unresolved",
]);

export function createInitialRepairState(webMcpStatus: WebMcpStatus = "detecting"): RepairState {
  const initialEvent: ActivityEvent = {
    id: "event-0",
    sequence: 0,
    source: "system",
    action: "bench_ready",
    arguments: {},
    outcome: "accepted",
    message: "Repair bench ready. No diagnosis has started.",
  };

  return {
    packId: "clunk-wm01",
    applianceId: null,
    symptomId: null,
    phase: "idle",
    currentStepId: null,
    highlightedComponentId: "machine",
    completedChecks: {},
    selectedPartId: null,
    escalation: null,
    webMcpStatus,
    activity: [initialEvent],
    sequence: 0,
  };
}

export function withWebMcpStatus(state: RepairState, status: WebMcpStatus): RepairState {
  return { ...state, webMcpStatus: status };
}

function isString(input: Record<string, unknown>, key: string): input is Record<string, string> {
  return typeof input[key] === "string";
}

function appendEvent(
  state: RepairState,
  source: ActivitySource,
  action: string,
  input: Record<string, unknown>,
  outcome: ActivityEvent["outcome"],
  message: string,
): RepairState {
  const sequence = state.sequence + 1;
  return {
    ...state,
    sequence,
    activity: [
      ...state.activity,
      {
        id: `event-${sequence}`,
        sequence,
        source,
        action,
        arguments: { ...input },
        outcome,
        message,
      },
    ],
  };
}

function result(
  state: RepairState,
  source: ActivitySource,
  action: RepairToolName,
  input: Record<string, unknown>,
  ok: boolean,
  message: string,
): ToolExecutionResult {
  const loggedState = appendEvent(state, source, action, input, ok ? "accepted" : "rejected", message);
  return { ok, state: loggedState, message, snapshot: getRepairSnapshot(loggedState) };
}

function reject(
  state: RepairState,
  source: ActivitySource,
  action: RepairToolName,
  input: Record<string, unknown>,
  message: string,
): ToolExecutionResult {
  return result(state, source, action, input, false, message);
}

function identifyAppliance(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (!isString(input, "applianceId") || input["applianceId"] !== "clunk-wm01") {
    return reject(state, source, "identify_appliance", input, "Only the fictional Clunk WM-01 is supported in this demo.");
  }

  const nextState: RepairState = {
    ...state,
    applianceId: input["applianceId"] as ApplianceId,
    highlightedComponentId: "machine",
  };
  return result(nextState, source, "identify_appliance", input, true, "Identified the fictional Clunk WM-01 washer.");
}

function startDiagnosis(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (!state.applianceId) {
    return reject(state, source, "start_diagnosis", input, "Identify the appliance before starting a diagnosis.");
  }
  if (!isString(input, "symptomId") || input["symptomId"] !== repairPack.symptom.id) {
    return reject(state, source, "start_diagnosis", input, "This demo supports only the washer-will-not-drain symptom.");
  }

  const nextState: RepairState = {
    ...state,
    symptomId: input["symptomId"] as SymptomId,
    phase: "preparing",
    currentStepId: "prepare-power",
    highlightedComponentId: "machine",
    completedChecks: {},
    selectedPartId: null,
    escalation: null,
  };
  return result(nextState, source, "start_diagnosis", input, true, "Diagnosis started with a mandatory power and hazard check.");
}

function highlightComponent(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (!isComponentId(input["componentId"])) {
    return reject(state, source, "highlight_component", input, "Choose a component from the Clunk WM-01 repair pack.");
  }
  const nextState: RepairState = { ...state, highlightedComponentId: input["componentId"] as ComponentId };
  return result(nextState, source, "highlight_component", input, true, `Highlighted ${input["componentId"]}.`);
}

function recordCheckResult(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (!isCheckId(input["checkId"]) || typeof input["resultId"] !== "string") {
    return reject(state, source, "record_check_result", input, "Provide a valid current check and one of its listed observations.");
  }
  const checkId = input["checkId"] as CheckId;
  const resultId = input["resultId"] as ResultId;
  if (state.currentStepId !== checkId) {
    return reject(state, source, "record_check_result", input, "Results can only be recorded for the current safe check.");
  }
  if (!isResultForCheck(checkId, resultId)) {
    return reject(state, source, "record_check_result", input, "That observation does not belong to the current check.");
  }

  const escalation = escalationForResult(resultId);
  const completedChecks = { ...state.completedChecks, [checkId]: resultId };
  let nextState: RepairState = {
    ...state,
    completedChecks,
    selectedPartId: null,
  };

  if (escalation) {
    nextState = {
      ...nextState,
      phase: "escalated",
      currentStepId: null,
      escalation,
    };
    return result(nextState, source, "record_check_result", input, true, escalation.message);
  }

  if (checkId === "prepare-power" && resultId === "acknowledged") {
    nextState = {
      ...nextState,
      phase: "checking",
      currentStepId: "inspect-drain-hose",
      highlightedComponentId: "drain-hose",
    };
    return result(nextState, source, "record_check_result", input, true, "Power is disconnected. Next, inspect only the visible drain hose.");
  }

  if (checkId === "inspect-drain-hose" && resultId === "hose-clear") {
    nextState = {
      ...nextState,
      phase: "checking",
      currentStepId: "inspect-pump-filter",
      highlightedComponentId: "pump-filter",
    };
    return result(nextState, source, "record_check_result", input, true, "The visible hose looks clear. Next, inspect the user-accessible pump filter.");
  }

  nextState = {
    ...nextState,
    phase: "result",
    currentStepId: null,
    highlightedComponentId: checkId === "inspect-drain-hose" ? "drain-hose" : "pump-filter",
  };
  return result(nextState, source, "record_check_result", input, true, "Observation recorded. Clunk has isolated the strongest matching cause.");
}

function showRepairStep(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (!isCheckId(input["checkId"])) {
    return reject(state, source, "show_repair_step", input, "Choose a valid safe check from the repair pack.");
  }
  const checkId = input["checkId"] as CheckId;
  if (!canShowCheck(state.currentStepId, checkId, Object.keys(state.completedChecks) as CheckId[])) {
    return reject(state, source, "show_repair_step", input, "That step is not available at this point in the diagnosis.");
  }
  const check = assertSafeRepairStep(getCheck(checkId));
  const nextState: RepairState = { ...state, highlightedComponentId: check.componentId };
  return result(nextState, source, "show_repair_step", input, true, check.instruction);
}

function findCompatiblePart(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  const partId = getAvailablePartId(state);
  if (!partId) {
    return reject(state, source, "find_compatible_part", input, "Complete the safe checks before matching a fictional part.");
  }
  const nextState: RepairState = { ...state, selectedPartId: partId };
  return result(nextState, source, "find_compatible_part", input, true, `Matched fictional demo part ${partId.toUpperCase()}.`);
}

function escalateToProfessional(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (!isString(input, "reason") || !ESCALATION_REASONS.has(input["reason"] as EscalationReason)) {
    return reject(state, source, "escalate_to_professional", input, "Choose a supported safety or service reason.");
  }
  const escalation = escalationForReason(input["reason"] as EscalationReason);
  const nextState: RepairState = {
    ...state,
    phase: "escalated",
    currentStepId: null,
    escalation,
  };
  return result(nextState, source, "escalate_to_professional", input, true, escalation.message);
}

export function executeRepairTool(
  state: RepairState,
  action: RepairToolName,
  input: Record<string, unknown> = {},
  source: ActivitySource = "agent",
): ToolExecutionResult {
  switch (action) {
    case "get_repair_state":
      return result(state, source, action, input, true, "Returned the current shared repair state.");
    case "identify_appliance":
      return identifyAppliance(state, input, source);
    case "start_diagnosis":
      return startDiagnosis(state, input, source);
    case "highlight_component":
      return highlightComponent(state, input, source);
    case "record_check_result":
      return recordCheckResult(state, input, source);
    case "show_repair_step":
      return showRepairStep(state, input, source);
    case "find_compatible_part":
      return findCompatiblePart(state, input, source);
    case "escalate_to_professional":
      return escalateToProfessional(state, input, source);
  }
}
