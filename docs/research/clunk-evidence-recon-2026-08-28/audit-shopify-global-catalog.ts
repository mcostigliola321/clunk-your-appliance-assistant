import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { hasExactPartNumber } from "../../../src/domain/shopifyCatalog";

const ENDPOINT = "https://catalog.shopify.com/api/ucp/mcp";
const PROFILE = "https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json";
const VERIFIED_ON = "2026-08-28";
const outputDirectory = dirname(fileURLToPath(import.meta.url));

interface CoverageRow {
  rowId: string;
  capabilityTier: string;
  completeCode: { currentlyVerifiedCodes: string[] };
  partEvidence?: {
    sku: string;
    compatibleModel: string;
    compatibilitySourceId: string;
    commerceAudit: { query: string };
  } | null;
}

interface CatalogVariant {
  id?: string;
  sku?: string | null;
  title?: string;
  description?: { plain?: string };
  availability?: { available?: boolean };
  checkout_url?: string;
}

interface CatalogProduct {
  id?: string;
  title?: string;
  description?: { plain?: string; html?: string };
  variants?: CatalogVariant[];
}

interface CatalogResponse {
  error?: { message?: string };
  result?: { structuredContent?: { products?: CatalogProduct[] } };
}

const coverage = JSON.parse(
  await readFile(join(outputDirectory, "candidate-coverage.json"), "utf8"),
) as { rows: CoverageRow[] };

const skuMap = new Map<
  string,
  {
    sku: string;
    rowIds: string[];
    completeCodes: string[];
    compatibleModels: string[];
    compatibilitySourceIds: string[];
    queries: string[];
  }
>();

for (const row of coverage.rows) {
  if (row.capabilityTier !== "purchase-ready" || !row.partEvidence) continue;
  const sku = row.partEvidence.sku;
  const current = skuMap.get(sku) ?? {
    sku,
    rowIds: [],
    completeCodes: [],
    compatibleModels: [],
    compatibilitySourceIds: [],
    queries: [],
  };
  current.rowIds.push(row.rowId);
  current.completeCodes.push(...row.completeCode.currentlyVerifiedCodes);
  current.compatibleModels.push(row.partEvidence.compatibleModel);
  current.compatibilitySourceIds.push(row.partEvidence.compatibilitySourceId);
  current.queries.push(row.partEvidence.commerceAudit.query);
  skuMap.set(sku, current);
}

const results: Array<Record<string, unknown>> = [];

for (const item of [...skuMap.values()].sort((left, right) => left.sku.localeCompare(right.sku))) {
  const query = [...new Set(item.queries)][0] ?? `${item.sku} appliance replacement part exact SKU`;
  const startedAt = new Date().toISOString();
  try {
    let response: Response | undefined;
    let payload: CatalogResponse | undefined;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "text/plain;charset=UTF-8" },
        credentials: "omit",
        cache: "no-store",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          id: 1,
          params: {
            name: "search_catalog",
            arguments: {
              meta: { "ucp-agent": { profile: PROFILE } },
              catalog: {
                query,
                filters: { available: true, ships_to: { country: "US" } },
                context: {
                  address_country: "US",
                  currency: "USD",
                  intent: `Find exact ${item.sku}; do not substitute another part number`,
                },
                pagination: { limit: 20 },
                view: "offer",
              },
            },
          },
        }),
      });
      payload = (await response.json()) as CatalogResponse;
      if (response.ok && !payload.error) break;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }

    if (!response || !payload) throw new Error("No Shopify response received");
    if (!response.ok || payload.error) {
      throw new Error(`HTTP ${response.status}: ${payload.error?.message ?? "request failed"}`);
    }

    const products = payload.result?.structuredContent?.products ?? [];
    let returnedVariantCount = 0;
    let exactVariantCount = 0;
    let exactAvailableVariantCount = 0;
    let exactCheckoutUrlCount = 0;

    for (const product of products) {
      for (const variant of product.variants ?? []) {
        returnedVariantCount += 1;
        const searchable = [
          product.title,
          product.description?.plain,
          product.description?.html,
          variant.title,
          variant.description?.plain,
          variant.sku,
        ]
          .filter(Boolean)
          .join(" ");
        if (!hasExactPartNumber(searchable, item.sku)) continue;
        exactVariantCount += 1;
        if (variant.availability?.available === true) exactAvailableVariantCount += 1;
        if (variant.checkout_url?.startsWith("https://")) exactCheckoutUrlCount += 1;
      }
    }

    results.push({
      sku: item.sku,
      status: exactVariantCount > 0 ? "present" : "not-observed",
      exactCatalogListingExists: exactVariantCount > 0,
      exactAvailableListingExists: exactAvailableVariantCount > 0,
      exactCheckoutUrlObserved: exactCheckoutUrlCount > 0,
      query,
      httpStatus: response.status,
      returnedProductCount: products.length,
      returnedVariantCount,
      exactVariantCount,
      exactAvailableVariantCount,
      exactCheckoutUrlCount,
      rejectedNeighborVariantCount: returnedVariantCount - exactVariantCount,
      completeCodes: [...new Set(item.completeCodes)].sort(),
      compatibleModels: [...new Set(item.compatibleModels)].sort(),
      compatibilitySourceIds: [...new Set(item.compatibilitySourceIds)].sort(),
      rowIds: [...new Set(item.rowIds)].sort(),
      requestedAt: startedAt,
    });
  } catch (error) {
    results.push({
      sku: item.sku,
      status: "request-error",
      exactCatalogListingExists: false,
      exactAvailableListingExists: false,
      exactCheckoutUrlObserved: false,
      query,
      error: error instanceof Error ? error.message : String(error),
      completeCodes: [...new Set(item.completeCodes)].sort(),
      compatibleModels: [...new Set(item.compatibleModels)].sort(),
      compatibilitySourceIds: [...new Set(item.compatibilitySourceIds)].sort(),
      rowIds: [...new Set(item.rowIds)].sort(),
      requestedAt: startedAt,
    });
  }
  await new Promise((resolve) => setTimeout(resolve, 600));
}

