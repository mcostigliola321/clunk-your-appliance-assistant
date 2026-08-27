# Source URL and live-catalog audit

Audit date: **2026-08-27**. Current catalog: **131 models**—48 washers, 25 dishwashers, 25 electric dryers, and 33 refrigerators—with 25 purchase-ready exact revisions and 106 guided-only entries. This audit covers the 81-model expansion, the 13-revision exact-part upgrade, the existing model-number and exact-part evidence, and the live Shopify UCP boundary. Clunk makes a user-triggered live Shopify catalog request only for purchase-ready results; it does not scrape source pages at runtime.

## 81-model expansion sweep

The expansion contains 81 distinct official manufacturer model/support URLs and 41 unique official troubleshooting URLs. One Bosch product-support URL serves both roles, producing **121 unique endpoints**. A bounded automated GET used a browser user agent, followed redirects, and enforced a 30-second per-request timeout. Result: **121/121 endpoints returned HTTP 2xx**; all **81/81 model URLs** were reachable. Three initially drafted symptom URLs were corrected to live official pages during the pass: Amana water-filter timing, Whirlpool dishwasher not-draining, and Bosch dishwasher troubleshooting.

The complete per-model source, profile, aliases/full-code rule, topology, symptom, capability, and retrieval record is in [`model-source-ledger.md`](./model-source-ledger.md). The normalized expansion data and its validation contract are in [`src/data/catalogExpansion.json`](../src/data/catalogExpansion.json) and [`catalog-expansion.schema.json`](./catalog-expansion.schema.json). No current expansion-source gap remains; storefront/CDN behavior can still change and should be re-audited before publication.

## Exact-part upgrade URL pass

The 13 compatibility pages below were reviewed at the complete-code level. Each page resolved one specific model revision to the recorded replacement SKU. The browser/search retrieval exposed the model-parts content; a parallel command-line GET returned HTTP 403 for all 13 because these storefronts block non-browser clients. That protection status is not treated as a broken link or as compatibility evidence by itself.

| Complete code → SKU           | Manufacturer / authorized evidence URL                                                                                      | Command-line audit                                           | Retrieved  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------- |
| `GFW655SSV0WW` → `WH11X39237` | https://partstore.encompass.com/model/HOTGFW655SSV0WW                                                                       | Protected (HTTP 403); authorized model listing reviewed      | 2026-08-27 |
| `GFW850SPN0RS` → `WH11X39237` | https://www.geapplianceparts.com/store/parts/ModelSectionParts/GFW850SPN0RS/4/0/0/0/CABINET_%281%29                         | Protected (HTTP 403); manufacturer diagram reviewed          | 2026-08-27 |
| `GTW335ASN1WW` → `WH23X28418` | https://www.geapplianceparts.com/store/parts/ModelSectionParts/GTW335ASN1WW/3/0/0/0/TUB_%26_MOTOR                           | Protected (HTTP 403); manufacturer diagram reviewed          | 2026-08-27 |
| `HTW265ASW0WW` → `WH23X28418` | https://partstore.encompass.com/model/HOTHTW265ASW0WW                                                                       | Protected (HTTP 403); authorized model listing reviewed      | 2026-08-27 |
| `WTW5010LW0` → `W11399437`    | https://www.whirlpoolparts.com/Shop-For-Parts/a11b5i168d2461121/Model-WTW5010LW0-Whirlpool-Washing-Machine-Drain-Pump-Parts | Protected (HTTP 403); one-result drain-pump listing reviewed | 2026-08-27 |
| `WDT730HAMZ0` → `W10876537`   | https://www.whirlpoolparts.com/Shop-For-Parts/a9b5i168d2454271/Model-WDT730HAMZ0-Whirlpool-Dishwasher-Drain-Pump-Parts      | Protected (HTTP 403); one-result drain-pump listing reviewed | 2026-08-27 |
| `MDB4949SKZ1` → `W11497943`   | https://www.whirlpoolparts.com/Shop-For-Parts/a9b4c36d2463970/Model-MDB4949SKZ1-Maytag-Dishwasher-Pump-Parts                | Protected (HTTP 403); exact drain-pump row reviewed          | 2026-08-27 |
| `KDFE204KPS0` → `W11462456`   | https://www.whirlpoolparts.com/Shop-For-Parts/a9b121d2248070/Model-KDFE204KPS0-Kitchenaid-Dishwasher-Parts?n=3              | Protected (HTTP 403); exact drain-pump row reviewed          | 2026-08-27 |
| `GFD55ESSN0WW` → `WE01X34600` | https://www.geapplianceparts.com/store/parts/ModelSectionParts/GFD55ESSN0WW/2/0/0/0/FRONT_PANEL                             | Protected (HTTP 403); manufacturer supersession reviewed     | 2026-08-27 |
| `WED4815EW1` → `W11429587`    | https://www.whirlpoolparts.com/Shop-For-Parts/a8i2691d2145566/Model-WED4815EW1-Dryer-Catch-Parts                            | Protected (HTTP 403); one-result catch listing reviewed      | 2026-08-27 |
| `WED5050LW0` → `W11429587`    | https://www.whirlpoolparts.com/Shop-For-Parts/a8b5c72d2454284/Model-WED5050LW0-Whirlpool-Dryer-Latch-Parts                  | Protected (HTTP 403); exact supersession reviewed            | 2026-08-27 |
| `WRS588FIHZ00` → `EDR1RXD1`   | https://www.whirlpoolparts.com/Shop-For-Parts/a4b5c43d2269249/Model-WRS588FIHZ00-Whirlpool-Refrigerator-Filter-Parts        | Protected (HTTP 403); exact filter row reviewed              | 2026-08-27 |
| `KRFC300ESS08` → `EDR4RXD1`   | https://www.whirlpoolparts.com/Shop-For-Parts/a4b121d2463919/Model-KRFC300ESS08-Kitchenaid-Refrigerator-Parts               | Protected (HTTP 403); exact filter row reviewed              | 2026-08-27 |

