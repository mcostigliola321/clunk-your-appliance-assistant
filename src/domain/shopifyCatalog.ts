import type { RepairPackPart } from "./types";
import { isSafePublicHttpsUrl, normalizePublicCatalogId } from "./urlSafety";

export const SHOPIFY_GLOBAL_CATALOG_ENDPOINT = "https://catalog.shopify.com/api/ucp/mcp";
export const SHOPIFY_REFERENCE_PROFILE_URL =
  "https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json";

export type ShopifyOfferKind =
  "seller-listed-oem" | "compatible-replacement" | "exact-part-listing";

export interface ShopifyPartOffer {
  productId: string;
  variantId: string;
  title: string;
  seller: string;
  sellerDomain?: string;
  price: {
    amount: number;
    currency: string;
  };
  checkoutUrl: string;
  kind: ShopifyOfferKind;
  promoted: boolean;
  placementType?: string;
  additionalCommissionPercentage?: number;
}

interface ShopifyCatalogVariant {
  id?: string;
  sku?: string | null;
  title?: string;
  description?: { plain?: string };
  price?: { amount?: number; currency?: string };
  checkout_url?: string;
  url?: string;
  placement?: {
    type?: string;
    commission?: { percentage?: { value?: number } };
  };
  availability?: { available?: boolean };
  seller?: { name?: string; domain?: string };
}

interface ShopifyCatalogProduct {
  id?: string;
  title?: string;
  description?: { plain?: string; html?: string };
  variants?: ShopifyCatalogVariant[];
}

interface ShopifyCatalogResponse {
  error?: { message?: string };
  result?: {
    structuredContent?: {
      products?: ShopifyCatalogProduct[];
    };
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function hasExactPartNumber(value: string, sku: string): boolean {
  const characters = sku.toUpperCase().match(/[A-Z0-9]/g) ?? [];
  if (characters.length === 0) return false;
  const pattern = characters.map(escapeRegExp).join("[^A-Z0-9]*");
  return new RegExp(`(?:^|[^A-Z0-9])${pattern}(?:$|[^A-Z0-9])`, "i").test(value);
}

function classifyOffer(title: string): ShopifyOfferKind {
  if (/\b(genuine|oem|original)\b/i.test(title)) return "seller-listed-oem";
  if (/\b(compatible|replacement for|replaces)\b/i.test(title)) return "compatible-replacement";
  return "exact-part-listing";
}

function offerRank(kind: ShopifyOfferKind): number {
  if (kind === "seller-listed-oem") return 0;
  if (kind === "exact-part-listing") return 1;
  return 2;
}

export function extractShopifyPartOffers(
  payload: ShopifyCatalogResponse,
  exactSku: string,
): ShopifyPartOffer[] {
  if (payload.error) throw new Error(payload.error.message ?? "Shopify returned an error.");
  const products = payload.result?.structuredContent?.products ?? [];
  const offers: ShopifyPartOffer[] = [];
  const checkoutUrls = new Set<string>();

  for (const product of products) {
    for (const variant of product.variants ?? []) {
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
      const checkoutUrl = variant.checkout_url;
      const promoted = Boolean(variant.placement);
      const destinationUrl = promoted ? variant.url : (checkoutUrl ?? variant.url);
      const amount = variant.price?.amount;
      const currency = variant.price?.currency;
      const seller = variant.seller?.name;
      if (
        !hasExactPartNumber(searchable, exactSku) ||
        variant.availability?.available !== true ||
        !isSafePublicHttpsUrl(destinationUrl) ||
        typeof amount !== "number" ||
        !currency ||
        !seller ||
        checkoutUrls.has(destinationUrl)
      )
        continue;
      checkoutUrls.add(destinationUrl);
      const title = product.title ?? `Part ${exactSku}`;
      offers.push({
        productId: product.id ?? destinationUrl,
        variantId: variant.id ?? destinationUrl,
        title,
        seller,
        ...(variant.seller?.domain ? { sellerDomain: variant.seller.domain } : {}),
        price: { amount, currency },
        checkoutUrl: destinationUrl,
        kind: classifyOffer(title),
        promoted,
        ...(variant.placement?.type ? { placementType: variant.placement.type } : {}),
        ...(typeof variant.placement?.commission?.percentage?.value === "number"
          ? {
              additionalCommissionPercentage: variant.placement.commission.percentage.value,
            }
          : {}),
      });
    }
  }

  const sellers = new Set<string>();
  return offers
    .sort((left, right) => {
      const kindDifference = offerRank(left.kind) - offerRank(right.kind);
      return kindDifference || left.price.amount - right.price.amount;
    })
    .filter((offer) => {
      const sellerKey = (offer.sellerDomain ?? offer.seller)
        .trim()
        .toLowerCase()
        .replace(/^www\./, "");
      if (sellers.has(sellerKey)) return false;
      sellers.add(sellerKey);
      return true;
    })
    .slice(0, 5);
}

export function getClunkUcpProfileUrl(): string {
  // Shopify discovery requires cache headers that static Lovable assets cannot
  // currently declare. The official capability-equivalent reference profile
  // keeps the credential-free browser lookup portable across static hosts.
  return SHOPIFY_REFERENCE_PROFILE_URL;
}

export async function searchShopifyPartOffers(
  part: RepairPackPart,
  options: { signal?: AbortSignal; fetchImpl?: typeof fetch; catalogId?: string | null } = {},
): Promise<ShopifyPartOffer[]> {
  if (!part.commerce) return [];
  const fetchImpl = options.fetchImpl ?? fetch;
  const configuredCatalogId = normalizePublicCatalogId(
    options.catalogId === undefined
      ? import.meta.env["VITE_SHOPIFY_CATALOG_ID"]
      : options.catalogId,
  );
  const response = await fetchImpl(SHOPIFY_GLOBAL_CATALOG_ENDPOINT, {
    method: "POST",
    // Shopify accepts the JSON-RPC body as text/plain. Keeping this request
    // CORS-safelisted avoids an OPTIONS preflight that the catalog endpoint
    // currently rejects, which is required for a static browser-only client.
    headers: { "content-type": "text/plain;charset=UTF-8" },
    credentials: "omit",
    cache: "no-store",
    ...(options.signal ? { signal: options.signal } : {}),
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      id: 1,
      params: {
        name: "search_catalog",
        arguments: {
          meta: { "ucp-agent": { profile: getClunkUcpProfileUrl() } },
          catalog: {
            query: part.commerce.query,
            ...(configuredCatalogId
              ? { catalog_id: configuredCatalogId, placements: ["affiliate"] }
              : {}),
            filters: { available: true, ships_to: { country: "US" } },
            context: {
              address_country: "US",
              currency: "USD",
              intent: `Exact ${part.sku} replacement part for ${part.compatibleModel}; do not substitute another part number`,
            },
            pagination: { limit: 20 },
            view: "offer",
          },
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`Shopify catalog request failed (${response.status}).`);
  return extractShopifyPartOffers((await response.json()) as ShopifyCatalogResponse, part.sku);
}

export function formatShopifyPrice(offer: ShopifyPartOffer): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: offer.price.currency,
  }).format(offer.price.amount / 100);
}
