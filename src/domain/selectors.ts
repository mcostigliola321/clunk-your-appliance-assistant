import { deriveCauses } from "./diagnosis";
import { getCheck, getComponent, getPart, repairPack } from "./repairPack";
import type { PartId, RepairSnapshot, RepairState } from "./types";

export const FICTIONAL_DISCLAIMER =
  "Clunk WM-01, its diagnosis, parts, prices, and compatibility are fictional demonstration data—not real repair advice.";

export function getAvailablePartId(state: RepairState): PartId | null {
  const hoseResult = state.completedChecks["inspect-drain-hose"];
  const filterResult = state.completedChecks["inspect-pump-filter"];

  if (filterResult === "filter-blocked") {
    return "cl-pf-220";
  }

  if (hoseResult === "hose-kinked" || hoseResult === "hose-disconnected") {
    return "cl-dh-208";
  }

  if (hoseResult === "hose-clear" && filterResult === "filter-clear") {
    return "cl-dp-420";
  }

  return null;
}

export function getProgress(state: RepairState): number {
  if (state.escalation || state.selectedPartId) return 100;
  if (state.phase === "result") return 90;
  if (state.completedChecks["inspect-pump-filter"]) return 80;
  if (state.completedChecks["inspect-drain-hose"]) return 60;
  if (state.completedChecks["prepare-power"]) return 40;
  if (state.phase === "preparing" || state.phase === "checking") return 25;
  if (state.applianceId) return 10;
  return 0;
}

export function getValidNextActions(state: RepairState): string[] {
  if (state.escalation) return ["get_repair_state"];
  if (!state.applianceId) return ["identify_appliance"];
  if (!state.symptomId) return ["start_diagnosis"];
  if (state.currentStepId) {
    return [
      "show_repair_step",
      "record_check_result",
      "highlight_component",
      "escalate_to_professional",
    ];
  }
  if (getAvailablePartId(state)) {
    return ["find_compatible_part", "highlight_component", "escalate_to_professional"];
  }
  return ["get_repair_state", "escalate_to_professional"];
}

export function getRepairSnapshot(state: RepairState): RepairSnapshot {
  const availablePartId = getAvailablePartId(state);

  return {
    appliance: state.applianceId
      ? `${repairPack.appliance.name} ${repairPack.appliance.model}`
      : null,
    fictional: true,
    symptom: state.symptomId ? repairPack.symptom.label : null,
    phase: state.phase,
    progress: getProgress(state),
    currentStep: state.currentStepId ? getCheck(state.currentStepId) : null,
    highlightedComponent: getComponent(state.highlightedComponentId),
    completedChecks: { ...state.completedChecks },
    likelyCauses: deriveCauses(state),
    availablePart: availablePartId ? getPart(availablePartId) : null,
    selectedPart: state.selectedPartId ? getPart(state.selectedPartId) : null,
    escalation: state.escalation,
    webMcpStatus: state.webMcpStatus,
    validNextActions: getValidNextActions(state),
    disclaimer: FICTIONAL_DISCLAIMER,
  };
}
