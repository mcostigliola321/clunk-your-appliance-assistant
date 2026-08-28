# Source URL and duplicate-applicability audit

Audited 2026-08-28. HTTP reachability is a transport check, not evidence of claim applicability.

## Result

- Registry entries: 289
- Unique URLs: 251
- Reachable with HTTP 2xx: 178
- Non-2xx: 55
- Network/timeout: 18
- Invariant errors: 0
- Duplicate URL groups: 29

## Interpretation

403 responses are treated as anti-bot/storefront access limitations, not as proof that a source is invalid. 404 responses are stale-link evidence gaps and must be repaired before relying on those URLs for new implementation. Network timeouts remain unresolved and require browser/manual re-check. The canonical matrix preserves these sources because they describe the current product catalog; the audit does not silently rewrite product evidence.

## Duplicate applicability

- https://www.bosch-home.com/us/owner-support/dishwashers/troubleshooting — source IDs: bosch-dishwasher-door, bosch-shp78cm5n34-current-1, exp-bosch-dishwasher-drain; publishers: Bosch; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.lg.com/us/support/help-library/lg-washing-machine-water-not-draining--20154726902590 — source IDs: lg-wm4000hba-current-1, lg-no-drain, exp-lg-front-washer-drain; publishers: LG; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://products.geappliances.com/appliance/gea-support-search-content?contentId=23080 — source IDs: ge-gtw325aswww-current-1, exp-ge-top-washer-drain, exp-hotpoint-top-washer-drain; publishers: GE, GE Appliances; audit: manual review required: URL is assigned to multiple publishers.
- https://www.samsung.com/us/support/troubleshoot/TSG10004498/ — source IDs: samsung-dw80cg5450sr-aa-current-1, samsung-dishwasher-support, exp-samsung-dishwasher-drain; publishers: Samsung; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://products.geappliances.com/appliance/gea-support-search-content?contentId=17381 — source IDs: ge-gtd38easwws-current-1, exp-ge-dryer-start, exp-hotpoint-dryer-start; publishers: GE, GE Appliances; audit: manual review required: URL is assigned to multiple publishers.
- https://www.samsung.com/us/support/troubleshoot/TSG10003791/ — source IDs: samsung-rf27cg5100sr-aa-current-1, samsung-refrigerator-support, exp-samsung-refrigerator-water, exp-samsung-french-refrigerator-water; publishers: Samsung; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.lg.com/us/support/help-library/lg-washer-how-to-clean-the-drain-pump-filter--20150206838321 — source IDs: lg-filter, exp-lg-front-washer-filter; publishers: LG; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.samsung.com/us/support/troubleshoot/TSG10007110/ — source IDs: samsung-no-drain, exp-samsung-washer-drain, exp-samsung-top-washer-drain; publishers: Samsung; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.samsung.com/us/support/answer/ANS10003197/ — source IDs: samsung-filter, exp-samsung-washer-filter; publishers: Samsung; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://products.geappliances.com/appliance/gea-support-search-content?contentId=23081 — source IDs: ge-guidance, exp-ge-front-washer-drain; publishers: GE Appliances; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://producthelp.whirlpool.com/Laundry/Washers/Front_Load_Washers/Cycle_Concerns/Not_Draining/Not_Draining_-_Front_Load_Washer — source IDs: whirlpool-no-drain, exp-whirlpool-front-washer-drain; publishers: Whirlpool; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://producthelp.maytag.com/Laundry/Washers/Front_Load_Washers/Cycle_Concerns/Not_Draining/Not_Draining_-_Front_Load_Washer — source IDs: maytag-no-drain, exp-maytag-front-washer-drain; publishers: Maytag; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://owner.electrolux.com/support-articles/article/1820072-laundry-front-loading-washer-displaying-error-code-e21-long-pump-out-time- — source IDs: electrolux-e21, exp-electrolux-front-washer-drain; publishers: Electrolux; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.lg.com/us/support/help-library/lg-top-load-washer-troubleshooting-an-oe-error-code-CT00000305-1425330996723 — source IDs: lg-top-load-no-drain, exp-lg-top-washer-drain; publishers: LG; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://producthelp.maytag.com/Laundry/Washers/Product_Info/Washer_Product_Assistance/Washer_Not_Draining_or_Spinning%3F_Troubleshooting_Guide — source IDs: maytag-top-load-no-drain, exp-maytag-top-washer-drain; publishers: Maytag; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://producthelp.kitchenaid.com/Dishwashers/Dishwasher/Operation/Not_Draining%2F%2FWater_Remains — source IDs: kitchenaid-dishwasher-support, exp-kitchenaid-dishwasher-drain; publishers: KitchenAid; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.lg.com/us/support/product/lg-DLE3400W.ABWETUS — source IDs: lg-dle3400w-model, lg-dryer-support; publishers: LG; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://products.geappliances.com/appliance/gea-specs/gss25gypfs/parts — source IDs: ge-gss25gypfs-model, ge-xwfe; publishers: GE, GE Appliances; audit: manual review required: URL is assigned to multiple publishers.
- https://products.geappliances.com/appliance/gea-support-search-content?contentId=17409 — source IDs: ge-refrigerator-water, exp-ge-refrigerator-water, exp-ge-side-refrigerator-water; publishers: GE Appliances; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.lg.com/us/support/product/lg-LDFN4542S.ASSESNA — source IDs: lg-ldfn4542s-model, lg-dishwasher-support; publishers: LG; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.frigidaire.com/en/p/owner-center/product-support/FFRE4120SW — source IDs: frigidaire-ffre4120sw-model, frigidaire-dryer-support; publishers: Frigidaire; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.kitchenaid.com/owners-center-pdp.KRFF577KPS.html — source IDs: kitchenaid-krff577kps-model, kitchenaid-refrigerator-support; publishers: KitchenAid; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.bosch-home.com/us/en/productservice/B36CL80ENS-01 — source IDs: bosch-b36cl80ens01-model, bosch-refrigerator-support; publishers: Bosch; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://producthelp.whirlpool.com/Refrigeration/Water_Filter_Information/Product_Assistance/Does_the_Water_Filter_Need_to_be_Replaced%253F — source IDs: exp-whirlpool-refrigerator-water, exp-whirlpool-french-refrigerator-water; publishers: Whirlpool; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://producthelp.maytag.com/Refrigeration/Water_Filter_Information/Product_Assistance/Does_the_Water_Filter_Need_to_be_Replaced%3F — source IDs: exp-maytag-refrigerator-water, exp-maytag-french-refrigerator-water; publishers: Maytag; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.lg.com/us/support/help-library/lg-refrigerator-water-dispensing-slowly-CT10000021-1337887886789 — source IDs: exp-lg-refrigerator-water, exp-lg-side-refrigerator-water; publishers: LG; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://owner.frigidaire.com/support-articles/article/1853039-what-should-i-do-if-the-dispenser-on-my-refrigerator-is-not-dispensing-water- — source IDs: exp-frigidaire-refrigerator-water, exp-frigidaire-side-refrigerator-water; publishers: Frigidaire; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://products.geappliances.com/appliance/gea-support-search-content?contentId=16240 — source IDs: exp-ge-dishwasher-drain, exp-hotpoint-dishwasher-drain; publishers: GE Appliances; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.
- https://www.bosch-home.com/us/en/productservice/WTG86403UC-01 — source IDs: bosch-wtg86403uc01-model, exp-bosch-compact-dryer-support; publishers: Bosch; audit: same-publisher reuse; row-level brand/category/topology constraints still apply.

