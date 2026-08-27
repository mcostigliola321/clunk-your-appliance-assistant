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
  });

  it("sends the exact catalog query through UCP without credentials or caching", async () => {
    const part = APPLIANCE_CATALOG.find((entry) => entry.id === "ge-gfw550ssnww")?.exactPart;
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
});
