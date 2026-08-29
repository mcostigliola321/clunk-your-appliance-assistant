import { APPLIANCE_CATALOG } from "../src/data/applianceCatalog";
import { hasExactPartNumber } from "../src/domain/shopifyCatalog";

const ENDPOINT = "https://catalog.shopify.com/api/ucp/mcp";
const PROFILE = "https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json";
const REQUEST_GAP_MS = 1_000;

const partTerms = {
  washer: "drain pump",
  dishwasher: "drain pump",
  dryer: "door catch strike",
  refrigerator: "water filter",
} as const;

interface CatalogVariant {
  sku?: string | null;
  title?: string;
  description?: { plain?: string };
  seller?: { name?: string; domain?: string };
}

interface CatalogProduct {
  title?: string;
  description?: { plain?: string; html?: string };
  variants?: CatalogVariant[];
}

interface CatalogResponse {
  error?: { message?: string };
  result?: { structuredContent?: { products?: CatalogProduct[] } };
}

const requestedIds = new Set(process.argv.slice(2));
const entries = APPLIANCE_CATALOG.filter(
  (entry) =>
    (requestedIds.size === 0 || requestedIds.has(entry.id)) &&
    !entry.symptomCoverage.some((coverage) => coverage.capability === "purchase-ready"),
);

for (const [index, entry] of entries.entries()) {
  const code = entry.verifiedProductCodes[0] ?? entry.model;
  const query = `${entry.brand} ${code} ${partTerms[entry.kind]} exact replacement part`;
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
        id: index + 1,
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
                intent: `Candidate discovery for ${code}; compatibility must be proved separately`,
              },
              pagination: { limit: 10 },
              view: "offer",
            },
          },
        },
      }),
    });
    payload = (await response.json()) as CatalogResponse;
    if (response.ok && !payload.error) break;
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1_500));
  }

  const candidates = (payload?.result?.structuredContent?.products ?? []).flatMap((product) =>
    (product.variants ?? []).map((variant) => {
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
      return {
        product: product.title ?? "",
        variant: variant.title ?? "",
        sku: variant.sku ?? "",
        seller: variant.seller?.name ?? "",
        sellerDomain: variant.seller?.domain ?? "",
        exactCodeMention: hasExactPartNumber(searchable, code),
      };
    }),
  );

  console.log(
    JSON.stringify({
      modelId: entry.id,
      completeCodeOrFamily: code,
      query,
      httpStatus: response?.status ?? null,
      error: payload?.error?.message ?? null,
      candidates,
    }),
  );

  if (index < entries.length - 1)
    await new Promise((resolve) => setTimeout(resolve, REQUEST_GAP_MS));
}
