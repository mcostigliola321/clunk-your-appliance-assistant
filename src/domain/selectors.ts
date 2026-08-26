import { deriveCauses } from "./diagnosis";
import {
  getCatalogEntry,
  getCheck,
  getComponent,
  getPart,
  getRepairPack,
  normalizeModel,
} from "./repairPack";
import type { PartOutcome, RepairSnapshot, RepairState, RepairToolName } from "./types";

export const REAL_DATA_DISCLAIMER =
  "Educational troubleshooting only. Confirm the complete model code with the manufacturer or a qualified professional before buying a part. Clunk does not guarantee diagnosis, compatibility, or repair.";

export function getPartOutcome(state: RepairState): PartOutcome | null {
  if (!state.packId || state.phase !== "result") return null;
  const pack = getRepairPack(state.packId);
  const hose = state.completedChecks["inspect-drain-hose"];
  const filter = state.completedChecks["inspect-pump-filter"];

  if (hose === "hose-kinked") {
    return {
      status: "no-part-needed",
      title: "No part indicated",
      message:
        "The visible drain path is restricted. Correct only the external hose placement described by the manufacturer, then test the washer.",
      part: null,
      requiredProductCode: null,
      source: pack.sources.find((item) => item.kind === "manufacturer-troubleshooting") ?? null,
    };
  }
  if (hose === "hose-disconnected") {
    return {
      status: "professional-only",
      title: "Service boundary",
      message:
        "A loose or damaged hose needs a leak-safe inspection before any part can be identified.",
      part: null,
      requiredProductCode: pack.productCodePrompt,
      source: pack.sources.find((item) => item.kind === "manufacturer-troubleshooting") ?? null,
    };
  }
  if (filter === "filter-blocked") {
    return {
      status: "no-part-needed",
      title: "Cleanable blockage found",
      message:
        "The reported debris is a sufficient explanation to clean and reinstall the documented filter before considering a replacement part.",
      part: null,
      requiredProductCode: null,
      source: pack.sources.find((item) => item.id.includes("filter")) ?? null,
    };
  }
  if (hose === "hose-clear" && !pack.checks.some((check) => check.id === "inspect-pump-filter")) {
    return {
      status: "professional-only",
      title: "Visible checks exhausted",
      message:
        "This manufacturer path does not expose a verified user-accessible filter. A professional must isolate the internal cause before a part is named.",
      part: null,
      requiredProductCode: pack.productCodePrompt,
      source: pack.sources.find((item) => item.kind === "manufacturer-troubleshooting") ?? null,
    };
  }
  if (hose === "hose-clear" && filter === "filter-clear") {
    const part = pack.parts[0] ?? null;
    const exact = Boolean(
      part &&
      state.productCode &&
      part.compatibleProductCodes.map(normalizeModel).includes(normalizeModel(state.productCode)),
    );
    if (exact && part) {
      return {
        status: "exact",
        title: "Exact part match",
        message:
          "The complete product code appears in the cited compatibility source. Diagnosis is still unconfirmed and installation remains professional-only.",
        part,
        requiredProductCode: null,
        source: part.source,
      };
    }
    return {
      status: "variant-needed",
      title: "Product code required",
      message: part
        ? "Clunk has a verified part mapping for a specific product-code variant, but will not apply it to the family model alone."
        : "The safe checks implicate an internal drain-path fault, but this pack has no verified exact-part mapping.",
      part: null,
      requiredProductCode: pack.productCodePrompt,
      source: pack.sources.find((item) => item.kind === "manufacturer-model") ?? null,
    };
  }
  return {
    status: "not-ready",
    title: "More evidence required",
    message: "Complete the current safe observation before resolving whether a part is needed.",
    part: null,
    requiredProductCode: null,
    source: null,
  };
}

export function getProgress(state: RepairState): number {
  if (state.escalation || state.partOutcomeRevealed) return 100;
  if (state.phase === "result") return 90;
  if (state.completedChecks["inspect-pump-filter"]) return 80;
  if (state.completedChecks["inspect-drain-hose"]) return 60;
  if (state.completedChecks["prepare-power"]) return 40;
  if (state.phase === "preparing" || state.phase === "checking") return 25;
  if (state.applianceId) return 10;
  return 0;
}

export function getValidNextActions(state: RepairState): RepairToolName[] {
  if (!state.applianceId)
    return ["get_repair_state", "search_supported_appliances", "select_appliance"];
  if (state.escalation)
    return ["get_repair_state", "search_supported_appliances", "select_appliance"];
  if (!state.symptomId)
    return [
      "get_repair_state",
      "search_supported_appliances",
      "select_appliance",
      "start_diagnosis",
    ];
  if (state.currentStepId)
    return ["get_repair_state", "show_component", "record_observation", "stop_and_escalate"];
  if (state.phase === "result")
    return ["get_repair_state", "show_component", "find_compatible_part", "stop_and_escalate"];
  return ["get_repair_state"];
}

export function getToolAvailabilityKey(state: RepairState): string {
  return getValidNextActions(state).join("|");
}

export function getRepairSnapshot(state: RepairState): RepairSnapshot {
  const pack = state.packId ? getRepairPack(state.packId) : null;
  const outcome = getPartOutcome(state);
  return {
    catalogQuery: state.catalogQuery,
    catalogResults: state.catalogResultIds.map((id) => {
      const entry = getCatalogEntry(id);
      return {
        id: entry.id,
        brand: entry.brand,
        model: entry.model,
        label: entry.label,
        productCodePrompt: entry.productCodePrompt,
      };
    }),
    appliance: pack ? `${pack.appliance.brand} ${pack.appliance.model}` : null,
    productCode: state.productCode,
    verificationLabel: pack
      ? state.productCode &&
        pack.verifiedProductCodes.map(normalizeModel).includes(normalizeModel(state.productCode))
        ? "Complete code verified"
        : "Model family verified"
      : null,
    symptom: state.symptomId ? (pack?.symptom.label ?? null) : null,
    phase: state.phase,
    progress: getProgress(state),
    currentStep:
      state.currentStepId && state.packId ? getCheck(state.packId, state.currentStepId) : null,
    highlightedComponent: getComponent(state.packId, state.highlightedComponentId),
    completedChecks: { ...state.completedChecks },
    likelyCauses: deriveCauses(state),
    partOutcome: state.partOutcomeRevealed ? outcome : null,
    selectedPart:
      state.selectedPartId && state.packId ? getPart(state.packId, state.selectedPartId) : null,
    sources: pack?.sources ?? [],
    escalation: state.escalation,
    webMcpStatus: state.webMcpStatus,
    validNextActions: getValidNextActions(state),
    disclaimer: REAL_DATA_DISCLAIMER,
  };
}
