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
        ? "The selected manufacturer documents a user-accessible filter for this configuration."
        : "An internal restriction remains possible, but Clunk does not expose a filter check for this model family.",
    },
    "kinked-hose": {
      score: 35,
      confidence: "likely",
      explanation: "A visible kink or incorrect standpipe connection can restrict drainage.",
    },
    "drain-pump-failure": {
      score: 25,
      confidence: "possible",
      explanation: "The internal pump remains possible after external restrictions are excluded.",
    },
    "control-fault": {
      score: 10,
      confidence: "possible",
      explanation: "Internal electrical causes require professional diagnosis.",
    },
  };
}

function applyResult(evidence: Record<CauseId, CauseEvidence>, result: ResultId): void {
  if (result === "hose-kinked" || result === "hose-disconnected") {
    evidence["kinked-hose"] = {
      score: 100,
      confidence: "strong match",
      explanation:
        "Your visible observation directly matches a restricted or damaged external drain path.",
    };
    evidence["blocked-filter"].score = 10;
    evidence["drain-pump-failure"].score = 8;
  }
  if (result === "hose-clear") {
    evidence["kinked-hose"] = {
      score: 5,
      confidence: "possible",
      explanation: "The visible hose looks clear, so an external restriction is less likely.",
    };
    evidence["blocked-filter"].score += 20;
    evidence["drain-pump-failure"].score += 25;
  }
  if (result === "filter-blocked") {
    evidence["blocked-filter"] = {
      score: 100,
      confidence: "strong match",
      explanation:
        "The human observed debris in the manufacturer-documented user-accessible filter.",
    };
    evidence["drain-pump-failure"].score = 10;
    evidence["control-fault"].score = 5;
  }
  if (result === "filter-clear") {
    evidence["blocked-filter"] = {
      score: 5,
      confidence: "possible",
      explanation: "The visible filter area looks clear, so this cause is less likely.",
    };
    evidence["drain-pump-failure"] = {
      score: 100,
      confidence: "strong match",
      explanation:
        "With the visible hose and documented filter clear, the internal drain pump is the strongest remaining match—but is not proven.",
    };
    evidence["control-fault"] = {
      score: 45,
      confidence: "possible",
      explanation: "An internal control fault remains possible and cannot be checked safely here.",
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
