import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";

import {
  getCatalogEntry,
  getCheck,
  getRepairPack,
  isBrandName,
  isCheckId,
  isComponentId,
  isResultForCheck,
  searchCatalog,
} from "./repairPack";
import { escalationForReason, escalationForResult } from "./safety";
import { getPartOutcome, getRepairSnapshot } from "./selectors";
import type {
  ActivityEvent,
  ActivitySource,
  BrandName,
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
    action: "catalog_ready",
    arguments: {},
    outcome: "accepted",
    message: `${APPLIANCE_CATALOG.length} source-backed washer families are ready to search.`,
  };
  return {
    packId: null,
    applianceId: null,
    productCode: null,
    catalogQuery: "",
    catalogBrand: null,
    catalogResultIds: APPLIANCE_CATALOG.map((entry) => entry.id),
    symptomId: null,
    phase: "catalog",
    currentStepId: null,
    highlightedComponentId: "machine",
    completedChecks: {},
    selectedPartId: null,
    partOutcomeRevealed: false,
    escalation: null,
    webMcpStatus,
    activity: [initialEvent],
    sequence: 0,
  };
}

export function withWebMcpStatus(state: RepairState, status: WebMcpStatus): RepairState {
  return { ...state, webMcpStatus: status };
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
  const loggedState = appendEvent(
    state,
    source,
    action,
    input,
    ok ? "accepted" : "rejected",
    message,
  );
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

function searchSupportedAppliances(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (input["modelQuery"] !== undefined && typeof input["modelQuery"] !== "string")
    return reject(
      state,
      source,
      "search_supported_appliances",
      input,
      "modelQuery must be a string.",
    );
  if (input["brand"] !== undefined && !isBrandName(input["brand"]))
    return reject(
      state,
      source,
      "search_supported_appliances",
      input,
      "Choose one of the six supported brands.",
    );
  const query =
    typeof input["modelQuery"] === "string" ? input["modelQuery"].trim().slice(0, 64) : "";
  const brand = (input["brand"] as BrandName | undefined) ?? null;
  const matches = searchCatalog(query, brand);
  const nextState = {
    ...state,
    catalogQuery: query,
    catalogBrand: brand,
    catalogResultIds: matches.map((entry) => entry.id),
  };
  const message = matches.length
    ? `Found ${matches.length} supported model ${matches.length === 1 ? "family" : "families"}.`
    : "No supported model matched. Clunk will not substitute a similar-looking appliance.";
  return result(nextState, source, "search_supported_appliances", input, true, message);
}

function selectAppliance(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (
    typeof input["applianceId"] !== "string" ||
    !APPLIANCE_CATALOG.some((entry) => entry.id === input["applianceId"])
  )
    return reject(
      state,
      source,
      "select_appliance",
      input,
      "Select an applianceId returned by search_supported_appliances.",
    );
  if (
    input["productCode"] !== undefined &&
    (typeof input["productCode"] !== "string" ||
      !input["productCode"].trim() ||
      input["productCode"].length > 64)
  )
    return reject(
      state,
      source,
      "select_appliance",
      input,
      "productCode must be a complete label value under 65 characters.",
    );
  const entry = getCatalogEntry(input["applianceId"]);
  const productCode =
    typeof input["productCode"] === "string" ? input["productCode"].trim().toUpperCase() : null;
  const nextState: RepairState = {
    ...state,
    packId: entry.id,
    applianceId: entry.id,
    productCode,
    symptomId: null,
    phase: "idle",
    currentStepId: null,
    highlightedComponentId: "machine",
    completedChecks: {},
    selectedPartId: null,
    partOutcomeRevealed: false,
    escalation: null,
  };
  return result(
    nextState,
    source,
    "select_appliance",
    input,
    true,
    `Selected ${entry.brand} ${entry.model}${productCode ? ` (${productCode})` : " at model-family level"}.`,
  );
}

function startDiagnosis(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (!state.applianceId || !state.packId)
    return reject(
      state,
      source,
      "start_diagnosis",
      input,
      "Select a supported appliance before starting.",
    );
  const pack = getRepairPack(state.packId);
  if (input["symptomId"] !== pack.symptom.id)
    return reject(
      state,
      source,
      "start_diagnosis",
      input,
      "This build supports the washer-will-not-drain symptom.",
    );
  const nextState: RepairState = {
    ...state,
    symptomId: input["symptomId"] as SymptomId,
    phase: "preparing",
    currentStepId: "prepare-power",
    highlightedComponentId: "machine",
    completedChecks: {},
    selectedPartId: null,
    partOutcomeRevealed: false,
    escalation: null,
  };
  return result(
    nextState,
    source,
    "start_diagnosis",
    input,
    true,
    "Diagnosis started with a mandatory power, heat, and leak check.",
  );
}

function showComponent(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (!isComponentId(state.packId, input["componentId"]))
    return reject(
      state,
      source,
      "show_component",
      input,
      "Choose a component from the selected repair pack.",
    );
  const nextState = { ...state, highlightedComponentId: input["componentId"] as ComponentId };
  return result(
    nextState,
    source,
    "show_component",
    input,
    true,
    `Focused the shared diagram on ${input["componentId"]}.`,
  );
}

function recordObservation(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (
    !state.packId ||
    !isCheckId(state.packId, input["checkId"]) ||
    typeof input["resultId"] !== "string"
  )
    return reject(
      state,
      source,
      "record_observation",
      input,
      "Provide the current checkId and one listed human observation.",
    );
  const checkId = input["checkId"] as CheckId;
  const resultId = input["resultId"] as ResultId;
  if (state.currentStepId !== checkId)
    return reject(
      state,
      source,
      "record_observation",
      input,
      "Observations can only be recorded for the current safe check.",
    );
  if (!isResultForCheck(state.packId, checkId, resultId))
    return reject(
      state,
      source,
      "record_observation",
      input,
      "That observation does not belong to the current check.",
    );
  const completedChecks = { ...state.completedChecks, [checkId]: resultId };
  let nextState: RepairState = {
    ...state,
    completedChecks,
    selectedPartId: null,
    partOutcomeRevealed: false,
  };
  const escalation = escalationForResult(resultId);
  if (escalation) {
    nextState = { ...nextState, phase: "escalated", currentStepId: null, escalation };
    return result(nextState, source, "record_observation", input, true, escalation.message);
  }
  const pack = getRepairPack(state.packId);
  const currentIndex = pack.checks.findIndex((check) => check.id === checkId);
  const shouldAdvance = resultId === "acknowledged" || resultId === "hose-clear";
  const nextCheck = shouldAdvance ? pack.checks[currentIndex + 1] : undefined;
  if (nextCheck) {
    nextState = {
      ...nextState,
      phase: "checking",
      currentStepId: nextCheck.id,
      highlightedComponentId: nextCheck.componentId,
    };
    return result(
      nextState,
      source,
      "record_observation",
      input,
      true,
      `Observation recorded. Next: ${nextCheck.label}.`,
    );
  }
  nextState = {
    ...nextState,
    phase: "result",
    currentStepId: null,
    highlightedComponentId: checkId === "inspect-drain-hose" ? "drain-hose" : "pump-filter",
  };
  return result(
    nextState,
    source,
    "record_observation",
    input,
    true,
    "Observation recorded. Clunk can now resolve the next safe outcome.",
  );
}

function findCompatiblePart(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  const outcome = getPartOutcome(state);
  if (!outcome || outcome.status === "not-ready")
    return reject(
      state,
      source,
      "find_compatible_part",
      input,
      "Complete the current safe observations before resolving a part outcome.",
    );
  const nextState: RepairState = {
    ...state,
    partOutcomeRevealed: true,
    selectedPartId: outcome.status === "exact" ? (outcome.part?.id ?? null) : null,
    highlightedComponentId:
      outcome.status === "exact" ? "drain-pump" : state.highlightedComponentId,
  };
  return result(nextState, source, "find_compatible_part", input, true, outcome.message);
}

function stopAndEscalate(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
): ToolExecutionResult {
  if (
    typeof input["reason"] !== "string" ||
    !ESCALATION_REASONS.has(input["reason"] as EscalationReason)
  )
    return reject(
      state,
      source,
      "stop_and_escalate",
      input,
      "Choose a supported safety or service reason.",
    );
  const escalation = escalationForReason(input["reason"] as EscalationReason);
  const nextState: RepairState = { ...state, phase: "escalated", currentStepId: null, escalation };
  return result(nextState, source, "stop_and_escalate", input, true, escalation.message);
}

export function executeRepairTool(
  state: RepairState,
  action: RepairToolName,
  input: Record<string, unknown> = {},
  source: ActivitySource = "agent",
): ToolExecutionResult {
  switch (action) {
    case "search_supported_appliances":
      return searchSupportedAppliances(state, input, source);
    case "select_appliance":
      return selectAppliance(state, input, source);
    case "get_repair_state":
      return result(
        state,
        source,
        action,
        input,
        true,
        "Returned current state, visible catalog results, sources, and permitted next tools.",
      );
    case "start_diagnosis":
      return startDiagnosis(state, input, source);
    case "show_component":
      return showComponent(state, input, source);
    case "record_observation":
      return recordObservation(state, input, source);
    case "find_compatible_part":
      return findCompatiblePart(state, input, source);
    case "stop_and_escalate":
      return stopAndEscalate(state, input, source);
  }
}
