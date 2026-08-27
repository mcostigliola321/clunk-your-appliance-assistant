# Clunk model source ledger

This ledger defines the 31-model real-appliance catalog. It is deliberately conservative: a model can have verified troubleshooting without having an exact verified replacement part. The interface labels those entries **Guided checks only**.

## Verification vocabulary

- **Official model source:** the manufacturer page identifies the model and provides owner/support material.
- **Official troubleshooting source:** manufacturer guidance supports the safe observation shown by Clunk.
- **Exact-part verified:** a manufacturer or authorized parts source maps a specific part number to the complete model/product code.
- **Variant needed:** Clunk can guide external observations but will not name a part until the complete suffix or engineering revision is known.

## Washer catalog (19 models)

| Brand      | Model family | Product-code requirement      | Model/support source                                                                                                                                            | Part state                                                                  |
| ---------- | ------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| LG         | WM3400CW     | Full suffix requested         | https://www.lg.com/us/support/product/lg-WM3400CW.ABWEVUS                                                                                                       | Guided checks only; exact-suffix part claim withdrawn after fit-check audit |
| LG         | WM4000HWA    | Full suffix requested         | https://www.lg.com/us/support/product/lg-WM4000HWA.ABWEUUS                                                                                                      | Guided checks only; family-level part evidence is insufficient              |
| Samsung    | WF45T6000AW  | `/A5` required                | https://www.samsung.com/us/home-appliances/washers/front-load/4-5-cu-ft-front-load-washer-with-vibration-reduction-technology-plus-in-white-wf45t6000aw-a5/     | Exact drain-pump assembly verified for `/A5`; professional installation     |
| Samsung    | WF45B6300AW  | `/US` required                | https://www.samsung.com/us/home-appliances/washers/front-load/4-5-cu--ft--large-capacity-smart-front-load-washer-with-super-speed-wash-in-white-wf45b6300aw-us/ | Exact drain-pump assembly verified for `/US`; professional installation     |
| GE         | GFW550SSNWW  | Exact `GFW550SSN0WW` required | https://www.geapplianceparts.com/store/parts/assembly/GFW550SSN0WW                                                                                              | **Purchase-ready:** WH11X39237 drain pump/filter; professional installation |
| GE         | GFW650SSNWW  | Engineering revision required | https://products.geappliances.com/appliance/gea-specs/GFW650SSNWW/support                                                                                       | Variant needed                                                              |
| Whirlpool  | WFW5605MW    | Engineering revision required | https://www.whirlpool.com/owners-center-pdp.WFW5605MW.html                                                                                                      | Variant needed                                                              |
| Whirlpool  | WFW6620HW    | Engineering revision required | https://www.whirlpool.com/owners-center-pdp.WFW6620HW.html                                                                                                      | Variant needed                                                              |
| Maytag     | MHW5630HW    | Engineering revision required | https://www.maytag.com/owners-center-pdp.MHW5630HW.html                                                                                                         | Variant needed                                                              |
| Maytag     | MHW6630HW    | Engineering revision required | https://www.maytag.com/owners-center-pdp.MHW6630HW.html                                                                                                         | Variant needed                                                              |
| Electrolux | ELFW7537AT   | Full product number required  | https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7537AT                                                                              | Variant needed                                                              |
| Electrolux | ELFW7637AT   | Full product number required  | https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7637AT                                                                              | Variant needed                                                              |
| LG         | WT7400CW     | Full suffix required          | https://www.lg.com/us/support/product/lg-WT7400CW.ABWEUUS                                                                                                       | Top-load visible hose path; service boundary                                |
| LG         | WT7405CW     | Full suffix required          | https://www.lg.com/us/support/product/lg-WT7405CW                                                                                                               | Top-load visible hose path; service boundary                                |
| GE         | GTW465ASNWW  | Engineering revision required | https://products.geappliances.com/appliance/gea-specs/GTW465ASNWW/support                                                                                       | Top-load visible hose path; service boundary                                |
| GE         | GTW585BSVWS  | Engineering revision required | https://products.geappliances.com/appliance/gea-specs/GTW585BSVWS/support                                                                                       | Top-load visible hose path; service boundary                                |
| Samsung    | WA45T3200AW  | `/A4` required                | https://www.samsung.com/us/home-appliances/washers/top-load/4-5-cu--ft--capacity-top-load-washer-with-vibration-reduction-technology--in-white-wa45t3200aw-a4/  | Top-load visible hose path; service boundary                                |
| Whirlpool  | WTW5057LW    | Engineering revision required | https://www.whirlpool.com/owners-center-pdp.WTW5057LW.html                                                                                                      | Top-load visible hose path; service boundary                                |
| Maytag     | MVW5430MW    | Engineering revision required | https://www.maytag.com/owners-center-pdp.MVW5430MW.html                                                                                                         | Top-load visible hose path; service boundary                                |

