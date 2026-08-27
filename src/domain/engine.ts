import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";

import {
  getCatalogEntry,
  getCheck,
  getRepairPack,
  isApplianceKind,
  isBrandName,
  isCheckId,
  isComponentId,
  isResultForCheck,
  searchCatalog,
} from "./repairPack";
import { escalationForReason } from "./safety";
import { getPartOutcome, getRepairSnapshot } from "./selectors";
import type {
  ActivityEvent,
  ActivitySource,
  ApplianceKind,
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
    message: `${APPLIANCE_CATALOG.length} appliances across four categories are ready.`,
  };
  return {
    packId: null,
    applianceId: null,
    productCode: null,
    catalogQuery: "",
    catalogBrand: null,
    catalogKind: "dryer",
    catalogResultIds: APPLIANCE_CATALOG.filter((entry) => entry.kind === "dryer").map(
      (entry) => entry.id,
    ),
    symptomId: null,
    phase: "catalog",
    currentStepId: null,
    highlightedComponentId: "machine",
    completedChecks: {},
    selectedPartId: null,
    partOutcomeRevealed: false,
    exampleMode: false,
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

function response(
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
) {
  return response(state, source, action, input, false, message);
}

function searchSupportedAppliances(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
) {
  if (input["modelQuery"] !== undefined && typeof input["modelQuery"] !== "string")
    return reject(
      state,
      source,
      "search_supported_appliances",
      input,
      "modelQuery must be a string.",
    );
  if (input["brand"] !== undefined && !isBrandName(input["brand"]))
    return reject(state, source, "search_supported_appliances", input, "Choose a supported brand.");
  if (input["kind"] !== undefined && !isApplianceKind(input["kind"]))
    return reject(
      state,
      source,
      "search_supported_appliances",
      input,
      "Choose washer, dishwasher, dryer, or refrigerator.",
    );
  const query =
    typeof input["modelQuery"] === "string" ? input["modelQuery"].trim().slice(0, 64) : "";
  const brand = (input["brand"] as BrandName | undefined) ?? null;
  const kind = (input["kind"] as ApplianceKind | undefined) ?? null;
  const matches = searchCatalog(query, brand, kind);
  const nextState = {
    ...state,
    catalogQuery: query,
    catalogBrand: brand,
    catalogKind: kind,
    catalogResultIds: matches.map((entry) => entry.id),
  };
  const noun = kind ?? "appliance";
  const message = matches.length
    ? `Found ${matches.length} matching ${noun}${matches.length === 1 ? "" : "s"}.`
    : `No matching ${noun} found.`;
  return response(nextState, source, "search_supported_appliances", input, true, message);
}

function selectAppliance(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
) {
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
    catalogKind: entry.kind,
    symptomId: null,
    phase: "idle",
    currentStepId: null,
    highlightedComponentId: "machine",
    completedChecks: {},
    selectedPartId: null,
    partOutcomeRevealed: false,
    exampleMode: source === "example",
    escalation: null,
  };
  return response(
    nextState,
    source,
    "select_appliance",
    input,
    true,
    `Selected ${entry.brand} ${entry.model}${productCode ? ` with full model number ${productCode}` : ""}.`,
  );
}

function startDiagnosis(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
) {
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
      `This repair pack supports: ${pack.symptom.label}.`,
    );
  const firstCheck = pack.checks[0]!;
  const nextState: RepairState = {
    ...state,
    symptomId: input["symptomId"] as SymptomId,
    phase: "preparing",
    currentStepId: firstCheck.id,
    highlightedComponentId: firstCheck.componentId,
    completedChecks: {},
    selectedPartId: null,
    partOutcomeRevealed: false,
    exampleMode: source === "example" ? true : false,
    escalation: null,
  };
  return response(
    nextState,
    source,
    "start_diagnosis",
    input,
    true,
    `Started ${pack.symptom.label.toLowerCase()} with the safety check.`,
  );
}

function showComponent(state: RepairState, input: Record<string, unknown>, source: ActivitySource) {
  if (!isComponentId(state.packId, input["componentId"]))
    return reject(
      state,
      source,
      "show_component",
      input,
      "Choose a component from the selected repair pack.",
    );
  return response(
    { ...state, highlightedComponentId: input["componentId"] as ComponentId },
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
) {
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
      "Provide the current checkId and one listed observation.",
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
  const check = getCheck(state.packId, checkId);
  const observed = check.results.find((item) => item.id === resultId)!;
  let nextState: RepairState = {
    ...state,
    completedChecks: { ...state.completedChecks, [checkId]: resultId },
    selectedPartId: null,
    partOutcomeRevealed: false,
    exampleMode: source === "example" ? true : false,
  };
  if (observed.effect === "hazard") {
    const escalation = escalationForReason(observed.escalationReason ?? "unresolved");
    nextState = { ...nextState, phase: "escalated", currentStepId: null, escalation };
    return response(nextState, source, "record_observation", input, true, escalation.message);
  }
  if (observed.effect === "continue" && observed.nextCheckId) {
    const nextCheck = getCheck(state.packId, observed.nextCheckId);
    nextState = {
      ...nextState,
      phase: "checking",
      currentStepId: nextCheck.id,
      highlightedComponentId: nextCheck.componentId,
    };
    return response(
      nextState,
      source,
      "record_observation",
      input,
      true,
      `Next: ${nextCheck.label}.`,
    );
  }
  nextState = {
    ...nextState,
    phase: "result",
    currentStepId: null,
    highlightedComponentId: observed.focusComponentId ?? check.componentId,
  };
  return response(
    nextState,
    source,
    "record_observation",
    input,
    true,
    observed.outcomeMessage ?? "Checks complete. The answer is ready.",
  );
}

function findCompatiblePart(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
) {
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
      outcome.status === "exact"
        ? (outcome.part?.componentId ?? state.highlightedComponentId)
        : state.highlightedComponentId,
    exampleMode: source === "example" ? true : false,
  };
  return response(nextState, source, "find_compatible_part", input, true, outcome.message);
}

function stopAndEscalate(
  state: RepairState,
  input: Record<string, unknown>,
  source: ActivitySource,
) {
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
  const nextState: RepairState = {
    ...state,
    phase: "escalated",
    currentStepId: null,
    escalation,
    exampleMode: false,
  };
  return response(nextState, source, "stop_and_escalate", input, true, escalation.message);
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
      return {
        ok: true,
        state,
        message: "Returned the current shared repair state and permitted next tools.",
        snapshot: getRepairSnapshot(state),
      };
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
