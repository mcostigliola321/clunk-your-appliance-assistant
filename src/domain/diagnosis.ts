import { getRepairPack } from "./repairPack";
import type { RankedCause, RepairState } from "./types";

function confidence(score: number): RankedCause["confidence"] {
  if (score >= 80) return "strong match";
  if (score >= 45) return "likely";
  return "possible";
}

export function deriveCauses(state: RepairState): RankedCause[] {
  if (!state.packId) return [];
  const pack = getRepairPack(state.packId);
  const observed = Object.values(state.completedChecks).filter((item): item is string =>
    Boolean(item),
  );
  return pack.causes
    .map((cause) => {
      let score = cause.baseRank;
      let explanation = cause.defaultExplanation;
      for (const resultId of observed) {
        score += cause.resultScores?.[resultId] ?? 0;
        explanation = cause.resultExplanations?.[resultId] ?? explanation;
      }
      score = Math.max(0, Math.min(100, score));
      return {
        id: cause.id,
        label: cause.label,
        componentId: cause.componentId,
        score,
        confidence: confidence(score),
        explanation,
      };
    })
    .sort((left, right) => right.score - left.score);
}
