# Shopify Global Catalog exact-SKU audit

Audited 2026-08-28 against `https://catalog.shopify.com/api/ucp/mcp` using live, credential-free, no-store UCP `search_catalog` requests.

## Result

- Purchase-ready model rows: 25
- Unique exact SKUs: 17
- Exact SKUs observed in Global Catalog: 17
- Exact SKUs with an available listing: 17
- Exact SKUs not observed: 0
- Request errors: 0

The pass criterion is exact normalized SKU presence. Catalog presence is independent commerce evidence; manufacturer or authorized-parts evidence remains responsible for complete-model compatibility. No seller result, price, or checkout response was cached.

## Results

| Exact SKU     | Status  | Exact variants | Exact available | Rejected neighbors | Compatible complete codes                      |
| ------------- | ------- | -------------: | --------------: | -----------------: | ---------------------------------------------- |
| `279570`      | present |             20 |              20 |                  0 | WED4950HW0                                     |
| `DA97-17376B` | present |             19 |              19 |                  1 | RF28T5001SR/AA                                 |
| `DC97-20621A` | present |             19 |              18 |                  1 | WF45B6300AW/US, WF45T6000AW/A5                 |
| `EDR1RXD1`    | present |             10 |              10 |                 10 | WRS315SDHZ08, WRS588FIHZ00                     |
| `EDR4RXD1`    | present |             20 |              20 |                  0 | KRFC300ESS08                                   |
| `LT1000P`     | present |             20 |              20 |                  0 | LRFLC2706S.ASTCNA0                             |
| `W10876537`   | present |             18 |              18 |                  2 | WDT730HAMZ0                                    |
| `W11399437`   | present |             13 |              13 |                  7 | WTW5010LW0                                     |
| `W11412291`   | present |              8 |               8 |                 12 | WDT750SAKZ1                                    |
| `W11429587`   | present |              7 |               7 |                 13 | MED4500MW0, NED4655EW1, WED4815EW1, WED5050LW0 |
| `W11462456`   | present |              7 |               7 |                 13 | KDFE204KPS0                                    |
| `W11497943`   | present |              3 |               3 |                 17 | MDB4949SKZ1                                    |
| `WE01M10007`  | present |             19 |              18 |                  1 | GTD42EASJ2WW                                   |
| `WE01X34600`  | present |              9 |               8 |                 11 | GFD55ESSN0WW                                   |
| `WH11X39237`  | present |             16 |              15 |                  4 | GFW550SSN0WW, GFW655SSV0WW, GFW850SPN0RS       |
| `WH23X28418`  | present |             18 |              18 |                  2 | GTW335ASN1WW, HTW265ASW0WW                     |
| `XWFE`        | present |             18 |              18 |                  2 | GSS25GYPFS                                     |

## Agentic-commerce boundary

Shopify documents WebMCP tools on every Liquid storefront and Hydrogen developer-preview storefront. Those tools expose storefront search, cart management, and navigation to a supporting browser agent. Clunk therefore treats exact-SKU Global Catalog presence as the SKU-level commerce gate and does not require a completed checkout transaction for this evidence pass. Current WebMCP agent support is limited to Chromium-based browsers.

- Shopify WebMCP: https://shopify.dev/docs/api/web-mcp
- Shopify catalogs: https://shopify.dev/docs/agents/catalog
- Shopify agentic commerce: https://shopify.dev/docs/agents
