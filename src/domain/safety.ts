import type { Escalation, EscalationReason, RepairPackCheck, ResultId } from "./types";

const ESCALATION_COPY: Record<EscalationReason, string> = {
  electrical:
    "Stop using the washer, keep it disconnected from power, and contact a qualified appliance professional.",
  "burning-smell":
    "Stop. Keep the washer disconnected from power and contact a qualified appliance professional about the smoke or burning smell.",
  "hot-water":
    "Stop. Do not open the filter while the washer or retained water is hot. Contact a qualified appliance professional.",
  "active-leak":
    "Stop. Keep clear of water near power, disconnect power only if it is already safe to do so, and contact a qualified professional.",
  "internal-access":
    "Stop at the user-access boundary. Do not move the washer or remove panels; a qualified appliance professional should continue.",
  unresolved:
    "The safe visible checks did not isolate a user-serviceable cause. Keep the washer disconnected and contact a qualified appliance professional.",
};

const RESULT_ESCALATIONS: Partial<Record<ResultId, EscalationReason>> = {
  "hazard-burning": "burning-smell",
  "hazard-hot-water": "hot-water",
  "hazard-active-leak": "active-leak",
  "unsafe-to-reach": "internal-access",
  "filter-damaged": "internal-access",
  "unsafe-to-open": "internal-access",
};

const PERMITTED_SAFETY_TAGS = new Set([
  "power-disconnected",
  "external-observation",
  "water-release",
  "user-access-door",
]);

export function escalationForReason(reason: EscalationReason): Escalation {
  return { reason, message: ESCALATION_COPY[reason] };
}

export function escalationForResult(resultId: ResultId): Escalation | null {
  const reason = RESULT_ESCALATIONS[resultId];
  return reason ? escalationForReason(reason) : null;
}

export function assertSafeRepairStep(check: RepairPackCheck): RepairPackCheck {
  for (const tag of check.safetyTags) {
    if (!PERMITTED_SAFETY_TAGS.has(tag)) {
      throw new Error(`Repair step ${check.id} uses an unsupported safety tag: ${tag}.`);
    }
  }

  return check;
}

export function canShowCheck(
  currentStepId: RepairPackCheck["id"] | null,
  requestedStepId: RepairPackCheck["id"],
  completedStepIds: RepairPackCheck["id"][],
): boolean {
  return currentStepId === requestedStepId || completedStepIds.includes(requestedStepId);
}
