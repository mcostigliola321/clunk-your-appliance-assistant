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
  "Check the full model number before ordering. If anything looks unsafe, stop and call a qualified appliance technician.";

export function getPartOutcome(state: RepairState): PartOutcome | null {
  if (!state.packId || state.phase !== "result") return null;
  const pack = getRepairPack(state.packId);
  const hose = state.completedChecks["inspect-drain-hose"];
  const filter = state.completedChecks["inspect-pump-filter"];

  if (hose === "hose-kinked") {
    return {
      status: "no-part-needed",
      title: "You probably don't need a part",
      message:
        "Straighten the visible drain hose without moving the washer, then run a short drain cycle.",
      part: null,
      requiredProductCode: null,
      source: pack.sources.find((item) => item.kind === "manufacturer-troubleshooting") ?? null,
    };
  }
  if (hose === "hose-disconnected") {
    return {
      status: "professional-only",
      title: "Stop here and call a technician",
      message: "The hose looks loose or damaged and could leak if the washer runs.",
      part: null,
      requiredProductCode: pack.productCodePrompt,
      source: pack.sources.find((item) => item.kind === "manufacturer-troubleshooting") ?? null,
    };
  }
  if (filter === "filter-blocked") {
    return {
      status: "no-part-needed",
      title: "You probably don't need a part",
      message:
        "The blockage you found can keep the washer from draining. Clean the filter, reinstall it, and test the washer.",
      part: null,
      requiredProductCode: null,
      source: pack.sources.find((item) => item.id.includes("filter")) ?? null,
    };
  }
  if (hose === "hose-clear" && !pack.checks.some((check) => check.id === "inspect-pump-filter")) {
    return {
      status: "professional-only",
      title: "A technician needs to check inside",
      message:
        "The outside hose looks clear, but this washer has no filter you can safely check from the outside.",
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
        title: "This is the part for your washer",
        message:
          "The hose and filter look clear, so the drain pump is the most likely part to check next.",
        part,
        requiredProductCode: null,
        source: part.source,
      };
    }
    return {
      status: "variant-needed",
      title: "We need the full model number",
      message: part
        ? "The letters after the main model number can change which part fits. Find the complete number on the appliance label."
        : "The outside checks point to a problem inside the washer, but Clunk does not have a verified part link for this model yet.",
      part: null,
      requiredProductCode: pack.productCodePrompt,
      source: pack.sources.find((item) => item.kind === "manufacturer-model") ?? null,
    };
  }
  return {
    status: "not-ready",
    title: "One more check needed",
    message: "Finish the check on screen and Clunk will show the best next step.",
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
        ? "Full model number confirmed"
        : "Washer model found"
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
