import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { format } from "prettier";

import { APPLIANCE_CATALOG } from "../src/data/applianceCatalog";
import { DEFAULT_SYMPTOM_BY_KIND, SYMPTOMS_BY_KIND } from "../src/data/symptomCatalog";
import type { ApplianceKind, SupportedSymptomId } from "../src/domain/types";

const VERIFIED_ON = "2026-08-29";
const OUTPUT_DIRECTORY = resolve("docs/research/demo-ready-2026-08-29");

const models = APPLIANCE_CATALOG.map((entry) => ({
  modelId: entry.id,
  category: entry.kind,
  brand: entry.brand,
  modelFamily: entry.model,
  identityTier: entry.verifiedProductCodes.length > 0 ? "exact-code" : "family-only",
  aliases: entry.aliases,
  verifiedProductCodes: entry.verifiedProductCodes,
  modelEvidence: {
    title: entry.modelSource.title,
    publisher: entry.modelSource.publisher,
    url: entry.modelSource.url,
    appliesTo: entry.modelSource.appliesTo,
    lastVerified: entry.modelSource.lastVerified,
  },
}));

const pairs = APPLIANCE_CATALOG.flatMap((entry) =>
  SYMPTOMS_BY_KIND[entry.kind].map((symptomId) => {
    const coverage = entry.symptomCoverage.find((item) => item.symptomId === symptomId);
    const exact = coverage?.exactPartEvidence;
    const part = exact?.part;
    const isDefaultRoute = DEFAULT_SYMPTOM_BY_KIND[entry.kind] === symptomId;
    const supportMissingReason = coverage
      ? null
      : "No active exact model × symptom row is backed by current primary manufacturer troubleshooting evidence.";
    const purchaseMissingReason = part
      ? null
      : !coverage
        ? "The symptom route is unsupported, so no exact-part purchase claim is permitted."
        : !isDefaultRoute
          ? "Purchase promotion is limited to the category's separately reviewed default component route."
          : entry.verifiedProductCodes.length === 0
            ? "A complete revision code is not independently verified for this catalog identity."
            : "No accepted complete-revision → one exact-SKU compatibility chain plus separately verified seller offer is recorded.";

    return {
      rowId: `${entry.id}__${symptomId}`,
      modelId: entry.id,
      category: entry.kind,
      brand: entry.brand,
      modelFamily: entry.model,
      identityTier: entry.verifiedProductCodes.length > 0 ? "exact-code" : "family-only",
      verifiedProductCodes: entry.verifiedProductCodes,
      symptomId,
      supported: Boolean(coverage),
      capability: coverage?.capability ?? "unsupported",
      repairPackId: coverage?.repairPackId ?? null,
      troubleshootingEvidence:
        coverage?.troubleshootingSources.map((source) => ({
          id: source.id,
          kind: source.kind,
          title: source.title,
          publisher: source.publisher,
          url: source.url,
          appliesTo: source.appliesTo,
          lastVerified: source.lastVerified,
        })) ?? [],
      supportMissingReason,
      purchaseReady: Boolean(part),
      exactPart: part
        ? {
            name: part.name,
            sku: part.sku,
            compatibleProductCodes: exact.verifiedProductCodes,
            installBoundary: part.installBoundary,
            compatibilityEvidence: [part.source, ...(part.corroboratingSources ?? [])].map(
              (source) => ({
                id: source.id,
                kind: source.kind,
                title: source.title,
                publisher: source.publisher,
                url: source.url,
                appliesTo: source.appliesTo,
                lastVerified: source.lastVerified,
              }),
            ),
            sellerOffer: part.commerce
              ? {
                  provider: part.commerce.provider,
                  protocol: part.commerce.protocol,
                  query: part.commerce.query,
                  exactSku: part.commerce.exactSku,
                  offerCountAtVerification: part.commerce.offerCountAtVerification,
                  lastVerified: part.commerce.lastVerified,
                }
              : part.purchase
                ? {
                    provider: part.purchase.seller,
                    url: part.purchase.url,
                    availabilityAtVerification: part.purchase.availabilityAtVerification,
                    priceAtVerification: part.purchase.priceAtVerification,
                    lastVerified: part.purchase.lastVerified,
                  }
                : null,
          }
        : null,
      purchaseMissingReason,
    };
  }),
);