## Published-milestone evidence audit

The tables below preserve the earlier exact-part, model-label, and 19-model milestone audit. `Protected` means the URL was retrievable for evidence review but did not return a normal status to the command-line client during that earlier pass.

## Exact-part and Shopify additions

| Added source                                                                                                               | Audit result                                                                                       | Retrieved  |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------- |
| https://image-us.samsung.com/SamsungUS/home/home-appliances/refrigerators/3-door-french-door/pdp/rf28t5001/RF28T5001SR.pdf | HTTP 200; official PDF reviewed for HAF-QIN                                                        | 2026-08-27 |
| https://www.lg.com/us/business/download/resources/CT00021979/LRFLC2706S_LG_Pro_Builder_Spec_Sheet%5B20240531_231311%5D.pdf | HTTP 200; official PDF reviewed for LT1000P                                                        | 2026-08-27 |
| https://www.whirlpoolparts.com/Shop-For-Parts/a8b5c72d2170809/Model-WED4950HW0-Whirlpool-Dryer-Latch-Parts                 | Protected; authorized exact-model listing reviewed                                                 | 2026-08-27 |
| https://www.whirlpoolparts.com/Shop-For-Parts/a8b4c72d2454088/Model-MED4500MW0-Maytag-Dryer-Latch-Parts                    | Protected; authorized exact-model listing reviewed                                                 | 2026-08-27 |
| https://www.whirlpoolparts.com/Shop-For-Parts/a8b1d2169040/Model-NED4655EW1-Amana-Dryer-Parts                              | Protected; authorized exact-model listing reviewed                                                 | 2026-08-27 |
| https://www.whirlpoolparts.com/Shop-For-Parts/i183d2454535/Model-WRS315SDHZ08-Water-Filter-Parts                           | Protected; authorized exact-model listing reviewed                                                 | 2026-08-27 |
| https://shopify.dev/docs/agents/catalog                                                                                    | HTTP 200; Global Catalog endpoint/auth/cache rules reviewed                                        | 2026-08-27 |
| https://shopify.dev/docs/agents/carts-and-checkout/cart-mcp                                                                | HTTP 200; anonymous cart boundary reviewed                                                         | 2026-08-27 |
| https://shopify.dev/docs/agents/carts-and-checkout/checkout-mcp                                                            | HTTP 200; authenticated checkout boundary reviewed                                                 | 2026-08-27 |
| https://catalog.shopify.com/api/ucp/mcp                                                                                    | JSON-RPC POST succeeded for all 10 dedicated upgrade-SKU queries; GET is not a supported operation | 2026-08-27 |

