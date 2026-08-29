import { APPLIANCE_CATALOG } from "../src/data/applianceCatalog";
import { DEFAULT_SYMPTOM_BY_KIND } from "../src/data/symptomCatalog";

const rows = APPLIANCE_CATALOG.map((entry) => {
  const purchaseReady = entry.symptomCoverage.filter(
    (coverage) => coverage.capability === "purchase-ready",
  );
  const defaultCoverage = entry.symptomCoverage.find(
    (coverage) => coverage.symptomId === DEFAULT_SYMPTOM_BY_KIND[entry.kind],
  );
  return {
    id: entry.id,
    kind: entry.kind,
    brand: entry.brand,
    model: entry.model,
    verifiedProductCodes: entry.verifiedProductCodes,
    defaultSymptom: DEFAULT_SYMPTOM_BY_KIND[entry.kind],
    defaultCapability: defaultCoverage?.capability ?? "unsupported",
    purchaseReadySymptoms: purchaseReady.map((coverage) => coverage.symptomId),
    hasPurchasePath: purchaseReady.length > 0,
  };
});

const keyFor = (row: (typeof rows)[number]) => `${row.kind}\t${row.brand}`;
const groups = new Map<string, { total: number; purchaseReady: number; exactCodeOnly: number }>();

for (const row of rows) {
  const group = groups.get(keyFor(row)) ?? { total: 0, purchaseReady: 0, exactCodeOnly: 0 };
  group.total += 1;
  if (row.hasPurchasePath) group.purchaseReady += 1;
  else if (row.verifiedProductCodes.length > 0) group.exactCodeOnly += 1;
  groups.set(keyFor(row), group);
}

const totals = {
  models: rows.length,
  purchaseReadyModels: rows.filter((row) => row.hasPurchasePath).length,
  guidedModelsWithExactCodes: rows.filter(
    (row) => !row.hasPurchasePath && row.verifiedProductCodes.length > 0,
  ).length,
  guidedFamilyOnlyModels: rows.filter(
    (row) => !row.hasPurchasePath && row.verifiedProductCodes.length === 0,
  ).length,
};

console.log(JSON.stringify({ totals, groups: Object.fromEntries(groups), rows }, null, 2));