const categories = Object.fromEntries(
  (["washer", "dishwasher", "dryer", "refrigerator"] satisfies ApplianceKind[]).map((category) => {
    const categoryModels = models.filter((model) => model.category === category);
    const categoryPairs = pairs.filter((pair) => pair.category === category);
    return [
      category,
      {
        models: categoryModels.length,
        pairs: categoryPairs.length,
        supportedPairs: categoryPairs.filter((pair) => pair.supported).length,
        unsupportedPairs: categoryPairs.filter((pair) => !pair.supported).length,
        purchaseReadyModels: new Set(
          categoryPairs.filter((pair) => pair.purchaseReady).map((pair) => pair.modelId),
        ).size,
        symptoms: Object.fromEntries(
          SYMPTOMS_BY_KIND[category].map((symptomId: SupportedSymptomId) => {
            const symptomPairs = categoryPairs.filter((pair) => pair.symptomId === symptomId);
            return [
              symptomId,
              {
                total: symptomPairs.length,
                supported: symptomPairs.filter((pair) => pair.supported).length,
                unsupported: symptomPairs.filter((pair) => !pair.supported).length,
              },
            ];
          }),
        ),
      },
    ];
  }),
);

const totals = {
  models: models.length,
  exactCodeIdentities: models.filter((model) => model.identityTier === "exact-code").length,
  familyOnlyIdentities: models.filter((model) => model.identityTier === "family-only").length,
  modelSymptomPairs: pairs.length,
  supportedPairs: pairs.filter((pair) => pair.supported).length,
  unsupportedPairs: pairs.filter((pair) => !pair.supported).length,
  purchaseReadyModels: new Set(
    pairs.filter((pair) => pair.purchaseReady).map((pair) => pair.modelId),
  ).size,
  purchaseReadyPairs: pairs.filter((pair) => pair.purchaseReady).length,
};

if (totals.models !== 163 || totals.modelSymptomPairs !== 782)
  throw new Error(`Catalog audit invariant failed: ${JSON.stringify(totals)}.`);
if (totals.supportedPairs + totals.unsupportedPairs !== totals.modelSymptomPairs)
  throw new Error("Catalog audit failed to classify every model × symptom pair.");

const audit = {
  schemaVersion: 1,
  verifiedOn: VERIFIED_ON,
  definitions: {
    supported:
      "An exact catalog model × symptom route with active troubleshooting evidence and a safe guided repair pack.",
    purchaseReady:
      "A supported route with a complete product revision bound to one exact manufacturer SKU and a separately recorded seller offer.",
    familyOnly:
      "The manufacturer model family is verified, but no complete revision code is accepted for purchase compatibility.",
  },
  totals,
  categories,
  models,
  pairs,
};

const csvCell = (value: unknown): string => {
  const serialized =
    typeof value === "string"
      ? value
      : value === null || value === undefined
        ? ""
        : JSON.stringify(value);
  return `"${serialized.replaceAll('"', '""')}"`;
};
const csvColumns = [
  "rowId",
  "modelId",
  "category",
  "brand",
  "modelFamily",
  "identityTier",
  "verifiedProductCodes",
  "symptomId",
  "supported",
  "capability",
  "repairPackId",
  "troubleshootingEvidence",
  "supportMissingReason",
  "purchaseReady",
  "exactPart",
  "purchaseMissingReason",
] as const;
const csv = [
  csvColumns.join(","),
  ...pairs.map((pair) => csvColumns.map((column) => csvCell(pair[column])).join(",")),
].join("\n");

if (process.argv.includes("--write")) {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  await Promise.all([
    writeFile(
      resolve(OUTPUT_DIRECTORY, "catalog-audit.json"),
      await format(JSON.stringify(audit), { parser: "json", printWidth: 100 }),
    ),
    writeFile(resolve(OUTPUT_DIRECTORY, "model-symptom-audit.csv"), `${csv}\n`),
  ]);
}

console.log(JSON.stringify({ verifiedOn: VERIFIED_ON, totals, categories }, null, 2));