The dedicated upgrade pass returned 10–20 exact available listings per SKU after Clunk's filter. Across those 10 no-store queries, 24 available neighboring results were rejected. Together with the earlier audit, the ledger now covers 17 unique exact SKUs; shared SKUs use the later count from this pass. Counts and methodology are recorded in [`shopify-ucp-integration.md`](./shopify-ucp-integration.md). Search results are not cached or persisted.

## Directly reachable during audit

| Added source                                                                                                                                                         | Result   | Retrieved  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- |
| https://owner.electrolux.com/support-articles/article/1820071-laundry-dryer-error-code-guide                                                                         | HTTP 200 | 2026-08-27 |
| https://owner.frigidaire.com/support-articles/article/1829617-dishwasher-glass-trap-and-filter-guide                                                                 | HTTP 200 | 2026-08-27 |
| https://owner.frigidaire.com/support-articles/article/1853127-what-to-do-if-your-washer-is-not-draining                                                              | HTTP 200 | 2026-08-27 |
| https://owner.frigidaire.com/support-articles/article/1858491-where-can-i-find-my-model-and-serial-number-                                                           | HTTP 200 | 2026-08-27 |
| https://owner.frigidaire.com/support-articles/kitchen/refrigerators                                                                                                  | HTTP 200 | 2026-08-27 |
| https://producthelp.amana.com/Laundry/Dryers                                                                                                                         | HTTP 200 | 2026-08-27 |
| https://producthelp.amana.com/Laundry/Washers                                                                                                                        | HTTP 200 | 2026-08-27 |
| https://producthelp.amana.com/Refrigeration                                                                                                                          | HTTP 200 | 2026-08-27 |
| https://producthelp.whirlpool.com/FAQ/Where_is_my_Model_and_Serial_Number_Located%3F                                                                                 | HTTP 200 | 2026-08-27 |
| https://products.geappliances.com/appliance/gea-specs/HTW240ASKWS/support                                                                                            | HTTP 200 | 2026-08-27 |
| https://products.geappliances.com/appliance/gea-specs/HTX24EASKWS/support                                                                                            | HTTP 200 | 2026-08-27 |
| https://www.bosch-home.com/us/en/productservice/B36CL80ENS-01                                                                                                        | HTTP 200 | 2026-08-27 |
| https://www.bosch-home.com/us/en/productservice/SHEM63W55N-01                                                                                                        | HTTP 200 | 2026-08-27 |
| https://www.geappliances.com/ge/find-model-serial-number/bottom-freezer-refrigerators.htm                                                                            | HTTP 200 | 2026-08-27 |
| https://www.geappliances.com/ge/find-model-serial-number/dishwashers.htm                                                                                             | HTTP 200 | 2026-08-27 |
| https://www.geappliances.com/ge/find-model-serial-number/dryers.htm                                                                                                  | HTTP 200 | 2026-08-27 |
| https://www.geappliances.com/ge/find-model-serial-number/front-load-washers.htm                                                                                      | HTTP 200 | 2026-08-27 |
| https://www.geappliances.com/ge/find-model-serial-number/side-by-side-refrigerators.htm                                                                              | HTTP 200 | 2026-08-27 |
| https://www.geappliances.com/ge/find-model-serial-number/top-load-washers.htm                                                                                        | HTTP 200 | 2026-08-27 |
| https://www.lg.com/us/support/help-library/lg-refrigerator-how-to-find-my-model-and-serial-number--20153578508912                                                    | HTTP 200 | 2026-08-27 |
| https://www.lg.com/us/support/product/lg-LDFN4542S.ASSESNA                                                                                                           | HTTP 200 | 2026-08-27 |
| https://www.samsung.com/us/home-appliances/dishwashers/rotary/fingerprint-resistant-53-dba-dishwasher-with-height-adjustable-rack-in-stainless-steel-dw80cg4021sraa/ | HTTP 200 | 2026-08-27 |
| https://www.samsung.com/us/home-appliances/dryers/electric/7-5-cu--ft--electric-dryer-with-sensor-dry-in-white-dve45t6000w-a3/                                       | HTTP 200 | 2026-08-27 |
| https://www.samsung.com/us/support/home-appliances/dryers/                                                                                                           | HTTP 200 | 2026-08-27 |
| https://www.samsung.com/us/support/troubleshoot/TSG10003791/                                                                                                         | HTTP 200 | 2026-08-27 |
| https://www.samsung.com/us/support/troubleshoot/TSG10004498/                                                                                                         | HTTP 200 | 2026-08-27 |

