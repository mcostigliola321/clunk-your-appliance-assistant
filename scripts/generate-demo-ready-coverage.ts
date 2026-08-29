import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { format } from "prettier";

import dishwasherData from "../src/data/demoReady/dishwasherSymptomCoverage.json";
import dryerData from "../src/data/demoReady/dryerCoverageExpansion.json";
import washerData from "../src/data/demoReady/washerSymptomCoverage.json";
import dryerSourceAudit from "../docs/research/demo-ready-2026-08-29/dryer/source-audit.json";
import washerSourceAudit from "../docs/research/demo-ready-2026-08-29/washer/source-audit.json";
import { APPLIANCE_CATALOG } from "../src/data/applianceCatalog";
import type { SourceReference } from "../src/domain/types";

const VERIFIED_ON = "2026-08-29";
type NormalizedSource = Omit<SourceReference, "lastVerified"> & {
  verifiedOn: string;
  quality: "primary";
};
type NormalizedRecord = {
  rowId: string;
  modelId: string;
  category: "washer" | "dishwasher" | "dryer";
  symptomId: string;
  sourceIds: string[];
  applicability: string;
  profile: string;
  safetyBoundary: string[];
  verifiedOn: string;
};

const sources = new Map<string, NormalizedSource>();
const records: NormalizedRecord[] = [];

function addSource(source: NormalizedSource): void {
  const existing = sources.get(source.id);
  if (existing && existing.url !== source.url)
    throw new Error(`Source ${source.id} resolves to multiple URLs.`);
  sources.set(source.id, source);
}

for (const record of dishwasherData.records) {
  for (const sourceId of record.sourceIds) {
    const raw = dishwasherData.sources[sourceId as keyof typeof dishwasherData.sources];
    if (!raw) throw new Error(`Dishwasher row ${record.rowId} has missing source ${sourceId}.`);
    addSource({
      id: `dishwasher-${raw.id}`,
      kind: "manufacturer-troubleshooting",
      title: raw.title,
      url: raw.url,
      publisher: raw.publisher,
      appliesTo: raw.appliesTo,
      verifiedOn: raw.verifiedOn,
      quality: "primary",
    });
  }
  records.push({
    rowId: record.rowId,
    modelId: record.modelId,
    category: "dishwasher",
    symptomId: record.symptomId,
    sourceIds: record.sourceIds.map((sourceId) => `dishwasher-${sourceId}`),
    applicability: record.applicability,
    profile: record.safetyProfileId,
    safetyBoundary: record.limitations,
    verifiedOn: record.verifiedOn,
  });
}

const dryerSources = new Map(dryerSourceAudit.records.map((source) => [source.id, source]));
for (const record of dryerData.records) {
  for (const sourceId of record.sourceIds) {
    const raw = dryerSources.get(sourceId);
    if (!raw) throw new Error(`Dryer row ${record.rowId} has missing source ${sourceId}.`);
    addSource({
      id: `dryer-${raw.id}`,
      kind: "manufacturer-troubleshooting",
      title: `${raw.publisher} dryer troubleshooting: ${raw.evidence}`,
      url: raw.url,
      publisher: raw.publisher,
      appliesTo: `${record.brand} ${record.model}; ${raw.scope}`,
      verifiedOn: raw.verifiedOn,
      quality: "primary",
    });
  }
  records.push({
    rowId: record.rowId,
    modelId: record.modelId,
    category: "dryer",
    symptomId: record.symptomId,
    sourceIds: record.sourceIds.map((sourceId) => `dryer-${sourceId}`),
    applicability: record.applicability,
    profile: record.profile,
    safetyBoundary: [...record.excludedManufacturerSteps, record.professionalStop],
    verifiedOn: record.verifiedOn,
  });
}

const washerGuidance = washerSourceAudit.records.filter(
  (source) => source.role === "symptom-guidance",
);
for (const record of washerData.records) {
  const entry = APPLIANCE_CATALOG.find((item) => item.id === record.applianceId);
  if (!entry) throw new Error(`Washer row names unknown model ${record.applianceId}.`);
  const raw = washerGuidance.find((source) => source.url === record.supportSourceUrl);
  if (!raw) throw new Error(`Washer row ${record.applianceId} lacks audited guidance metadata.`);
  addSource({
    id: `washer-${record.supportSourceId}`,
    kind: "manufacturer-troubleshooting",
    title: `${raw.publisher} ${record.title} owner guidance`,
    url: raw.url,
    publisher: raw.publisher,
    appliesTo: raw.appliesTo,
    verifiedOn: raw.reviewedOn,
    quality: "primary",
  });
  records.push({
    rowId: `${record.applianceId}__${record.symptomId}`,
    modelId: record.applianceId,
    category: "washer",
    symptomId: record.symptomId,
    sourceIds: [`washer-${record.supportSourceId}`],
    applicability: `${entry.brand} ${entry.model}; ${record.evidenceTier}.`,
    profile: record.title,
    safetyBoundary: record.stopConditions,
    verifiedOn: VERIFIED_ON,
  });
}

const expected = { washer: 65, dishwasher: 49, dryer: 42 };
const counts = {
  washer: records.filter((record) => record.category === "washer").length,
  dishwasher: records.filter((record) => record.category === "dishwasher").length,
  dryer: records.filter((record) => record.category === "dryer").length,
};
if (JSON.stringify(counts) !== JSON.stringify(expected))
  throw new Error(`Unexpected integration counts: ${JSON.stringify(counts)}.`);
if (new Set(records.map((record) => record.rowId)).size !== records.length)
  throw new Error("Demo-ready coverage contains duplicate model × symptom rows.");
for (const record of records) {
  const entry = APPLIANCE_CATALOG.find((item) => item.id === record.modelId);
  if (!entry || entry.kind !== record.category)
    throw new Error(`Demo-ready row ${record.rowId} has a catalog identity mismatch.`);
  if (record.sourceIds.some((sourceId) => !sources.has(sourceId)))
    throw new Error(`Demo-ready row ${record.rowId} has missing evidence.`);
}

const output = {
  schemaVersion: 1,
  verifiedOn: VERIFIED_ON,
  expectedCounts: expected,
  evidenceRules: [
    "Every row is an explicit exact catalog model × symptom decision from the category review.",
    "Model identity evidence never substitutes for symptom troubleshooting evidence.",
    "Only visible, owner-safe observations shared by the cited manufacturer guidance are active.",
    "No row creates an exact-part or purchase claim.",
    "Blocked rows remain absent and cannot inherit evidence from a neighbor, sibling brand, or topology.",
  ],
  sources: Object.fromEntries(
    [...sources.entries()].sort(([left], [right]) => left.localeCompare(right)),
  ),
  records: records.sort((left, right) => left.rowId.localeCompare(right.rowId)),
};

await writeFile(
  resolve("src/data/demoReadyCoverage.json"),
  await format(JSON.stringify(output), { parser: "json", printWidth: 100 }),
  "utf8",
);
console.log(`Wrote ${records.length} explicit demo-ready model × symptom rows.`);
