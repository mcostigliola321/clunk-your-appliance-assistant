import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../../..");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const fail = (message) => {
  throw new Error(message);
};
const equal = (actual, expected, label) => {
  if (actual !== expected) fail(`${label}: expected ${expected}, received ${actual}`);
};
const unique = (values, label) => {
  if (new Set(values).size !== values.length) fail(`${label}: duplicates found`);
};

const coverage = await readJson(resolve(here, "coverage-evidence.json"));
const purchase = await readJson(resolve(here, "purchase-evidence.json"));
const sources = await readJson(resolve(here, "source-audit.json"));
const sourceUrls = await readJson(resolve(here, "source-url-audit.json"));
const implementationCoverage = await readJson(
  resolve(root, "src/data/demoReady/dryerCoverageExpansion.json"),
);
const implementationPurchase = await readJson(
  resolve(root, "src/data/demoReady/dryerPurchaseExpansion.json"),
);

equal(coverage.baseline.modelIdentities, 33, "dryer identity baseline");
equal(coverage.baseline.possiblePairs, 132, "dryer pair baseline");
equal(coverage.baseline.coveredPairs, 90, "dryer covered baseline");
equal(coverage.baseline.uncoveredPairs, 42, "dryer uncovered baseline");
equal(coverage.records.length, 42, "coverage evidence rows");
equal(new Set(coverage.records.map((row) => row.modelId)).size, 14, "coverage gap models");
unique(
  coverage.records.map((row) => row.rowId),
  "coverage row ids",
);

for (const symptomId of ["will-not-start", "not-heating", "drum-will-not-turn"]) {
  equal(
    coverage.records.filter((row) => row.symptomId === symptomId).length,
    14,
    `${symptomId} rows`,
  );
}
equal(
  coverage.records.filter((row) => row.evidenceDecision === "supported").length,
  42,
  "supported coverage rows",
);
equal(
  coverage.records.filter((row) => row.activationDisposition === "promotable").length,
  28,
  "directly promotable coverage rows",
);
equal(
  coverage.records.filter(
    (row) => row.activationDisposition === "promotable-with-safe-profile-fork",
  ).length,
  14,
  "safe-profile-fork coverage rows",
);

const forbiddenHomeownerLanguage = [
  /turn the drum by hand/i,
  /terminal block/i,
  /remove .*panel/i,
  /continuity/i,
  /multimeter/i,
];
for (const row of coverage.records) {
  if (row.category !== "dryer") fail(`${row.rowId}: wrong category`);
  if (!row.modelEvidence?.url?.startsWith("https://"))
    fail(`${row.rowId}: missing HTTPS model evidence`);
  if (!Array.isArray(row.sourceIds) || row.sourceIds.length === 0)
    fail(`${row.rowId}: missing source`);
  const checks = row.homeownerObservableChecks.join(" ");
  if (forbiddenHomeownerLanguage.some((pattern) => pattern.test(checks)))
    fail(`${row.rowId}: unsafe homeowner language`);
  if (row.symptomId === "drum-will-not-turn" && row.profile !== "dryer-drum-no-manual-rotation")
    fail(`${row.rowId}: wrong drum profile`);
}

const boschRows = coverage.records.filter((row) => row.modelId === "bosch-wtg86403uc01");
equal(boschRows.length, 3, "Bosch exact rows");
if (boschRows.some((row) => row.topology !== "compact-condensation-electric-dryer"))
  fail("Bosch topology generalized");
if (
  boschRows.some((row) => row.homeownerObservableChecks.join(" ").match(/exterior vent|vent flap/i))
)
  fail("Bosch ventless row contains vented advice");

equal(purchase.baseline.purchaseReady, 11, "purchase-ready baseline");
equal(purchase.baseline.guidedOnly, 22, "guided-only baseline");
equal(purchase.records.length, 22, "reviewed purchase records");
unique(
  purchase.records.map((row) => row.modelId),
  "purchase model ids",
);
const promotable = purchase.records.filter((row) => row.decision === "promotable");
equal(promotable.length, 7, "promotable purchase records");
equal(
  purchase.records.filter((row) => row.decision === "blocked").length,
  15,
  "blocked purchase records",
);
equal(purchase.result.projectedPurchaseReady, 18, "projected purchase-ready dryer identities");

for (const row of purchase.records) {
  if (row.decision === "blocked" && !row.blocker) fail(`${row.modelId}: blocked without reason`);
  if (row.decision !== "promotable") continue;
  if (!row.exactCode || !row.sku) fail(`${row.modelId}: promotion lacks exact code or SKU`);
  if (!row.compatibilityUrl?.startsWith("https://"))
    fail(`${row.modelId}: promotion lacks compatibility URL`);
  if (row.compatibilityUrl.includes("myshopify.com"))
    fail(`${row.modelId}: Shopify used for compatibility`);
  if (
    row.offer?.provider !== "Shopify Global Catalog" ||
    row.offer?.query !== row.sku ||
    !row.offer?.available
  )
    fail(`${row.modelId}: invalid offer separation`);
  if (row.offer.observedExactOffers < 1) fail(`${row.modelId}: zero exact offers`);
  if (
    row.location !== "visible door-side strike" &&
    !row.location.startsWith("visible door-side strike;")
  )
    fail(`${row.modelId}: not a visible door-side part`);
}

equal(sources.records.length, 19, "source audit rows");
unique(
  sources.records.map((row) => row.id),
  "source ids",
);
if (
  sources.records.some(
    (row) =>
      !row.url.startsWith("https://") ||
      !row.evidence ||
      row.observedStatus !== "current-primary-source-reviewed",
  )
)
  fail("source audit record incomplete");
equal(sourceUrls.result.checked, 19, "source URL checks");
equal(sourceUrls.result.ok, 19, "healthy source URLs");
equal(sourceUrls.result.failed, 0, "failed source URLs");
if (sourceUrls.records.some((row) => row.status !== 200 || !row.ok))
  fail("source URL audit contains a failed source");

equal(
  implementationCoverage.records.length,
  coverage.records.length,
  "implementation coverage rows",
);
equal(implementationPurchase.records.length, promotable.length, "implementation purchase rows");
if (JSON.stringify(implementationCoverage.records) !== JSON.stringify(coverage.records))
  fail("implementation coverage data drifted from research evidence");
const byModelId = (rows) => [...rows].sort((a, b) => a.modelId.localeCompare(b.modelId));
if (
  JSON.stringify(byModelId(implementationPurchase.records)) !==
  JSON.stringify(byModelId(promotable))
)
  fail("implementation purchase data drifted from research evidence");

console.log(
  JSON.stringify({
    category: "dryer",
    baseline: coverage.baseline,
    coverage: {
      researched: 42,
      supported: 42,
      directlyPromotable: 28,
      safeProfileFork: 14,
      unsupported: 0,
    },
    purchase: { reviewed: 22, promotable: 7, blocked: 15, projectedPurchaseReady: 18 },
    sources: 19,
    status: "pass",
  }),
);
