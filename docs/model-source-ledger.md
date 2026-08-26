# Clunk model source ledger

This ledger defines the first real-model catalog. It is deliberately conservative: a model can have verified troubleshooting without having an exact verified replacement part.

## Verification vocabulary

- **Official model source:** the manufacturer page identifies the model and provides owner/support material.
- **Official troubleshooting source:** manufacturer guidance supports the safe observation shown by Clunk.
- **Exact-part verified:** a manufacturer or authorized parts source maps a specific part number to the complete model/product code.
- **Variant needed:** Clunk can guide external observations but will not name a part until the complete suffix or engineering revision is known.

## Initial catalog

| Brand      | Model family | Product-code requirement              | Model/support source                                                                                                                                            | Part state                                                              |
| ---------- | ------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| LG         | WM3400CW     | Full suffix requested before purchase | https://www.lg.com/us/support/product/lg-WM3400CW.ABWEVUS                                                                                                       | Exact drain pump verified for `.ABWEVUS`; professional installation     |
| LG         | WM4000HWA    | Full suffix required                  | https://www.lg.com/us/support/product/lg-WM4000HWA.ABWEUUS                                                                                                      | Variant needed                                                          |
| Samsung    | WF45T6000AW  | `/A5` required                        | https://www.samsung.com/us/home-appliances/washers/front-load/4-5-cu-ft-front-load-washer-with-vibration-reduction-technology-plus-in-white-wf45t6000aw-a5/     | Exact drain-pump assembly verified for `/A5`; professional installation |
| Samsung    | WF45B6300AW  | `/US` required                        | https://www.samsung.com/us/home-appliances/washers/front-load/4-5-cu--ft--large-capacity-smart-front-load-washer-with-super-speed-wash-in-white-wf45b6300aw-us/ | Exact drain-pump assembly verified for `/US`; professional installation |
| GE         | GFW550SSNWW  | Engineering revision required         | https://products.geappliances.com/appliance/gea-specs/GFW550SSNWW/support                                                                                       | Variant needed                                                          |
| GE         | GFW650SSNWW  | Engineering revision required         | https://products.geappliances.com/appliance/gea-specs/GFW650SSNWW/support                                                                                       | Variant needed                                                          |
| Whirlpool  | WFW5605MW    | Engineering revision required         | https://www.whirlpool.com/owners-center-pdp.WFW5605MW.html                                                                                                      | Variant needed                                                          |
| Whirlpool  | WFW6620HW    | Engineering revision required         | https://www.whirlpool.com/owners-center-pdp.WFW6620HW.html                                                                                                      | Variant needed                                                          |
| Maytag     | MHW5630HW    | Engineering revision required         | https://www.maytag.com/owners-center-pdp.MHW5630HW.html                                                                                                         | Variant needed                                                          |
| Maytag     | MHW6630HW    | Engineering revision required         | https://www.maytag.com/owners-center-pdp.MHW6630HW.html                                                                                                         | Variant needed                                                          |
| Electrolux | ELFW7537AT   | Full product number required          | https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7537AT                                                                              | Variant needed                                                          |
| Electrolux | ELFW7637AT   | Full product number required          | https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7637AT                                                                              | Variant needed                                                          |

## Shared official troubleshooting sources

- LG no-drain guidance: https://www.lg.com/us/support/help-library/lg-washing-machine-water-not-draining--20154726902590
- LG drain-pump filter cleaning: https://www.lg.com/us/support/help-library/lg-washer-how-to-clean-the-drain-pump-filter--20150206838321
- Electrolux E21 long pump-out guidance: https://owner.electrolux.com/support-articles/article/1820072-laundry-front-loading-washer-displaying-error-code-e21-long-pump-out-time-

## Exact-part evidence included in the submission build

- LG replacement drain-pump source: https://www.lg.com/us/appliances-accessories/lg-5859e1004g-washer-drain-pump/
- Samsung authorized-parts compatibility source: https://encompass.com/item/11667691/Samsung/DC97-20621A/

All entries were last reviewed on 2026-08-26. Clunk links to sources but does not copy manufacturer diagrams or manuals.