## Dishwasher catalog (4 models)

| Brand      | Model         | Supported symptom | Model/support source                                                                                                                                                                           | Part state                                                                   |
| ---------- | ------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Whirlpool  | WDT750SAKZ1   | Will not drain    | https://www.whirlpool.com/kitchen/dishwasher-and-cleaning/dishwashers/built-in-hidden-control-console/p.24%E2%80%9D-stainless-steel-dishwasher-with-ai-intelligent-wash-47-dba.wdt750sakz.html | **Purchase-ready:** W11412291 drain pump; internal/professional installation |
| Bosch      | SHPM65Z55N/20 | Will not drain    | https://www.bosch-home.com/us/en/productservice/SHPM65Z55N-20                                                                                                                                  | Guided checks only                                                           |
| GE         | GDF670SYVFS   | Will not drain    | https://products.geappliances.com/appliance/gea-specs/GDF670SYVFS/support                                                                                                                      | Guided checks only                                                           |
| KitchenAid | KDTM404KPS    | Will not drain    | https://www.kitchenaid.com/major-appliances/dishwashers/integrated-control/p.44-dba-dishwasher-in-printshield-finish-with-freeflex-third-rack.kdtm404kps.html                                  | Guided checks only                                                           |

## Electric dryer catalog (4 models)

| Brand     | Model        | Supported symptom         | Model/support source                                                      | Part state                                         |
| --------- | ------------ | ------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| GE        | GTD42EASJ2WW | Door will not stay closed | https://products.geappliances.com/appliance/gea-specs/GTD42EASJWW/support | **Purchase-ready:** WE01M10007 visible door strike |
| Whirlpool | WED4950HW    | Door will not stay closed | https://www.whirlpool.com/owners-center-pdp.WED4950HW.html                | Guided checks only                                 |
| Maytag    | MED4500MW    | Door will not stay closed | https://www.maytag.com/owners-center-pdp.MED4500MW.html                   | Guided checks only                                 |
| LG        | DLE3400W     | Door will not stay closed | https://www.lg.com/us/support/product/lg-DLE3400W.ABWETUS                 | Guided checks only                                 |

## Refrigerator catalog (4 models)

| Brand     | Model       | Supported symptom         | Model/support source                                                                                                                                                   | Part state                                             |
| --------- | ----------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| GE        | GSS25GYPFS  | Slow water-dispenser flow | https://products.geappliances.com/appliance/gea-specs/gss25gypfs/parts                                                                                                 | **Purchase-ready:** XWFE user-replaceable water filter |
| Whirlpool | WRS315SDHZ  | Slow water-dispenser flow | https://www.whirlpool.com/owners-center-pdp.WRS315SDHZ.html                                                                                                            | Guided checks only                                     |
| Samsung   | RF28T5001SR | Slow water-dispenser flow | https://www.samsung.com/us/home-appliances/refrigerators/3-door-french-door/28-cu-ft-large-capacity-3-door-french-door-refrigerator-in-stainless-steel-rf28t5001sr-aa/ | Guided checks only                                     |
| LG        | LRFLC2706S  | Slow water-dispenser flow | https://www.lg.com/us/refrigerators/lg-lrflc2706s-french-3-door-refrigerator                                                                                           | Guided checks only                                     |

