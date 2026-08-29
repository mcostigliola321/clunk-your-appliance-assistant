import coverageData from "./broadSymptomCoverage.json";

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

export type BroadCoverageProfile =
  | "washer-start-observation"
  | "washer-spin-observation"
  | "washer-leak-observation"
  | "dishwasher-cleaning-observation"
  | "dishwasher-fill-observation"
  | "dishwasher-leak-observation"
  | "dryer-start-observation"
  | "dryer-heat-observation"
  | "dryer-drum-observation"
  | "refrigerator-cooling-observation"
  | "refrigerator-leak-observation"
  | "refrigerator-ice-observation";

export interface BroadSymptomCoverageEvidenceRecord {
  rowId: string;
  cohortId: string;
  modelId: string;
  category: ApplianceKind;
  symptomId: SupportedSymptomId;
  brand: BrandName;
  modelFamily: string;
  topology: DiagramTopology;
  loadStyle: WasherLoadStyle | null;
  sourceIds: string[];
  modelEvidence: {
    sourceId: string;
    url: string;
    verifiedProductCodes: string[];
    purpose: string;
  };
  applicability: string;
  featureGates: string[];
  homeownerObservableChecks: string[];
  safetyBoundaries: {
    homeowner: string[];
    professional: string[];
    stop: string[];
  };
  profile: BroadCoverageProfile;
  modelSpecificException: string;
  capabilityTier: "guided-checks";
  verifiedOn: string;
  unresolvedGaps: string[];
}

interface RawSource extends Omit<SourceReference, "lastVerified"> {
  verifiedOn: string;
  quality: "primary";
}

interface BroadSymptomCoverageData {
  schemaVersion: number;
  verifiedOn: string;
  evidenceRules: string[];
  cohorts: Array<{
    id: string;
    category: ApplianceKind;
    symptomId: SupportedSymptomId;
    brands: BrandName[];
    profile: BroadCoverageProfile;
    applicability: string;
    featureGates: string[];
    exceptions: string[];
  }>;
  sources: Record<string, RawSource>;
  records: BroadSymptomCoverageEvidenceRecord[];
}

export const EXPECTED_BROAD_SYMPTOM_COUNTS = {
  "washer:will-not-start": 39,
  "washer:will-not-spin": 39,
  "washer:is-leaking": 39,
  "dishwasher:not-cleaning": 21,
  "dishwasher:will-not-fill": 21,
  "dishwasher:is-leaking": 21,
  "dryer:will-not-start": 19,
  "dryer:not-heating": 19,
  "dryer:drum-will-not-turn": 19,
  "refrigerator:not-cooling": 22,
  "refrigerator:is-leaking": 22,
  "refrigerator:ice-maker-not-making-ice": 22,
} as const;

const ALLOWED_SYMPTOMS_BY_CATEGORY: Record<ApplianceKind, SupportedSymptomId[]> = {
  washer: ["will-not-start", "will-not-spin", "is-leaking"],
  dishwasher: ["not-cleaning", "will-not-fill", "is-leaking"],
  dryer: ["will-not-start", "not-heating", "drum-will-not-turn"],
  refrigerator: ["not-cooling", "is-leaking", "ice-maker-not-making-ice"],
};

