import { getRepairPack } from "./repairPack";
import type { CauseId, RankedCause, RepairState, ResultId } from "./types";

interface CauseEvidence {
  score: number;
  confidence: RankedCause["confidence"];
  explanation: string;
}

function initialEvidence(hasFilterCheck: boolean): Record<CauseId, CauseEvidence> {
  return {
    "blocked-filter": {
      score: hasFilterCheck ? 40 : 22,
      confidence: "possible",
      explanation: hasFilterCheck
        ? "Coins, lint, or other debris may be blocking the drain filter."
        : "Something inside the drain path may be blocked, but this washer has no outside filter to check.",
    },
    "kinked-hose": {
      score: 35,
      confidence: "likely",
      explanation: "A bent or badly placed hose can stop water from leaving the washer.",
    },
    "drain-pump-failure": {
      score: 25,
      confidence: "possible",
      explanation: "The drain pump may not be pushing water out of the washer.",
    },
    "control-fault": {
      score: 10,
      confidence: "possible",
      explanation: "The washer's controls may need to be checked by a technician.",
    },
  };
}

function applyResult(evidence: Record<CauseId, CauseEvidence>, result: ResultId): void {
  if (result === "hose-kinked" || result === "hose-disconnected") {
    evidence["kinked-hose"] = {
      score: 100,
      confidence: "strong match",
      explanation: "The hose you saw can explain why the washer is not draining.",
    };
    evidence["blocked-filter"].score = 10;
    evidence["drain-pump-failure"].score = 8;
  }
  if (result === "hose-clear") {
    evidence["kinked-hose"] = {
      score: 5,
      confidence: "possible",
      explanation: "The hose looks clear, so the problem is probably somewhere else.",
    };
    evidence["blocked-filter"].score += 20;
    evidence["drain-pump-failure"].score += 25;
  }
  if (result === "filter-blocked") {
    evidence["blocked-filter"] = {
      score: 100,
      confidence: "strong match",
      explanation: "The debris you found can stop the washer from draining.",
    };
    evidence["drain-pump-failure"].score = 10;
    evidence["control-fault"].score = 5;
  }
  if (result === "filter-clear") {
    evidence["blocked-filter"] = {
      score: 5,
      confidence: "possible",
      explanation: "The filter looks clear, so a blockage there is less likely.",
    };
    evidence["drain-pump-failure"] = {
      score: 100,
      confidence: "strong match",
      explanation:
        "With the hose and filter clear, the drain pump is the most likely part to check next.",
    };
    evidence["control-fault"] = {
      score: 45,
      confidence: "possible",
      explanation: "The washer's controls are another possibility and need a technician to check.",
    };
  }
}

export function deriveCauses(state: RepairState): RankedCause[] {
  if (!state.packId) return [];
  const pack = getRepairPack(state.packId);
  const evidence = initialEvidence(pack.checks.some((check) => check.id === "inspect-pump-filter"));
  for (const result of Object.values(state.completedChecks))
    if (result) applyResult(evidence, result);
  return pack.causes
    .map((cause) => ({ ...cause, ...evidence[cause.id] }))
    .sort((left, right) => right.score - left.score);
}