## Shared official troubleshooting sources

- LG no-drain guidance: https://www.lg.com/us/support/help-library/lg-washing-machine-water-not-draining--20154726902590
- LG drain-pump filter cleaning: https://www.lg.com/us/support/help-library/lg-washer-how-to-clean-the-drain-pump-filter--20150206838321
- GE washer will-not-drain guidance: https://products.geappliances.com/appliance/gea-support-search-content?contentId=23081
- LG top-load OE/no-drain guidance: https://www.lg.com/us/support/help-library/lg-top-load-washer-troubleshooting-an-oe-error-code-CT00000305-1425330996723
- GE top-load washer no-drain guidance: https://www.geappliances.com/ge/service-and-support/faq-washer.htm
- Samsung front- and top-load no-drain guidance: https://www.samsung.com/us/support/troubleshoot/TSG10007110/
- Whirlpool top-load washer no-drain guidance: https://www.whirlpool.com/blog/washers-and-dryers/why-is-my-washing-machine-not-draining.html
- Maytag washer no-drain guidance: https://producthelp.maytag.com/Laundry/Washers/Product_Info/Washer_Product_Assistance/Washer_Not_Draining_or_Spinning%3F_Troubleshooting_Guide
- Electrolux E21 long pump-out guidance: https://owner.electrolux.com/support-articles/article/1820072-laundry-front-loading-washer-displaying-error-code-e21-long-pump-out-time-

## Exact-part and seller audit for the submission build

| Flagship                                         | Compatibility evidence                                                                                                                                                                                                      | Seller snapshot checked 2026-08-27                                                                                            |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| GE `GFW550SSN0WW` washer → `WH11X39237`          | [Exact-model assembly](https://www.geapplianceparts.com/store/parts/assembly/GFW550SSN0WW) and [cabinet parts listing](https://www.geapplianceparts.com/store/parts/ModelSectionParts/GFW550SSN0WW/4/0/0/0/CABINET_%281%29) | [GE Appliances Parts](https://www.geapplianceparts.com/store/parts/spec/WH11X39237): **$87.79**, **Available to add to cart** |
| Whirlpool `WDT750SAKZ1` dishwasher → `W11412291` | [Authorized exact-model part listing](https://www.whirlpoolparts.com/PartDetail/Drain-Pump/W11412291/4960707)                                                                                                               | Whirlpool Parts: **$96.67**, **In stock**                                                                                     |
| GE `GTD42EASJ2WW` dryer → `WE01M10007`           | [Exact-model front-panel and door listing](https://www.geapplianceparts.com/store/parts/ModelSectionParts/GTD42EASJ2WW/2/0/0/0/FRONT_PANEL_%26_DOOR)                                                                        | GE Appliances Parts: **$6.90**, **Available to add to cart**                                                                  |
| GE `GSS25GYPFS` refrigerator → `XWFE`            | [Exact-model replacement-parts listing](https://products.geappliances.com/appliance/gea-specs/gss25gypfs/parts)                                                                                                             | [GE Appliances Parts](https://www.geapplianceparts.com/store/parts/spec/XWFE): **$54.99**, **Available to add to cart**       |

Samsung `DC97-20621A` remains cataloged as an exact compatibility reference for the listed suffixes, but its seller state is **No longer available**, so it is not purchase-ready.

### Corrected LG evidence claim

Encompass lists `AHA75693425` against the `WM3400CW` model family at https://encompass.com/item/12525362/LG/AHA75693425/, but its live fit checker returned **This part doesn't fit** for the complete code `WM3400CW.ABWEVUS` during the 2026-08-27 audit. Family-level LG support content was not strong enough to resolve that contradiction at Clunk’s exact-code confidence level. Clunk therefore removed the LG purchase link and now labels both LG families **Guided checks only** rather than implying exact full-model compatibility.

All active flagship entries and seller snapshots were last reviewed on 2026-08-27. Clunk links to sources but does not copy manufacturer diagrams or manuals. Seller price and availability can change; checkout always happens on the seller’s site.
