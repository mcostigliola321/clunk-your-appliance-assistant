import { describe, expect, it } from "vitest";

import { isSafePublicHttpsUrl, normalizePublicCatalogId } from "./urlSafety";

describe("external URL and public catalog configuration safety", () => {
  it("accepts public HTTPS destinations without rewriting them", () => {
    const value = "https://merchant.example/item?shclid=abc&shdid=developer";
    expect(isSafePublicHttpsUrl(value)).toBe(true);
    expect(value).toBe("https://merchant.example/item?shclid=abc&shdid=developer");
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,hello",
    "http://merchant.example/item",
    "https://user:pass@merchant.example/item",
    "https://localhost/item",
    "https://127.0.0.1/item",
    "https://192.168.1.5/item",
  ])("rejects unsafe destination %s", (value) => {
    expect(isSafePublicHttpsUrl(value)).toBe(false);
  });

  it("accepts only bounded, public saved-catalog identifiers", () => {
    expect(normalizePublicCatalogId(" gid://shopify/Catalog/clunk-public ")).toBe(
      "gid://shopify/Catalog/clunk-public",
    );
    expect(normalizePublicCatalogId("catalog id with spaces")).toBeNull();
    expect(normalizePublicCatalogId("x".repeat(201))).toBeNull();
  });
});
