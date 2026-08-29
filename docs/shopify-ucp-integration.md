# Shopify Global Catalog and UCP handoff

Clunk uses Shopify Global Catalog as a live offer-discovery layer for parts whose compatibility has already been proved. It does not ask Shopify to decide which part fits an appliance.

```text
complete appliance code
  → Clunk manufacturer/authorized compatibility evidence
  → exact part SKU
  → Shopify Global Catalog search_catalog over UCP
  → exact-SKU filter in Clunk
  → person reviews seller and opens the returned merchant destination
```

This boundary matters because a catalog search can return relevant-looking neighboring SKUs. Clunk rejects every result unless the available listing contains the exact normalized part number from the repair pack. Case and punctuation may vary; the alphanumeric identity may not. Merchant terms such as “OEM,” “genuine,” or “compatible” remain visibly labeled as seller claims.

## Runtime behavior

- Endpoint: `https://catalog.shopify.com/api/ucp/mcp`
- Tool: `search_catalog`
- Protocol: JSON-RPC 2.0 with a UCP agent profile
- Filters: available offers that ship to the United States
- Browser request: credential-free, `cache: no-store`; an optional public saved-catalog identifier requests `placements: ["affiliate"]`
- Organic result: up to five exact-SKU seller rows with current price and the merchant `checkout_url` or `url`
- Promoted result: placement metadata plus Shopify's attributed variant `url`, preserved exactly as the action destination
- Failure behavior: an inline retry or an honest no-live-offer message; the static compatibility result remains intact

Clunk hosts [`public/ucp-agent-profile.json`](../public/ucp-agent-profile.json) as an inspectable declaration of its shopping capabilities. Catalog requests use Shopify's capability-equivalent reference profile because UCP discovery requires explicit cache headers that the current static Lovable host cannot set for individual assets. The JSON-RPC body is sent with Shopify's accepted `text/plain` content type so a static browser client does not trigger the catalog endpoint's unsupported CORS preflight. The repair pack records the query, exact SKU, retrieval date, and number of exact available offers observed during evidence review. Live results themselves are not persisted.

Shopify documents Global Catalog as a cross-merchant UCP catalog that requires an agent profile but no API key. Its guidance also says not to cache catalog search results and warns that inferred fields can vary in accuracy. Clunk therefore treats the catalog as current offer discovery, not compatibility evidence:

- [Shopify: About Catalogs](https://shopify.dev/docs/agents/catalog)
- [Shopify: Global Catalog MCP](https://shopify.dev/docs/agents/catalog/global-catalog)
- [Shopify: Define an agent profile](https://shopify.dev/docs/agents/get-started/profile)

## Public storefront product feeds

Some Shopify storefronts expose a root `/products.json` response. A bounded review confirmed that this can be useful for discovering candidate SKUs and merchant offers, but Shopify does not document that root route as a universal cross-store catalog or compatibility API. Storefronts may restrict access, change themes, omit SKUs, return merchant-written fit claims, or rate-limit automated clients. The authenticated REST Admin products endpoint is a different interface and is not available for arbitrary stores.

Clunk therefore does not crawl, mirror, or persist third-party Shopify storefront catalogs. A public product feed may inform a research queue or current offer candidate only when the store permits access. It can never promote a model, select a neighboring SKU, prove model-to-part compatibility, or replace exact manufacturer/authorized evidence. Runtime cross-merchant discovery stays on Global Catalog; Storefront API use, if added later, must follow Shopify's bot and rate-limit guidance.

- [Shopify: Storefront API](https://shopify.dev/docs/api/storefront/latest)
- [Shopify: API limits and Web Bot Auth](https://shopify.dev/docs/api/usage/limits)

## Saved catalogs and promoted placements

The organic path remains fully functional with no environment configuration. If Shopify has approved a saved catalog for promoted placements, a build may set the catalog's public identifier in `VITE_SHOPIFY_CATALOG_ID`. Clunk validates that identifier, sends it as `catalog.catalog_id`, and requests the `affiliate` placement. `VITE_` values are public browser configuration, never secret storage.

When Shopify marks a variant with placement metadata, Clunk labels it **Promoted · paid placement**, discloses beside the action that Clunk may earn a commission, and uses the returned attributed variant `url` without wrapping, rewriting, masking, or redirecting it. Organic offers remain clearly labeled as not paid placements. If the identifier is absent, invalid, unapproved, or returns no promoted offer, Clunk retains normal organic checkout behavior.

Shopify's promoted-placements program was an invite-led developer preview when rechecked on 2026-08-28. Code cannot perform enrollment or payout setup. The repository owner must join the waitlist, accept the Dev Dashboard agreement after approval, create or enable a saved catalog with **Earn commission**, and configure Partner/Hyperwallet payout details. These external steps are also recorded in [`release-security-checklist.md`](./release-security-checklist.md).

- [Shopify: Promoted placements](https://shopify.dev/docs/agents/catalog/promoted-placement)
- [Shopify: Global Catalog](https://shopify.dev/docs/agents/catalog/global-catalog)

## Checkout boundary

Clunk does not collect payment, create an authenticated checkout session, or call Checkout MCP. It opens the seller-provided destination in a new tab so the person can review and continue on the merchant site. For a promoted result, that destination is specifically the attributed variant URL. Shopify's Cart MCP supports unauthenticated cart iteration, while Checkout MCP requires authentication or a signed request; those are deliberately outside this static, credential-free submission.

- [Shopify: Cart MCP](https://shopify.dev/docs/agents/carts-and-checkout/cart-mcp)
- [Shopify: Checkout MCP](https://shopify.dev/docs/agents/carts-and-checkout/checkout-mcp)

## Verification snapshot — 2026-08-27

Anonymous Global Catalog searches returned the following counts of available listings that passed Clunk's exact-part-number filter. These counts are evidence that the pathway worked on the retrieval date, not stock guarantees.

| Exact SKU     | Exact available offers observed |
| ------------- | ------------------------------: |
| `WH11X39237`  |                              19 |
| `WH23X28418`  |                              20 |
| `W11399437`   |                              20 |
| `W11412291`   |                               9 |
| `W10876537`   |                              20 |
| `W11497943`   |                              20 |
| `W11462456`   |                              13 |
| `WE01M10007`  |                              19 |
| `WE01X34600`  |                              10 |
| `XWFE`        |                              19 |
| `DC97-20621A` |                              19 |
| `279570`      |                              20 |
| `W11429587`   |                              13 |
| `EDR1RXD1`    |                              20 |
| `EDR4RXD1`    |                              20 |
| `DA97-17376B` |                              20 |
| `LT1000P`     |                              20 |

The dedicated upgrade batch issued 10 fresh no-store exact-SKU queries. All returned HTTP 200 and 10–20 qualifying offers. Clunk rejected 24 available neighboring listings: seven for `W11462456`, seven for `W11429587`, ten for `WE01X34600`, and none for the other seven upgrade SKUs. The table retains the earlier same-day counts for unchanged SKUs and uses the later observation for the three shared SKUs (`WH11X39237`, `W11429587`, and `EDR1RXD1`). No catalog response was cached or persisted.

The catalog client, exact-SKU filter, schema validation, WebMCP handoff, retry state, and nearby-SKU rejection are covered by automated tests. Browser tests intercept the external request with an exact result plus a cheaper wrong SKU and verify that only the exact result reaches the screen.

### Purchase-overlay offer recheck — 2026-08-29

The 33-revision purchase overlay uses 11 exact SKUs across refrigerator filters, dishwasher drain pumps, one LG washer drain pump, and one LG dryer door hook. Fresh no-store Global Catalog requests returned at least five qualifying available offers for each SKU after exact-number filtering. The evidence row records the bounded observed count; the runtime still renders at most five offers, and neither number is a stock guarantee.

| Exact SKU     | Exact available offers retained |
| ------------- | ------------------------------: |
| `LT1000P`     |                               5 |
| `DA97-17376B` |                               5 |
| `11032531`    |                               5 |
| `EDR1RXD1`    |                               5 |
| `EDR4RXD1`    |                               5 |
| `XWFE`        |                               5 |
| `00631200`    |                               5 |
| `DD81-02635A` |                               5 |
| `DD31-00016A` |                               5 |
| `AHA75673404` |                               8 |
| `4026EL3007C` |                              10 |

Global Catalog often omitted a structured variant SKU while still placing the exact part number in the product or variant text. The audit and runtime use the same punctuation-insensitive exact-token rule across the full listing text; an empty SKU field neither admits a nearby part nor discards an otherwise exact listing.