Publisher-only differences such as “GE” versus “GE Appliances” are normalization issues, not cross-brand evidence transfer. No troubleshooting URL is reused across unrelated brands in candidate rows.

## Non-2xx and unresolved URLs

- 403 — https://encompass.com/item/11667691/Samsung/DC97-20621A/
- 403 — https://partstore.encompass.com/model/HOTGFW655SSV0WW
- 403 — https://partstore.encompass.com/model/HOTHTW265ASW0WW
- 404 — https://producthelp.maytag.com/Laundry/Dryers/Electric_Dryers
- 502 — https://producthelp.whirlpool.com/%40api/deki/pages/11745/pdf/Not%2BDispensing%2BIce%2Bor%2BWater%2B-%2BRefrigerator.pdf
- 404 — https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Operation/Not_Draining%2F%2FWater_Remains/Water_Remains_at_End_of_Cycle_-_Dishwasher
- 404 — https://producthelp.whirlpool.com/Laundry/Dryers/Electric_Dryer
- 404 — https://producthelp.whirlpool.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Water_Filter_Information
- 403 — https://www.amana.com/kitchen/dishwashers/p.dishwasher-with-triple-filter-wash-system.ADB1400AGW.html
- 403 — https://www.amana.com/laundry/dryers/dryer-comparison-chart.html
- 403 — https://www.amana.com/laundry/dryers/top-load/p.6.5-cu.-ft.-electric-dryer-with-wrinkle-prevent-option.ned4655ew.html
- 403 — https://www.amana.com/laundry/washers/top-load/p.4.3-cu.-ft.-front-load-washer-with-large-capacity.nfw5800hw.html
- 403 — https://www.amana.com/laundry/washers/top-load/p.large-capacity-top-load-washer-with-high-efficiency-agitator.ntw4519jw.html
- 403 — https://www.amana.com/refrigerators/side-by-side/p.33-inch-side-by-side-refrigerator-with-dual-pad-external-ice-and-water-dispenser.asi2175grs.html
- 403 — https://www.amana.com/refrigerators/side-by-side/p.36-inch-side-by-side-refrigerator-with-dual-pad-external-ice-and-water-dispenser.asi2575grs.html
- 404 — https://www.bosch-home.com/us/owner-support/get-support/support-selfhelp-dishwasher-not-draining
- network — https://www.electrolux.com/en/p/dishwasher/EDSH4944AS — The operation was aborted.
- network — https://www.electrolux.com/en/p/kitchen/refrigerators/french-door-refrigerators/ERMC2295AS — The operation was aborted.
- network — https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7337AW — The operation was aborted.
- network — https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7537AT — The operation was aborted.
- network — https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7637AT — The operation was aborted.
- network — https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7738AA — The operation was aborted.
- network — https://www.electrolux.com/en/p/washers-dryers/dryer/ELFE7337AW — The operation was aborted.
- network — https://www.electrolux.com/en/p/washers-dryers/dryer/ELFE7637AT — The operation was aborted.
- network — https://www.frigidaire.com/en/p/Laundry-Care/Dryers/FLVE7000AW — The operation was aborted.
- network — https://www.frigidaire.com/en/p/owner-center/product-support/FDPC4314AS — The operation was aborted.
- network — https://www.frigidaire.com/en/p/owner-center/product-support/FDPH4316AS — The operation was aborted.
- network — https://www.frigidaire.com/en/p/owner-center/product-support/FFFW5000QW — The operation was aborted.
- network — https://www.frigidaire.com/en/p/owner-center/product-support/FFRE4120SW — The operation was aborted.
- network — https://www.frigidaire.com/en/p/owner-center/product-support/FFTW4120SW — The operation was aborted.
- network — https://www.frigidaire.com/en/p/owner-center/product-support/FRFS2823AS — The operation was aborted.
- network — https://www.frigidaire.com/en/p/owner-center/product-support/FRSS2623AS — The operation was aborted.
- network — https://www.frigidaire.com/en/p/owner-center/product-support/GRFS2853AF — The operation was aborted.
- network — https://www.frigidaire.com/en/p/owner-center/product-support/GRSS2652AF — The operation was aborted.
- 403 — https://www.geapplianceparts.com/store/parts/assembly/GFW550SSN0WW
- 403 — https://www.geapplianceparts.com/store/parts/ModelSectionParts/GFD55ESSN0WW/2/0/0/0/FRONT_PANEL
- 403 — https://www.kitchenaid.com/major-appliances/dishwashers/front-controls/p.third-level-utensil-rack-dishwasher-with-30%2B-total-wash-jets%2C-39-dba-.kdfe204kps.html
- 403 — https://www.kitchenaid.com/major-appliances/dishwashers/integrated-control/p.44-dba-dishwasher-in-printshield-finish-with-freeflex-third-rack.kdtm404kps.html
- 403 — https://www.kitchenaid.com/owners-center-pdp.KRFC300ESS08.html
- 403 — https://www.kitchenaid.com/owners-center-pdp.KRFF577KPS.html
- 403 — https://www.maytag.com/kitchen/refrigerators/french-door/p.36-inch-wide-french-door-refrigerator-with-powercold-feature-25-cu.-ft%20.mfi2570fez.html
- 403 — https://www.maytag.com/owners-center-pdp.MDB4949SKZ.html
- 403 — https://www.maytag.com/owners-center-pdp.MED4500MW.html
- 403 — https://www.maytag.com/owners-center-pdp.MED6230HW.html
- 403 — https://www.maytag.com/owners-center-pdp.MED7230HW.html
- 403 — https://www.maytag.com/owners-center-pdp.MFI2570FEZ.html
- 403 — https://www.maytag.com/owners-center-pdp.MFT2772HEZ.html
- 403 — https://www.maytag.com/owners-center-pdp.MHW5500FW.html
- 403 — https://www.maytag.com/owners-center-pdp.MHW5630HW.html
- 403 — https://www.maytag.com/owners-center-pdp.MHW6630HW.html
- 403 — https://www.maytag.com/owners-center-pdp.MSS25C4MGZ.html
- 403 — https://www.maytag.com/owners-center-pdp.MVW4505MW.html
- 403 — https://www.maytag.com/owners-center-pdp.MVW5430MW.html
- 403 — https://www.whirlpool.com/blog/washers-and-dryers/why-is-my-washing-machine-not-draining.html
- 403 — https://www.whirlpool.com/kitchen/dishwasher-and-cleaning/dishwashers/built-in-hidden-control-console/p.24%E2%80%9D-stainless-steel-dishwasher-with-ai-intelligent-wash-47-dba.wdt750sakz.html
- 403 — https://www.whirlpool.com/kitchen/dishwasher-and-cleaning/dishwashers/built-in-hidden-control-console/p.quiet-dishwasher-with-3rd-rack.wdt730hamz.html
- 403 — https://www.whirlpool.com/laundry/dryers/electric/p.7.0-cu.-ft.-top-load-electric-moisture-sensing-dryer-with-steam.wed5050lw.html
- 403 — https://www.whirlpool.com/laundry/washers/front-load/p.WFW4720RW.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WDF331PAMS.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WED4815EW.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WED4950HW.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WFW5605MW.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WFW6620HW.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WRS315SDHZ.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WRS321SDHZ08.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WRS588FIHZ.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WRX735SDHZ.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WTW5010LW.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WTW5057LW.html
- 403 — https://www.whirlpool.com/owners-center-pdp.WTW5105LW.html
- 403 — https://www.whirlpoolparts.com/Shop-For-Parts/a8i2691d2145566/Model-WED4815EW1-Dryer-Catch-Parts
- 403 — https://www.whirlpoolparts.com/Shop-For-Parts/a9b121d2248070/Model-KDFE204KPS0-Kitchenaid-Dishwasher-Parts?n=3
- 403 — https://www.whirlpoolparts.com/Shop-For-Parts/i183d2454535/Model-WRS315SDHZ08-Water-Filter-Parts
