import { describe, expect, it, vi } from "vitest";

import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";

import {
  extractShopifyPartOffers,
  hasExactPartNumber,
  searchShopifyPartOffers,
} from "./shopifyCatalog";

function catalogPayload() {
  return {
    result: {
      structuredContent: {
        products: [
          {
            id: "exact-oem",
            title: "Genuine GE WH11X39237 washer drain pump",
            variants: [
              {
                id: "exact-oem-variant",
                sku: "WH11X39237",
                price: { amount: 8799, currency: "USD" },
                checkout_url: "https://seller.example/cart/exact-oem",
                availability: { available: true },
                seller: { name: "Parts Seller", domain: "seller.example" },
              },
            ],
          },
          {
            id: "wrong-neighbor",
            title: "GE WH11X29539 washer drain pump",
            variants: [
              {
                id: "wrong-neighbor-variant",
                sku: "WH11X29539",
                price: { amount: 4999, currency: "USD" },
                checkout_url: "https://seller.example/cart/wrong-neighbor",
                availability: { available: true },
                seller: { name: "Parts Seller" },
              },
            ],
          },
          {
            id: "exact-compatible",
            title: "Compatible replacement for WH11-X39237",
            variants: [
              {
                id: "exact-compatible-variant",
                price: { amount: 6299, currency: "USD" },
                checkout_url: "https://seller.example/cart/exact-compatible",
                availability: { available: true },
                seller: { name: "Independent Seller" },
              },
            ],
          },
          {
            id: "unavailable-exact",
            title: "WH11X39237 drain pump",
            variants: [
              {
                id: "unavailable-exact-variant",
                price: { amount: 5599, currency: "USD" },
                checkout_url: "https://seller.example/cart/unavailable",
                availability: { available: false },
                seller: { name: "Parts Seller" },
              },
            ],
          },
        ],
      },
    },
  };
}

describe("Shopify Global Catalog handoff", () => {
  it("matches the exact part number without depending on case or punctuation", () => {
    expect(hasExactPartNumber("Genuine dc97 20621a washer pump", "DC97-20621A")).toBe(true);
    expect(hasExactPartNumber("Part DC9720621A", "DC97-20621A")).toBe(true);
    expect(hasExactPartNumber("Part WH11X29539", "WH11X39237")).toBe(false);
  });

  it("keeps only available exact-SKU offers and labels merchant claims", () => {
    const offers = extractShopifyPartOffers(catalogPayload(), "WH11X39237");

    expect(offers).toHaveLength(2);
    expect(offers.map((offer) => offer.productId)).toEqual(["exact-oem", "exact-compatible"]);
    expect(offers.map((offer) => offer.kind)).toEqual([
      "seller-listed-oem",
      "compatible-replacement",
    ]);
    expect(offers.some((offer) => offer.checkoutUrl.includes("wrong-neighbor"))).toBe(false);
    expect(offers.every((offer) => offer.promoted === false)).toBe(true);
  });

  it("preserves an attributed promoted URL exactly and rejects unsafe destinations", () => {
    const attributedUrl =
      "https://seller.example/products/pump?variant=42&utm_source=shopify&utm_medium=catalog&shclid=click_1&shdid=developer_9";
    const payload = catalogPayload();
    payload.result.structuredContent.products.push({
      id: "promoted-exact",
      title: "Exact WH11X39237 drain pump",
      variants: [
        {
          id: "promoted-variant",
          sku: "WH11X39237",
          price: { amount: 7499, currency: "USD" },
          checkout_url: "https://seller.example/cart/should-not-be-used",
          url: attributedUrl,
          placement: {
            type: "affiliate",
            commission: { percentage: { value: 1.5 } },
          },
          availability: { available: true },
          seller: { name: "Promoted Seller" },
        },
      ],
    } as never);
    payload.result.structuredContent.products.push({
      id: "unsafe-exact",
      title: "Exact WH11X39237 drain pump",
      variants: [
        {
          id: "unsafe-variant",
          sku: "WH11X39237",
          price: { amount: 1, currency: "USD" },
          checkout_url: "https://127.0.0.1/private",
          availability: { available: true },
          seller: { name: "Unsafe Seller" },
        },
      ],
    });

    const offers = extractShopifyPartOffers(payload, "WH11X39237");
    const promoted = offers.find((offer) => offer.promoted);
    expect(promoted).toMatchObject({
      checkoutUrl: attributedUrl,
      placementType: "affiliate",
      additionalCommissionPercentage: 1.5,
    });
    expect(offers.some((offer) => offer.seller === "Unsafe Seller")).toBe(false);
  });

  it("sends the exact catalog query through UCP without credentials or caching", async () => {
    const part = APPLIANCE_CATALOG.find(
      (entry) => entry.id === "ge-gfw550ssnww",
    )?.symptomCoverage.find((coverage) => coverage.symptomId === "will-not-drain")
      ?.exactPartEvidence?.part;
    expect(part).toBeDefined();
    const fetchImpl = vi.fn(
      async (_input: string | URL | Request, _init?: RequestInit) =>
        new Response(JSON.stringify(catalogPayload()), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );

    const offers = await searchShopifyPartOffers(part!, { fetchImpl });
    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body)) as {
      params: {
        name: string;
        arguments: {
          meta: { "ucp-agent": { profile: string } };
          catalog: { query: string; filters: unknown };
        };
      };
    };

    expect(url).toBe("https://catalog.shopify.com/api/ucp/mcp");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "content-type": "text/plain;charset=UTF-8" },
      credentials: "omit",
      cache: "no-store",
    });
    expect(body.params.name).toBe("search_catalog");
    expect(body.params.arguments.meta["ucp-agent"].profile).toBe(
      "https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json",
    );
    expect(body.params.arguments.catalog.query).toContain("WH11X39237");
    expect(body.params.arguments.catalog.filters).toEqual({
      available: true,
      ships_to: { country: "US" },
    });
    expect(offers).toHaveLength(2);
  });

  it("adds a validated public saved catalog and placement request without credentials", async () => {
    const part = APPLIANCE_CATALOG.find((entry) => entry.id === "ge-gfw550ssnww")
      ?.symptomCoverage[0]?.exactPartEvidence?.part;
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      expect(body.params.arguments.catalog).toMatchObject({
        catalog_id: "gid://shopify/Catalog/clunk-public",
        placements: ["affiliate"],
      });
      expect(init?.headers).not.toHaveProperty("authorization");
      return new Response(JSON.stringify(catalogPayload()), { status: 200 });
    });

    await searchShopifyPartOffers(part!, {
      fetchImpl,
      catalogId: "gid://shopify/Catalog/clunk-public",
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});
