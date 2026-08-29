#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const researchDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(researchDir, "../../../..");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const gaps = readJson(join(researchDir, "model-symptom-gap-review.json"));
const purchase = readJson(join(researchDir, "purchase-readiness-review.json"));
const sources = readJson(join(researchDir, "source-audit.json"));
const implementation = readJson(join(root, "src/data/demoReady/washerSymptomCoverage.json"));

const catalogScript = `
  import { APPLIANCE_CATALOG } from './src/data/applianceCatalog';
  process.stdout.write(JSON.stringify(APPLIANCE_CATALOG
    .filter((item) => item.kind === 'washer')
    .map((item) => ({
      id: item.id,
      coverage: item.symptomCoverage.map((row) => ({
        symptomId: row.symptomId,
        capability: row.capability,
      })),
      verifiedProductCodes: item.verifiedProductCodes || [],
    }))));
`;

const currentCatalog = JSON.parse(
  execFileSync(join(root, "node_modules/.bin/tsx"), ["-e", catalogScript], {
    cwd: root,
    encoding: "utf8",
  }),
);

const symptoms = [
  "will-not-drain",
  "door-will-not-close",
  "will-not-start",
  "will-not-spin",
  "is-leaking",
];
const currentGaps = currentCatalog.flatMap((model) => {
  const covered = new Set(model.coverage.map((row) => row.symptomId));
  return symptoms
    .filter((symptomId) => !covered.has(symptomId))
    .map((symptomId) => `${model.id}__${symptomId}`);
});
const currentNonPurchase = currentCatalog.filter(
  (model) => !model.coverage.some((row) => row.capability === "purchase-ready"),
);

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const unique = (values) => new Set(values).size === values.length;
const sorted = (values) => [...values].sort();
const sameSet = (left, right) => JSON.stringify(sorted(left)) === JSON.stringify(sorted(right));

check(currentCatalog.length === 56, `Expected 56 current washers, got ${currentCatalog.length}`);
check(gaps.records.length === 71, `Expected 71 gap rows, got ${gaps.records.length}`);
check(unique(gaps.records.map((row) => row.rowId)), "Gap row IDs are not unique");
check(
  sameSet(
    gaps.records.map((row) => row.rowId),
    currentGaps,
  ),
  "Gap ledger does not exactly match the current composed catalog",
);

const promoted = gaps.records.filter((row) => row.researchOutcome === "promotable-guided-checks");
const blocked = gaps.records.filter((row) => row.researchOutcome === "blocked");
check(promoted.length === 65, `Expected 65 promotable rows, got ${promoted.length}`);
check(blocked.length === 6, `Expected 6 blocked rows, got ${blocked.length}`);
check(
  blocked.every((row) => row.blockedReason && !row.supportSource),
  "Every blocked row must state a reason and have no symptom source",
);
check(
  promoted.every(
    (row) =>
      row.supportSource?.quality === "primary" &&
      row.modelIdentitySource?.url &&
      row.draftRepairPack?.checkpoints?.length === 3,
  ),
  "Every promoted row must have primary evidence, a model-identity URL, and three safe checkpoints",
);

const implementationKeys = implementation.records.map(
  (row) => `${row.applianceId}__${row.symptomId}`,
);
check(
  sameSet(
    implementationKeys,
    promoted.map((row) => row.rowId),
  ),
  "Implementation rows must exactly match the promoted gap rows",
);
check(unique(implementationKeys), "Implementation rows are not unique");
check(
  implementation.records.every(
    (row) =>
      row.capability === "guided-checks" &&
      !("parts" in row) &&
      !("sku" in row) &&
      row.stopConditions.length >= 3,
  ),
  "Implementation rows must remain guided-checks-only and contain no part/SKU payload",
);

check(
  purchase.records.length === currentNonPurchase.length && purchase.records.length === 41,
  `Expected all 41 non-purchase-ready identities, got ${purchase.records.length}`,
);
check(
  sameSet(
    purchase.records.map((row) => row.applianceId),
    currentNonPurchase.map((row) => row.id),
  ),
  "Purchase ledger does not exactly match current non-purchase-ready identities",
);
check(unique(purchase.records.map((row) => row.applianceId)), "Purchase identities are not unique");
check(
  purchase.records.filter((row) => row.identityGate === "family-only").length === 30,
  "Expected 30 family-only purchase rows",
);
check(
  purchase.records.filter((row) => row.identityGate === "complete-code").length === 11,
  "Expected 11 complete-code purchase rows",
);
check(
  purchase.records.every(
    (row) =>
      row.fitProofOutcome === "blocked" &&
      row.promotable === false &&
      row.shopifyOfferSearch.eligible === false &&
      row.shopifyOfferSearch.performed === false &&
      row.shopifyOfferSearch.candidates.length === 0,
  ),
  "No purchase row may pass to Shopify without exact one-SKU proof",
);

const allowedPrimaryDomains = [
  "amana.com",
  "bynder.com",
  "electrolux.com",
  "encompass.com",
  "frigidaire.com",
  "geapplianceparts.com",
  "geappliances.com",
  "lg.com",
  "maytag.com",
  "salsify.com",
  "samsung.com",
  "samsungparts.com",
  "whirlpool.com",
];
check(
  sources.records.every((row) =>
    allowedPrimaryDomains.some(
      (domain) => row.domain === domain || row.domain.endsWith(`.${domain}`),
    ),
  ),
  "Source audit contains a non-primary domain",
);
check(
  sources.records.every(
    (row) =>
      row.category === "washer" &&
      (row.primaryManufacturerEvidence === true || row.authorizedFitEvidence === true),
  ),
  "Source audit must be washer-only primary symptom evidence or authorized exact-fit evidence",
);

if (failures.length > 0) {
  console.error(`Washer evidence validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: "pass",
      currentWasherIdentities: currentCatalog.length,
      currentSupportedPairs: currentCatalog.reduce((sum, model) => sum + model.coverage.length, 0),
      reviewedGaps: gaps.records.length,
      promotableGuidedChecks: promoted.length,
      blockedGaps: blocked.length,
      purchaseRowsReviewed: purchase.records.length,
      completeCodeRowsReviewed: purchase.records.filter(
        (row) => row.identityGate === "complete-code",
      ).length,
      newPurchasePromotions: 0,
      sourceAuditRecords: sources.records.length,
    },
    null,
    2,
  ),
);

if (process.argv.includes("--network")) {
  const uniqueUrls = [...new Set(sources.records.map((source) => source.url))];
  const uniqueResults = await Promise.all(
    uniqueUrls.map(async (url) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      try {
        const response = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: { "user-agent": "Clunk evidence audit/1.0" },
        });
        return { url, status: response.status, ok: response.ok };
      } catch (error) {
        return { url, status: "network", ok: false };
      } finally {
        clearTimeout(timeout);
      }
    }),
  );
  console.log(
    JSON.stringify(
      {
        networkSnapshot: {
          checked: uniqueResults.length,
          ok: uniqueResults.filter((row) => row.ok).length,
          blockedOrUnavailable: uniqueResults.filter((row) => !row.ok).length,
          note: "Manufacturer bot protection is not an evidence-quality failure; inspect non-2xx rows manually.",
        },
        results: uniqueResults,
      },
      null,
      2,
    ),
  );
}
