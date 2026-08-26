import { repairPack } from "./repairPack";
import type { CauseId, RankedCause, RepairState, ResultId } from "./types";

interface CauseEvidence {
  score: number;
  confidence: RankedCause["confidence"];
  explanation: string;
}

const DEFAULT_EVIDENCE: Record<CauseId, CauseEvidence> = {
  "blocked-filter": {
    score: 40,
    confidence: "likely",
    explanation: "A blocked user-accessible filter is the most common cause in this fictional scenario.",
  },
  "kinked-hose": {
    score: 30,
    confidence: "possible",
    explanation: "A visible bend or pinch can restrict the washer's drain path.",
  },
  "drain-pump-failure": {
    score: 20,
    confidence: "possible",
    explanation: "The sealed drain pump remains possible after external restrictions are excluded.",
  },
  "control-fault": {
    score: 10,
    confidence: "possible",
    explanation: "An internal control fault is less likely and always requires professional service.",
  },
};

function copyDefaultEvidence(): Record<CauseId, CauseEvidence> {
  return {
    "blocked-filter": { ...DEFAULT_EVIDENCE["blocked-filter"] },
    "kinked-hose": { ...DEFAULT_EVIDENCE["kinked-hose"] },
    "drain-pump-failure": { ...DEFAULT_EVIDENCE["drain-pump-failure"] },
    "control-fault": { ...DEFAULT_EVIDENCE["control-fault"] },
  };
}

function applyResult(evidence: Record<CauseId, CauseEvidence>, result: ResultId): void {
  if (result === "hose-kinked" || result === "hose-disconnected") {
    evidence["kinked-hose"] = {
      score: 100,
      confidence: "strong match",
      explanation: "Your visible hose observation directly matches a restricted or damaged drain path.",
    };
    evidence["blocked-filter"].score = 15;
    evidence["drain-pump-failure"].score = 10;
  }

  if (result === "hose-clear") {
    evidence["kinked-hose"] = {
      score: 5,
      confidence: "possible",
      explanation: "The visible hose looks clear, so a hose restriction is now less likely.",
    };
    evidence["blocked-filter"].score = 55;
    evidence["drain-pump-failure"].score = 35;
  }

  if (result === "filter-blocked") {
    evidence["blocked-filter"] = {
      score: 100,
      confidence: "strong match",
      explanation: "Your observation of debris in the filter directly matches the leading cause.",
    };
    evidence["drain-pump-failure"].score = 10;
    evidence["control-fault"].score = 5;
  }

  if (result === "filter-clear") {
    evidence["blocked-filter"] = {
      score: 5,
      confidence: "possible",
      explanation: "The filter looks clear, so this cause is now less likely.",
    };
    evidence["drain-pump-failure"] = {
      score: 100,
      confidence: "strong match",
      explanation: "With the visible hose and user-accessible filter clear, the sealed pump is the strongest remaining match.",
    };
    evidence["control-fault"] = {
      score: 45,
      confidence: "possible",
      explanation: "An internal control fault remains possible, but cannot be checked safely in this demo.",
    };
  }
}

export function deriveCauses(state: RepairState): RankedCause[] {
  const evidence = copyDefaultEvidence();

  for (const result of Object.values(state.completedChecks)) {
    if (result) {
      applyResult(evidence, result);
    }
  }

  return repairPack.causes
    .map((cause) => ({
      ...cause,
      ...evidence[cause.id],
    }))
    .sort((left, right) => right.score - left.score);
}