## Manufacturer-protected but reviewed

| Added source                                                                                                                                         | Audit result                                                    | Retrieved  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------- |
| https://www.amana.com/content/dam/global/documents/201305/owners-manual-W10596250-RevA.pdf                                                           | Protected; official manual reviewed                             | 2026-08-27 |
| https://www.amana.com/kitchen/dishwashers/p.dishwasher-with-triple-filter-wash-system.ADB1400AGW.html                                                | Protected; official product page reviewed                       | 2026-08-27 |
| https://www.amana.com/laundry/dryers/top-load/p.6.5-cu.-ft.-electric-dryer-with-wrinkle-prevent-option.ned4655ew.html                                | Protected; official product page reviewed                       | 2026-08-27 |
| https://www.amana.com/laundry/washers/top-load/p.large-capacity-top-load-washer-with-high-efficiency-agitator.ntw4519jw.html                         | Protected; official product page reviewed                       | 2026-08-27 |
| https://www.amana.com/refrigerators/side-by-side/p.33-inch-side-by-side-refrigerator-with-dual-pad-external-ice-and-water-dispenser.asi2175grs.html  | Protected; official product page reviewed                       | 2026-08-27 |
| https://www.bosch-home.com/us/owner-support/serial-number-finder/dishwashers                                                                         | Browser retrieval succeeded; command-line GET returned HTTP 400 | 2026-08-27 |
| https://www.bosch-home.com/us/owner-support/get-support/water-filter-finder                                                                          | Browser retrieval succeeded; command-line GET returned HTTP 400 | 2026-08-27 |
| https://www.electrolux.com/en/p/washers-dryers/dryer/ELFE7637AT                                                                                      | Protected; official product page reviewed                       | 2026-08-27 |
| https://www.frigidaire.com/en/p/owner-center/product-support/FDPH4316AS                                                                              | Protected; official support page reviewed                       | 2026-08-27 |
| https://www.frigidaire.com/en/p/owner-center/product-support/FFFW5000QW                                                                              | Protected; official support page reviewed                       | 2026-08-27 |
| https://www.frigidaire.com/en/p/owner-center/product-support/FFRE4120SW                                                                              | Protected; official support page reviewed                       | 2026-08-27 |
| https://www.frigidaire.com/en/p/owner-center/product-support/FFTW4120SW                                                                              | Protected; official support page reviewed                       | 2026-08-27 |
| https://www.frigidaire.com/en/p/owner-center/product-support/FRSS2623AS                                                                              | Protected; official support page reviewed                       | 2026-08-27 |
| https://www.kitchenaid.com/owners-center-pdp.KRFF577KPS.html                                                                                         | Protected; official owner page/manual reviewed                  | 2026-08-27 |
| https://www.maytag.com/kitchen/refrigerators/french-door/p.36-inch-wide-french-door-refrigerator-with-powercold-feature-25-cu.-ft%20.mfi2570fez.html | Protected; official product page reviewed                       | 2026-08-27 |
| https://www.maytag.com/owners-center-pdp.MFI2570FEZ.html                                                                                             | Protected; official owner page/manual reviewed                  | 2026-08-27 |

## Corrections made during the audit

- Replaced drafted category URLs that returned HTTP 404 with live official symptom articles or exact-model owner pages.
- Replaced the drafted Maytag `MDB4949SKZ` dishwasher with Amana `ADB1400AGW`; only the Amana manual proved the existing user-removable-filter path.
- Removed the universal refrigerator “fresh-food twist-in” wording. The added set includes upper-compartment, push-in, twist-lock, and base-grille designs, so Clunk now tells the person to confirm the model-specific owner location/mechanism before touching or ordering a filter.
- Updated the pre-existing Samsung refrigerator troubleshooting source to its live official slow-dispenser article while auditing the expanded refrigerator flow.
