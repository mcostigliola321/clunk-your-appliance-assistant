import expansionData from "./symptomCoverageExpansion.json";

import type {
  ApplianceKind,
  BrandName,
  DiagramTopology,
  SourceReference,
  SupportedSymptomId,
  SymptomCoverage,
  WasherLoadStyle,
} from "@/domain/types";
import { isSafePublicHttpsUrl } from "@/domain/urlSafety";

export interface SymptomCoverageEvidenceRecord {
  rowId: string;
  modelId: string;
  category: Exclude<ApplianceKind, "dryer">;
  brand: BrandName;
  modelFamily: string;
  topology: DiagramTopology;
  loadStyle?: WasherLoadStyle | null;
  sourceIds: string[];
  applicability: string;
  homeownerObservableChecks: string[];
  safetyBoundaries: {
    homeowner: string[];
    professional: string[];
    stop: string[];
  };
  profile:
    | "washer-door-closure-observation"
    | "dishwasher-door-closure-observation"
    | "refrigerator-door-closure-observation";
  modelSpecificException: string | null;
  capabilityTier: "guided-checks";
  verifiedOn: string;
  unresolvedGaps: string[];
}

interface RawSource extends Omit<SourceReference, "lastVerified"> {
  verifiedOn: string;
  quality: "primary";
}

interface SymptomCoverageExpansionData {
  schemaVersion: number;
  verifiedOn: string;
  symptomId: SupportedSymptomId;
  evidenceRules: string[];
  profiles: Array<{
    id: SymptomCoverageEvidenceRecord["profile"];
    scope: string;
    checks: string[];
    exclusions: string[];
    exceptionRule: string;
  }>;
  sources: Record<string, RawSource>;
  records: SymptomCoverageEvidenceRecord[];
}

const EXPECTED_COUNTS = { washer: 36, dishwasher: 20, refrigerator: 35 } as const;

export function assertSymptomCoverageExpansionData(
  value: SymptomCoverageExpansionData,
): SymptomCoverageExpansionData {
  if (value.schemaVersion !== 1 || value.symptomId !== "door-will-not-close")
    throw new Error("Symptom coverage expansion requires schema version 1 and door closure.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.verifiedOn))
    throw new Error("Symptom coverage expansion requires an ISO verification date.");
  const ids = new Set<string>();
  const counts = { washer: 0, dishwasher: 0, refrigerator: 0 };
  for (const record of value.records) {
    if (ids.has(record.modelId) || record.rowId !== `${record.modelId}__door-will-not-close`)
      throw new Error(`Coverage record ${record.rowId} is duplicated or mismatched.`);
    ids.add(record.modelId);
    counts[record.category] += 1;
    if (
      record.capabilityTier !== "guided-checks" ||
      record.verifiedOn !== value.verifiedOn ||
      !record.applicability.trim() ||
      !record.homeownerObservableChecks.length ||
      !record.safetyBoundaries.professional.length ||
      !record.safetyBoundaries.stop.length ||
      record.unresolvedGaps.length < 2
    )
      throw new Error(`Coverage record ${record.rowId} is incomplete.`);
    if (record.category === "washer" && !record.loadStyle)
      throw new Error(`Washer coverage record ${record.rowId} requires a load style.`);
    if (
      record.sourceIds.length === 0 ||
      record.sourceIds.some((sourceId) => !value.sources[sourceId])
    )
      throw new Error(`Coverage record ${record.rowId} has an unknown source.`);
  }
  if (JSON.stringify(counts) !== JSON.stringify(EXPECTED_COUNTS))
    throw new Error(
      `Symptom coverage expansion has unexpected cohort counts: ${JSON.stringify(counts)}.`,
    );
  for (const [sourceId, source] of Object.entries(value.sources)) {
    if (
      source.id !== sourceId ||
      source.kind !== "manufacturer-troubleshooting" ||
      source.quality !== "primary" ||
      source.verifiedOn !== value.verifiedOn ||
      !isSafePublicHttpsUrl(source.url)
    )
      throw new Error(`Coverage source ${sourceId} is not a current primary source.`);
  }
  return value;
}

const data = assertSymptomCoverageExpansionData(expansionData as SymptomCoverageExpansionData);

export const SYMPTOM_COVERAGE_EVIDENCE = data.records;
export const SYMPTOM_COVERAGE_SOURCES = data.sources;
export const SYMPTOM_COVERAGE_PROFILES = data.profiles;
export const SYMPTOM_COVERAGE_EVIDENCE_RULES = data.evidenceRules;

const coverageByModel = new Map(
  data.records.map((record) => [
    record.modelId,
    {
      symptomId: data.symptomId,
      repairPackId: `${record.modelId}::${data.symptomId}`,
      capability: "guided-checks",
      troubleshootingSources: record.sourceIds.map((sourceId): SourceReference => {
        const source = data.sources[sourceId]!;
        return {
          id: source.id,
          kind: source.kind,
          title: source.title,
          url: source.url,
          publisher: source.publisher,
          appliesTo: source.appliesTo,
          lastVerified: source.verifiedOn,
        };
      }),
    } satisfies SymptomCoverage,
  ]),
);

export function getExpandedSymptomCoverage(modelId: string): SymptomCoverage[] {
  const coverage = coverageByModel.get(modelId);
  return coverage ? [coverage] : [];
}
