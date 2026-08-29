import coverageData from "./demoReadyCoverage.json";

import type {
  ApplianceKind,
  SourceReference,
  SupportedSymptomId,
  SymptomCoverage,
} from "@/domain/types";
import { isSafePublicHttpsUrl } from "@/domain/urlSafety";

interface RawSource extends Omit<SourceReference, "lastVerified"> {
  verifiedOn: string;
  quality: "primary";
}

export interface DemoReadyCoverageRecord {
  rowId: string;
  modelId: string;
  category: Exclude<ApplianceKind, "refrigerator">;
  symptomId: SupportedSymptomId;
  sourceIds: string[];
  applicability: string;
  profile: string;
  safetyBoundary: string[];
  verifiedOn: string;
}

interface DemoReadyCoverageData {
  schemaVersion: number;
  verifiedOn: string;
  expectedCounts: Record<Exclude<ApplianceKind, "refrigerator">, number>;
  evidenceRules: string[];
  sources: Record<string, RawSource>;
  records: DemoReadyCoverageRecord[];
}

export function assertDemoReadyCoverageData(value: DemoReadyCoverageData): DemoReadyCoverageData {
  if (value.schemaVersion !== 1 || value.verifiedOn !== "2026-08-29")
    throw new Error("Demo-ready coverage requires the reviewed schema and verification date.");
  if (value.evidenceRules.length < 5)
    throw new Error("Demo-ready coverage is missing its evidence rules.");
  const counts = { washer: 0, dishwasher: 0, dryer: 0 };
  const rowIds = new Set<string>();
  for (const record of value.records) {
    if (rowIds.has(record.rowId) || record.rowId !== `${record.modelId}__${record.symptomId}`)
      throw new Error(`Demo-ready row ${record.rowId} is duplicated or mismatched.`);
    rowIds.add(record.rowId);
    counts[record.category] += 1;
    if (
      record.verifiedOn !== value.verifiedOn ||
      !record.applicability.trim() ||
      !record.profile.trim() ||
      !record.safetyBoundary.length ||
      !record.sourceIds.length ||
      record.sourceIds.some((sourceId) => !value.sources[sourceId])
    )
      throw new Error(`Demo-ready row ${record.rowId} is incomplete.`);
  }
  if (JSON.stringify(counts) !== JSON.stringify(value.expectedCounts))
    throw new Error(`Demo-ready coverage count mismatch: ${JSON.stringify(counts)}.`);
  for (const [sourceId, source] of Object.entries(value.sources)) {
    if (
      source.id !== sourceId ||
      source.kind !== "manufacturer-troubleshooting" ||
      source.quality !== "primary" ||
      source.verifiedOn !== value.verifiedOn ||
      !source.title.trim() ||
      !source.publisher.trim() ||
      !source.appliesTo.trim() ||
      !isSafePublicHttpsUrl(source.url)
    )
      throw new Error(`Demo-ready source ${sourceId} is invalid.`);
  }
  return value;
}

const data = assertDemoReadyCoverageData(coverageData as DemoReadyCoverageData);

export const DEMO_READY_COVERAGE_EVIDENCE = data.records;
export const DEMO_READY_COVERAGE_SOURCES = data.sources;
export const DEMO_READY_COVERAGE_RULES = data.evidenceRules;

const coverageByModel = new Map<string, SymptomCoverage[]>();
for (const record of data.records) {
  const coverage: SymptomCoverage = {
    symptomId: record.symptomId,
    repairPackId: `${record.modelId}::${record.symptomId}`,
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
  };
  coverageByModel.set(record.modelId, [...(coverageByModel.get(record.modelId) ?? []), coverage]);
}

export function getDemoReadySymptomCoverage(modelId: string): SymptomCoverage[] {
  return coverageByModel.get(modelId) ?? [];
}
