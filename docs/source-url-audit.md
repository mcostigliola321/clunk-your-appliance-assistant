# Added-source URL audit

Audit date: **2026-08-27**. Scope: every URL added for the 19-model expansion, model-number finder, exact-part upgrade, and Shopify UCP integration. A bounded automated GET followed redirects with a 5-second connection timeout and 12-second total timeout. Manufacturer storefronts that block automated clients were also opened through browser/search retrieval during the evidence review; `Protected` below means the URL was retrievable for review but did not return a normal status to the command-line client. Clunk makes a user-triggered live Shopify catalog request for purchase-ready results; it does not scrape source pages.

The complete per-model source, topology, symptom, capability, and retrieval record is in [`model-source-ledger.md`](./model-source-ledger.md). The exact-evidence pass raised the purchase-ready tier from four to 12 models.

## Exact-part and Shopify additions

| Added source                                                                                                               | Audit result                                                                           | Retrieved  |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- |
| https://image-us.samsung.com/SamsungUS/home/home-appliances/refrigerators/3-door-french-door/pdp/rf28t5001/RF28T5001SR.pdf | HTTP 200; official PDF reviewed for HAF-QIN                                            | 2026-08-27 |
| https://www.lg.com/us/business/download/resources/CT00021979/LRFLC2706S_LG_Pro_Builder_Spec_Sheet%5B20240531_231311%5D.pdf | HTTP 200; official PDF reviewed for LT1000P                                            | 2026-08-27 |
| https://www.whirlpoolparts.com/Shop-For-Parts/a8b5c72d2170809/Model-WED4950HW0-Whirlpool-Dryer-Latch-Parts                 | Protected; authorized exact-model listing reviewed                                     | 2026-08-27 |
| https://www.whirlpoolparts.com/Shop-For-Parts/a8b4c72d2454088/Model-MED4500MW0-Maytag-Dryer-Latch-Parts                    | Protected; authorized exact-model listing reviewed                                     | 2026-08-27 |
| https://www.whirlpoolparts.com/Shop-For-Parts/a8b1d2169040/Model-NED4655EW1-Amana-Dryer-Parts                              | Protected; authorized exact-model listing reviewed                                     | 2026-08-27 |
| https://www.whirlpoolparts.com/Shop-For-Parts/i183d2454535/Model-WRS315SDHZ08-Water-Filter-Parts                           | Protected; authorized exact-model listing reviewed                                     | 2026-08-27 |
| https://shopify.dev/docs/agents/catalog                                                                                    | HTTP 200; Global Catalog endpoint/auth/cache rules reviewed                            | 2026-08-27 |
| https://shopify.dev/docs/agents/carts-and-checkout/cart-mcp                                                                | HTTP 200; anonymous cart boundary reviewed                                             | 2026-08-27 |
| https://shopify.dev/docs/agents/carts-and-checkout/checkout-mcp                                                            | HTTP 200; authenticated checkout boundary reviewed                                     | 2026-08-27 |
| https://catalog.shopify.com/api/ucp/mcp                                                                                    | JSON-RPC POST succeeded for all 10 exact-SKU queries; GET is not a supported operation | 2026-08-27 |

The live UCP query returned 5–20 exact available listings per SKU after Clunk's filter. Counts and methodology are recorded in [`shopify-ucp-integration.md`](./shopify-ucp-integration.md). Search results are not cached or persisted.

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