export function assertBroadSymptomCoverageData(
  value: BroadSymptomCoverageData,
): BroadSymptomCoverageData {
  if (value.schemaVersion !== 1)
    throw new Error("Broad symptom coverage requires schema version 1.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.verifiedOn))
    throw new Error("Broad symptom coverage requires an ISO verification date.");
  if (value.evidenceRules.length < 5 || value.cohorts.length !== 12)
    throw new Error("Broad symptom coverage is missing evidence rules or cohorts.");

  const cohortIds = new Set(value.cohorts.map((cohort) => cohort.id));
  if (cohortIds.size !== value.cohorts.length)
    throw new Error("Broad symptom coverage has duplicate cohort IDs.");

  const rowIds = new Set<string>();
  const counts = Object.fromEntries(
    Object.keys(EXPECTED_BROAD_SYMPTOM_COUNTS).map((key) => [key, 0]),
  ) as Record<string, number>;
  for (const record of value.records) {
    const expectedRowId = `${record.modelId}__${record.symptomId}`;
    const countKey = `${record.category}:${record.symptomId}`;
    if (rowIds.has(record.rowId) || record.rowId !== expectedRowId)
      throw new Error(`Broad coverage record ${record.rowId} is duplicated or mismatched.`);
    rowIds.add(record.rowId);
    if (!cohortIds.has(record.cohortId) || !(countKey in counts))
      throw new Error(`Broad coverage record ${record.rowId} has an unknown cohort or route.`);
    counts[countKey] = (counts[countKey] ?? 0) + 1;
    if (!ALLOWED_SYMPTOMS_BY_CATEGORY[record.category].includes(record.symptomId))
      throw new Error(`Broad coverage record ${record.rowId} has a category mismatch.`);
    if (
      record.capabilityTier !== "guided-checks" ||
      record.verifiedOn !== value.verifiedOn ||
      !record.applicability.trim() ||
      record.featureGates.length < 2 ||
      record.homeownerObservableChecks.length < 2 ||
      !record.safetyBoundaries.homeowner.length ||
      !record.safetyBoundaries.professional.length ||
      record.safetyBoundaries.stop.length < 2 ||
      record.unresolvedGaps.length < 2
    )
      throw new Error(`Broad coverage record ${record.rowId} is incomplete.`);
    if (record.category === "washer" ? !record.loadStyle : record.loadStyle !== null)
      throw new Error(`Broad coverage record ${record.rowId} has an invalid load style.`);
    if (
      !isSafePublicHttpsUrl(record.modelEvidence.url) ||
      !record.modelEvidence.sourceId ||
      !record.modelEvidence.purpose.includes("not troubleshooting evidence")
    )
      throw new Error(`Broad coverage record ${record.rowId} has invalid model evidence.`);
    if (
      record.sourceIds.length === 0 ||
      record.sourceIds.some((sourceId) => !value.sources[sourceId])
    )
      throw new Error(`Broad coverage record ${record.rowId} has an unknown source.`);
  }
  if (JSON.stringify(counts) !== JSON.stringify(EXPECTED_BROAD_SYMPTOM_COUNTS))
    throw new Error(
      `Broad symptom coverage has unexpected route counts: ${JSON.stringify(counts)}.`,
    );

  for (const [sourceId, source] of Object.entries(value.sources)) {
    if (
      source.id !== sourceId ||
      source.kind !== "manufacturer-troubleshooting" ||
      source.quality !== "primary" ||
      source.verifiedOn !== value.verifiedOn ||
      !source.appliesTo.trim() ||
      !isSafePublicHttpsUrl(source.url)
    )
      throw new Error(`Broad coverage source ${sourceId} is not a current primary source.`);
  }
  return value;
}

const data = assertBroadSymptomCoverageData(coverageData as BroadSymptomCoverageData);

export const BROAD_SYMPTOM_COVERAGE_EVIDENCE = data.records;
export const BROAD_SYMPTOM_COVERAGE_SOURCES = data.sources;
export const BROAD_SYMPTOM_COVERAGE_COHORTS = data.cohorts;
export const BROAD_SYMPTOM_COVERAGE_EVIDENCE_RULES = data.evidenceRules;

const coverageByModel = new Map<string, SymptomCoverage[]>();
for (const record of data.records) {
  const coverage: SymptomCoverage = {
    symptomId: record.symptomId,
    repairPackId: `${record.modelId}::${record.symptomId}`,
    capability: "guided-checks",
    troubleshootingSources: record.sourceIds.map((sourceId): SourceReference => {
      const raw = data.sources[sourceId]!;
      return {
        id: raw.id,
        kind: raw.kind,
        title: raw.title,
        url: raw.url,
        publisher: raw.publisher,
        appliesTo: raw.appliesTo,
        lastVerified: raw.verifiedOn,
      };
    }),
  };
  coverageByModel.set(record.modelId, [...(coverageByModel.get(record.modelId) ?? []), coverage]);
}

export function getBroadSymptomCoverage(modelId: string): SymptomCoverage[] {
  return coverageByModel.get(modelId) ?? [];
}