const present = results.filter((result) => result.status === "present").length;
const errors = results.filter((result) => result.status === "request-error").length;
const notObserved = results.length - present - errors;
const exactAvailable = results.filter(
  (result) => result.exactAvailableListingExists === true,
).length;

const audit = {
  auditedOn: VERIFIED_ON,
  endpoint: ENDPOINT,
  method: "Shopify Global Catalog UCP search_catalog, no-store, US, available=true",
  criterion:
    "Present means at least one returned variant contains the exact normalized SKU. Shopify catalog existence is commerce evidence only and does not establish appliance compatibility.",
  persistenceBoundary:
    "Only aggregate counts and identifiers are retained. Product, seller, price, and checkout response details are not cached.",
  platformBoundary: {
    webMcp:
      "Shopify documents WebMCP tools on every Liquid storefront and Hydrogen developer-preview storefront, with current agent support limited to Chromium-based browsers.",
    implication:
      "A catalog-present part can enter the Shopify storefront agentic cart/checkout path; this audit does not require a separate checkout transaction test per SKU.",
    sources: [
      "https://shopify.dev/docs/api/web-mcp",
      "https://shopify.dev/docs/agents/catalog",
      "https://shopify.dev/docs/agents",
    ],
  },
  summary: {
    purchaseReadyModelRows: coverage.rows.filter((row) => row.capabilityTier === "purchase-ready")
      .length,
    uniqueExactSkus: results.length,
    present,
    exactAvailable,
    notObserved,
    requestErrors: errors,
  },
  results,
};

await writeFile(
  join(outputDirectory, "shopify-global-catalog-audit.json"),
  `${JSON.stringify(audit, null, 2)}\n`,
);

const tableRows = results
  .map((result) => {
    const codes = (result.completeCodes as string[]).join(", ");
    return `| \`${result.sku}\` | ${result.status} | ${result.exactVariantCount ?? "—"} | ${result.exactAvailableVariantCount ?? "—"} | ${result.rejectedNeighborVariantCount ?? "—"} | ${codes} |`;
  })
  .join("\n");

const markdown = `# Shopify Global Catalog exact-SKU audit

Audited ${VERIFIED_ON} against \`${ENDPOINT}\` using live, credential-free, no-store UCP \`search_catalog\` requests.

## Result

- Purchase-ready model rows: ${audit.summary.purchaseReadyModelRows}
- Unique exact SKUs: ${audit.summary.uniqueExactSkus}
- Exact SKUs observed in Global Catalog: ${audit.summary.present}
- Exact SKUs with an available listing: ${audit.summary.exactAvailable}
- Exact SKUs not observed: ${audit.summary.notObserved}
- Request errors: ${audit.summary.requestErrors}

The pass criterion is exact normalized SKU presence. Catalog presence is independent commerce evidence; manufacturer or authorized-parts evidence remains responsible for complete-model compatibility. No seller result, price, or checkout response was cached.

## Results

| Exact SKU | Status | Exact variants | Exact available | Rejected neighbors | Compatible complete codes |
| --- | --- | ---: | ---: | ---: | --- |
${tableRows}

## Agentic-commerce boundary

Shopify documents WebMCP tools on every Liquid storefront and Hydrogen developer-preview storefront. Those tools expose storefront search, cart management, and navigation to a supporting browser agent. Clunk therefore treats exact-SKU Global Catalog presence as the SKU-level commerce gate and does not require a completed checkout transaction for this evidence pass. Current WebMCP agent support is limited to Chromium-based browsers.

- Shopify WebMCP: https://shopify.dev/docs/api/web-mcp
- Shopify catalogs: https://shopify.dev/docs/agents/catalog
- Shopify agentic commerce: https://shopify.dev/docs/agents
`;

await writeFile(join(outputDirectory, "shopify-global-catalog-audit.md"), markdown);

console.log(JSON.stringify(audit.summary, null, 2));
