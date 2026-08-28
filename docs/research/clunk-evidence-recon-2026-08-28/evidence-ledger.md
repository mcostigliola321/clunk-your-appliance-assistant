# Clunk appliance diagnostic evidence reconnaissance

Verified 2026-08-28. This is research documentation only; no product code was changed.

## Technical summary

The audit covers all 417 model × symptom rows: 393 for Clunk's 131-model catalog and 24 for eight recommended additions. Of the 262 missing rows in the existing roster, 86 have enough primary evidence for a conservative guided-checks candidate and 176 remain unsupported. No new row is purchase-ready because this pass did not establish symptom-specific complete-code-to-part compatibility and separate commerce evidence.

## Definitions and denominator

- “Missing” means the Cartesian gap between each model and Clunk's three current symptom IDs.
- “Candidate” means brand/category/topology evidence supports only the listed homeowner-observable checks.
- “Unsupported” includes both true topology/semantic mismatches and applicable-looking rows whose primary evidence is insufficient.
- Model identity, symptom guidance, part compatibility, and retailer availability are four separate claims.

## Counts

```json
{
  "rows": 417,
  "uniqueExistingModels": 131,
  "recommendedAdditions": 8,
  "byCategory": {
    "dishwasher": 81,
    "dryer": 81,
    "refrigerator": 105,
    "washer": 150
  },
  "bySymptom": {
    "door-will-not-close": 139,
    "slow-water-flow": 139,
    "will-not-drain": 139
  },
  "byManufacturer": {
    "Amana": 21,
    "Bosch": 33,
    "Electrolux": 24,
    "Frigidaire": 30,
    "GE": 66,
    "Hotpoint": 18,
    "KitchenAid": 12,
    "LG": 69,
    "Maytag": 36,
    "Samsung": 60,
    "Whirlpool": 48
  },
  "byCapabilityTier": {
    "guided-checks": 205,
    "purchase-ready": 25,
    "unsupported": 187
  },
  "byCoverageStatus": {
    "candidate": 99,
    "implemented": 131,
    "unsupported": 187
  },
  "existingRosterMissingOnly": {
    "guided-checks": 86,
    "unsupported": 176
  }
}
```

## Cohorts and model-specific exceptions

### washer-door-closure-observation

Scope: Brand-specific front-load or top-load washer cohorts only.

Safe checks:
- Stop the cycle and wait for the door/lid lock indicator to clear.
- Remove clothing or debris caught at the visible door/lid edge.
- Wipe only the visible latch/strike contact area with a soft damp cloth.
- Close the door/lid firmly once; do not force it or bypass the lock.

Exclusions:
- No brand transfer
- Front-load gasket steps do not apply to top-load lids
- Do not bypass, force, or replace a lock

Exception rule: Exact manual wins; absent a brand/topology source, remain unsupported.

### dishwasher-door-closure-observation

Scope: Brand-specific built-in dishwasher cohorts only.

Safe checks:
- Confirm dishes, handles, and utensils stay inside the rack envelope.
- Push both racks fully home and remove visible debris at the door seal.
- Check for visible cabinet or countertop interference without loosening hardware.
- Close the door once; do not force the latch.

Exclusions:
- No cross-brand latch assumptions
- AutoRelease/open-dry branches only on equipped models
- No hinge/spring/alignment repair

Exception rule: Use model-prefix and feature gates stated by the manufacturer.

### refrigerator-door-closure-observation

Scope: Brand-specific full-size refrigerator cohorts, split by side-by-side and French-door topology.

Safe checks:
- Move food packages, bins, drawers, or shelves that block closure.
- Wipe visible gasket soil with a soft cloth and mild soapy water.
- Check only the topology-specific mullion/flap position when the source and model support it.
- Close the door gently and observe whether it stays shut.

Exclusions:
- No sealed-system or hinge repair
- No heavy-unit movement
- French-door mullion step not used on side-by-side models

Exception rule: Model manual confirms flap/mullion, drawer, showcase-door, and leveling branches.

## Prioritized implementation backlog

1. Implement the refrigerator door-closure profile first: all 33 existing refrigerator families have brand-specific primary evidence, with side-by-side/French-door feature gates.
2. Implement dishwasher door closure for the 18 evidenced GE, Whirlpool, KitchenAid, Samsung, Bosch, and Frigidaire families; keep AutoRelease/open-dry and model-prefix branches gated.
3. Implement washer door/lid closure for the 35 evidenced LG, Samsung, Whirlpool, Maytag, Amana, and Electrolux families, split front-load from top-load copy and checks.
4. Close the 20 applicable evidence gaps before expanding further: locate model manuals or brand-specific owner guidance for GE, Hotpoint, and Frigidaire washers and LG, Maytag, Amana, Electrolux, and Hotpoint dishwashers.
5. Add the eight new roster models as guided-checks only after manual-level review and regression fixtures; do not promote any to purchase-ready in this batch.
6. Treat new symptom concepts such as “fills slowly,” “rack obstructed,” or “door seal leak” as separate reviewed IDs rather than overloading Clunk's current labels.

## Recommended new-model roster additions

- **LG WM4000HBA** (washer, front-filter) — official identity: https://www.lg.com/us/support/product/lg-WM4000HBA.ABLEVUS?tab=1; complete-code rule: Enter the complete suffix after WM4000HBA.
- **GE GTW325ASWWW** (washer, washer-top-load) — official identity: https://products.geappliances.com/appliance/gea-specs/GTW325ASWWW/support; complete-code rule: Enter the complete engineering model from the rating label.
- **Bosch SHP78CM5N/34** (dishwasher, dishwasher) — official identity: https://www.bosch-home.com/us/en/productservice/SHP78CM5N-34; complete-code rule: Enter the complete E-Nr including the slash suffix.
- **Samsung DW80CG5450SR/AA** (dishwasher, dishwasher) — official identity: https://www.samsung.com/us/home-appliances/dishwashers/rotary/smart-46-dba-dishwasher-with-stormwash-in-stainless-steel-dw80cg5450sraa/; complete-code rule: Enter the complete model code including /AA.
- **LG DLE7000W** (dryer, electric-dryer) — official identity: https://www.lg.com/us/support/product/lg-DLE7000W; complete-code rule: Enter the complete suffix after DLE7000W.
- **GE GTD38EASWWS** (dryer, electric-dryer) — official identity: https://products.geappliances.com/appliance/gea-specs/GTD38EASWWS/support; complete-code rule: Enter the complete engineering model from the door-opening label.
- **Whirlpool WRS321SDHZ** (refrigerator, side-by-side-refrigerator) — official identity: https://www.whirlpool.com/owners-center-pdp.WRS321SDHZ08.html; complete-code rule: Enter the complete model number and final engineering digits.
- **Samsung RF27CG5100SR/AA** (refrigerator, french-door-refrigerator) — official identity: https://www.samsung.com/us/business/home-appliances/refrigerators/3-door-french-door/27-cu-ft-mega-capacity-counter-depth-3-door-french-door-refrigerator-with-dual-auto-ice-maker-in-stainless-steel-rf27cg5100sraa/; complete-code rule: Enter the complete model code including /AA.

These are high-yield current/mainstream U.S. lineup candidates, not a sales-rank claim. Each remains guided-checks only.

## Explicit unsupported and evidence gaps

- 156 existing-roster rows are semantic/topology non-matches: dryer/refrigerator “will not drain,” and non-refrigerator “slow water flow.”
- 20 existing door-closure rows lack sufficiently specific brand/category evidence and remain unsupported.
- 11 new-roster model × symptom rows remain unsupported.
- No new exact part, verified-part-unavailable, retailer, or purchase-ready candidate was created.
- Full unsupported rows and their exact reasons are in `candidate-coverage.json` and `cohorts-and-exceptions.json`.

## Source-quality and duplicate-applicability audit

- Primary manufacturer model/support pages and manuals are accepted for identity.
- Manufacturer troubleshooting pages are accepted only for the stated brand, appliance category, topology, feature, and revision scope.
- Authorized-parts catalogs remain acceptable only for complete-code-to-part compatibility, never for symptom guidance.
- Retailer and Shopify evidence is commerce-only and cannot create compatibility.
- Reused source IDs are deduplicated in the source registry. Every reuse is confined to the source's explicit brand/category cohort; no cross-brand troubleshooting source is used.
- Feature branches (AutoRelease/open-dry, French-door mullion, model-prefix rack notes, error-code variants) are recorded as exceptions and require exact-model/manual confirmation.

## Exact source ledger

- **amana-adb1400agw-model** — Amana ADB1400AGW official support. Publisher: Amana. Applies to: ADB1400AGW. Quality: primary. Verified: 2026-08-28. https://www.amana.com/kitchen/dishwashers/p.dishwasher-with-triple-filter-wash-system.ADB1400AGW.html
- **amana-asi2175grs-model** — Amana ASI2175GRS official support. Publisher: Amana. Applies to: ASI2175GRS. Quality: primary. Verified: 2026-08-28. https://www.amana.com/refrigerators/side-by-side/p.33-inch-side-by-side-refrigerator-with-dual-pad-external-ice-and-water-dispenser.asi2175grs.html
- **amana-asi2575grs-model** — Amana ASI2575GRS official model/support page. Publisher: Amana. Applies to: ASI2575GRS05. Quality: primary. Verified: 2026-08-28. https://www.amana.com/refrigerators/side-by-side/p.36-inch-side-by-side-refrigerator-with-dual-pad-external-ice-and-water-dispenser.asi2575grs.html
- **amana-dishwasher-filter** — Amana dishwasher triple-filter owner manual. Publisher: Amana. Applies to: Amana ADB1400AGW. Quality: primary. Verified: 2026-08-28. https://www.amana.com/content/dam/global/documents/201305/owners-manual-W10596250-RevA.pdf
- **amana-dryer-support** — Amana dryer owner support. Publisher: Amana. Applies to: Amana electric dryers. Quality: primary. Verified: 2026-08-28. https://producthelp.amana.com/Laundry/Dryers
- **amana-front-washer-door** — Amana front-load washer door will not lock. Publisher: Amana. Applies to: Amana front-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.amana.com/Laundry/Washers/Front_Load_Washers/Door_Issues/Door_Will_Not_Lock_-_Front_Load_Washer
- **amana-ned4655ew-model** — Amana NED4655EW official support. Publisher: Amana. Applies to: NED4655EW. Quality: primary. Verified: 2026-08-28. https://www.amana.com/laundry/dryers/top-load/p.6.5-cu.-ft.-electric-dryer-with-wrinkle-prevent-option.ned4655ew.html
- **amana-ned5800hw-model** — Amana NED5800HW official model/support page. Publisher: Amana. Applies to: NED5800HW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.amana.com/laundry/dryers/dryer-comparison-chart.html
- **amana-nfw5800hw-model** — Amana NFW5800HW official model/support page. Publisher: Amana. Applies to: NFW5800HW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.amana.com/laundry/washers/top-load/p.4.3-cu.-ft.-front-load-washer-with-large-capacity.nfw5800hw.html
- **amana-ntw4519jw-model** — Amana NTW4519JW official support. Publisher: Amana. Applies to: NTW4519JW. Quality: primary. Verified: 2026-08-28. https://www.amana.com/laundry/washers/top-load/p.large-capacity-top-load-washer-with-high-efficiency-agitator.ntw4519jw.html
- **amana-refrigerator-door** — Amana refrigerator door not closing. Publisher: Amana. Applies to: Amana French-door refrigerators; side-by-side models may use only obstruction/bin/level checks pending manual confirmation. Quality: primary. Verified: 2026-08-28. https://producthelp.amana.com/Refrigeration/Full-Size_Refrigerators/French_Door_Bottom_Freezer_Refrigerator/Door_Concerns/Not_Closing/Door_Not_Closing_-_Refrigerator
- **amana-refrigerator-support** — Amana refrigerator owner support. Publisher: Amana. Applies to: Amana refrigerators. Quality: primary. Verified: 2026-08-28. https://producthelp.amana.com/Refrigeration
- **amana-top-washer-lid** — Amana top-load washer lid not latching. Publisher: Amana. Applies to: Amana top-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.amana.com/Laundry/Washers/Top_Load_Washer/Operation/Not_Operating/Lid_Not_Latching_-_Washer
- **amana-w11429587-ned4655ew1** — Amana NED4655EW1 exact parts listing. Publisher: Whirlpool Parts. Applies to: Amana NED4655EW1. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a8b1d2169040/Model-NED4655EW1-Amana-Dryer-Parts
- **amana-washer-support** — Amana washer owner support. Publisher: Amana. Applies to: Amana top-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.amana.com/Laundry/Washers
- **bosch-b36cd50sns01-model** — Bosch B36CD50SNS/01 official model/support page. Publisher: Bosch. Applies to: B36CD50SNS/01. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/B36CD50SNS-01
- **bosch-b36cl80ens01-model** — Bosch B36CL80ENS/01 official support. Publisher: Bosch. Applies to: B36CL80ENS/01. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/B36CL80ENS-01
- **bosch-b36ct80sns01-model** — Bosch B36CT80SNS/01 official model/support page. Publisher: Bosch. Applies to: B36CT80SNS/01. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/B36CT80SNS-01
- **bosch-b36fd50sns01-model** — Bosch B36FD50SNS/01 official model/support page. Publisher: Bosch. Applies to: B36FD50SNS/01. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/B36FD50SNS-01
- **bosch-dishwasher-door** — Bosch dishwasher troubleshooting. Publisher: Bosch. Applies to: Bosch dishwashers; AutoAir and error-code branches are model-specific. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/owner-support/dishwashers/troubleshooting
- **bosch-dishwasher-drain** — Bosch dishwasher not draining. Publisher: Bosch. Applies to: Bosch dishwashers. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/owner-support/get-support/support-selfhelp-dishwasher-not-draining
- **bosch-refrigerator-door** — Bosch refrigerator door does not shut. Publisher: Bosch. Applies to: Bosch refrigerators; supports door-seal inspection/cleaning and service escalation. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/owner-support/get-support/self-help-fridge-does-not-shut
- **bosch-refrigerator-support** — Bosch B36CL80ENS/01 owner support. Publisher: Bosch. Applies to: Bosch refrigerators. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/B36CL80ENS-01
- **bosch-she53b75uc75-model** — Bosch SHE53B75UC/75 official model/support page. Publisher: Bosch. Applies to: SHE53B75UC/75. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/SHE53B75UC-75
- **bosch-shem63w55n01-model** — Bosch SHEM63W55N/01 official support. Publisher: Bosch. Applies to: SHEM63W55N/01. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/SHEM63W55N-01
- **bosch-shp65cm5n24-model** — Bosch SHP65CM5N/24 official model/support page. Publisher: Bosch. Applies to: SHP65CM5N/24. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/SHP65CM5N-24
- **bosch-shp78cm5n34-current-1** — Bosch will-not-drain guidance. Publisher: Bosch. Applies to: Bosch dishwasher cohort; model/revision limits in source. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/owner-support/dishwashers/troubleshooting
- **bosch-shp78cm5n34-model** — Bosch SHP78CM5N/34 official model page. Publisher: Bosch. Applies to: SHP78CM5N/34. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/SHP78CM5N-34
- **bosch-shpm65z55n20-model** — Bosch SHPM65Z55N/20 official support. Publisher: Bosch. Applies to: SHPM65Z55N/20. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/SHPM65Z55N-20
- **bosch-shx78cm5n01-model** — Bosch SHX78CM5N/01 official model/support page. Publisher: Bosch. Applies to: SHX78CM5N/01. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/SHX78CM5N-01
- **bosch-wtg86403uc01-model** — Bosch WTG86403UC/01 official model/support page. Publisher: Bosch. Applies to: WTG86403UC/01. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/WTG86403UC-01
- **electrolux-dryer-support** — Electrolux dryer door-open error guidance. Publisher: Electrolux. Applies to: Electrolux electric dryers. Quality: primary. Verified: 2026-08-28. https://owner.electrolux.com/support-articles/article/1820071-laundry-dryer-error-code-guide
- **electrolux-e21** — Electrolux E21 long pump-out guidance. Publisher: Electrolux. Applies to: Electrolux front-load washers. Quality: primary. Verified: 2026-08-28. https://owner.electrolux.com/support-articles/article/1820072-laundry-front-loading-washer-displaying-error-code-e21-long-pump-out-time-
- **electrolux-edsh4944as-model** — Electrolux EDSH4944AS official model/support page. Publisher: Electrolux. Applies to: EDSH4944AS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.electrolux.com/en/p/dishwasher/EDSH4944AS
- **electrolux-elfe7337aw-model** — Electrolux ELFE7337AW official model/support page. Publisher: Electrolux. Applies to: ELFE7337AW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.electrolux.com/en/p/washers-dryers/dryer/ELFE7337AW
- **electrolux-elfe7637at-model** — Electrolux ELFE7637AT official support. Publisher: Electrolux. Applies to: ELFE7637AT. Quality: primary. Verified: 2026-08-28. https://www.electrolux.com/en/p/washers-dryers/dryer/ELFE7637AT
- **electrolux-elfw7337aw-model** — Electrolux ELFW7337AW official model/support page. Publisher: Electrolux. Applies to: ELFW7337AW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7337AW
- **electrolux-elfw7537at-model** — Electrolux ELFW7537AT official support. Publisher: Electrolux. Applies to: ELFW7537AT. Quality: primary. Verified: 2026-08-28. https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7537AT
- **electrolux-elfw7637at-model** — Electrolux ELFW7637AT official support. Publisher: Electrolux. Applies to: ELFW7637AT. Quality: primary. Verified: 2026-08-28. https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7637AT
- **electrolux-elfw7738aa-model** — Electrolux ELFW7738AA official model/support page. Publisher: Electrolux. Applies to: ELFW7738AA family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7738AA
- **electrolux-ermc2295as-model** — Electrolux ERMC2295AS official model/support page. Publisher: Electrolux. Applies to: ERMC2295AS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.electrolux.com/en/p/kitchen/refrigerators/french-door-refrigerators/ERMC2295AS
- **electrolux-front-washer-door** — Electrolux E41 washer door-open guidance. Publisher: Electrolux. Applies to: Electrolux front-load washers. Quality: primary. Verified: 2026-08-28. https://owner.electrolux.com/support-articles/article/1820509-laundry-front-loading-washer-displaying-error-code-e41-door-is-open-
- **electrolux-refrigerator-door** — Electrolux refrigerator door issues. Publisher: Electrolux. Applies to: Electrolux refrigerators. Quality: primary. Verified: 2026-08-28. https://owner.electrolux.com/support-articles/article/refrigerators-door-issues
- **encompass-gfw655ssv0ww-wh11x39237** — GFW655SSV0WW authorized model-parts listing for WH11X39237. Publisher: Encompass. Applies to: GFW655SSV0WW. Quality: authorized-secondary. Verified: 2026-08-28. https://partstore.encompass.com/model/HOTGFW655SSV0WW
- **encompass-htw265asw0ww-wh23x28418** — HTW265ASW0WW authorized model-parts listing for WH23X28418. Publisher: Encompass. Applies to: HTW265ASW0WW. Quality: authorized-secondary. Verified: 2026-08-28. https://partstore.encompass.com/model/HOTHTW265ASW0WW
- **exp-amana-dryer-start** — Amana dryer not-starting guidance. Publisher: Amana. Applies to: Amana electric dryers. Quality: primary. Verified: 2026-08-28. https://producthelp.amana.com/Laundry/Dryers/Product_Info/Dryer_Product_Assistance/Dryer_Not_Starting_or_No_Operation
- **exp-amana-front-washer-drain** — Amana front-load washer not-draining guidance. Publisher: Amana. Applies to: Amana front-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.amana.com/Laundry/Washers/Front_Load_Washers/Cycle_Concerns/Not_Draining/Not_Draining_-_Front_Load_Washer
- **exp-amana-refrigerator-water** — Amana water-filter replacement guidance. Publisher: Amana. Applies to: Amana side-by-side refrigerators with a water filter. Quality: primary. Verified: 2026-08-28. https://producthelp.amana.com/Refrigeration/Water_Filter/Installation_Support/When_to_Change_the_Water_Filter
- **exp-bosch-compact-dryer-support** — Bosch WTG86403UC/01 product support and self-help. Publisher: Bosch. Applies to: Bosch WTG86403UC/01 visible door checks. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/en/productservice/WTG86403UC-01
- **exp-bosch-dishwasher-drain** — Bosch dishwasher not-draining guidance. Publisher: Bosch. Applies to: Bosch built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/owner-support/dishwashers/troubleshooting
- **exp-bosch-refrigerator-water** — Bosch refrigerator water-filter replacement guidance. Publisher: Bosch. Applies to: Bosch refrigerators with a water filter. Quality: primary. Verified: 2026-08-28. https://www.bosch-home.com/us/experience-bosch/heart-of-the-home/tips-and-tricks/refrigeration-tips/replace-water-filter
- **exp-electrolux-dishwasher-drain** — Electrolux dishwasher not-draining guidance. Publisher: Electrolux. Applies to: Electrolux built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://owner.electrolux.com/support-articles/article/1853203-what-to-do-if-your-electrolux-dishwasher-is-not-draining
- **exp-electrolux-dryer-start** — Electrolux dryer not-starting guidance. Publisher: Electrolux. Applies to: Electrolux electric dryers. Quality: primary. Verified: 2026-08-28. https://owner.electrolux.com/support-articles/article/1853009-what-should-i-do-if-my-dryer-does-not-start-
- **exp-electrolux-front-washer-drain** — Electrolux E21 long pump-out guidance. Publisher: Electrolux. Applies to: Electrolux front-load washers. Quality: primary. Verified: 2026-08-28. https://owner.electrolux.com/support-articles/article/1820072-laundry-front-loading-washer-displaying-error-code-e21-long-pump-out-time-
- **exp-electrolux-refrigerator-water** — Electrolux refrigerator dispenser troubleshooting. Publisher: Electrolux. Applies to: Electrolux refrigerators with a water dispenser. Quality: primary. Verified: 2026-08-28. https://owner.electrolux.com/support-articles/article/1853039-what-should-i-do-if-the-dispenser-on-my-refrigerator-is-not-dispensing-water-
- **exp-frigidaire-dishwasher-drain** — Frigidaire dishwasher not-draining guidance. Publisher: Frigidaire. Applies to: Frigidaire built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://owner.frigidaire.com/support-articles/article/dishwashers-not-draining
- **exp-frigidaire-dryer-start** — Frigidaire dryer not-starting guidance. Publisher: Frigidaire. Applies to: Frigidaire electric dryers. Quality: primary. Verified: 2026-08-28. https://owner.frigidaire.com/support-articles/article/1853009-what-should-i-do-if-my-dryer-does-not-start-
- **exp-frigidaire-refrigerator-water** — Frigidaire refrigerator dispenser troubleshooting. Publisher: Frigidaire. Applies to: Frigidaire refrigerators with a water dispenser. Quality: primary. Verified: 2026-08-28. https://owner.frigidaire.com/support-articles/article/1853039-what-should-i-do-if-the-dispenser-on-my-refrigerator-is-not-dispensing-water-
- **exp-frigidaire-side-refrigerator-water** — Frigidaire refrigerator dispenser troubleshooting. Publisher: Frigidaire. Applies to: Frigidaire side-by-side refrigerators with a water dispenser. Quality: primary. Verified: 2026-08-28. https://owner.frigidaire.com/support-articles/article/1853039-what-should-i-do-if-the-dispenser-on-my-refrigerator-is-not-dispensing-water-
- **exp-ge-dishwasher-drain** — GE dishwasher not-draining guidance. Publisher: GE Appliances. Applies to: GE built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=16240
- **exp-ge-dryer-start** — GE dryer will-not-start guidance. Publisher: GE Appliances. Applies to: GE electric dryers. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=17381
- **exp-ge-front-washer-drain** — GE front-load washer will-not-drain guidance. Publisher: GE Appliances. Applies to: GE front-load washers. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=23081
- **exp-ge-refrigerator-water** — GE refrigerator water-filter guidance. Publisher: GE Appliances. Applies to: GE refrigerators with a water dispenser. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=17409
- **exp-ge-side-refrigerator-water** — GE refrigerator water-filter guidance. Publisher: GE Appliances. Applies to: GE side-by-side refrigerators with a water dispenser. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=17409
- **exp-ge-top-washer-drain** — GE top-load washer will-not-drain guidance. Publisher: GE Appliances. Applies to: GE top-load washers. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=23080
- **exp-hotpoint-dishwasher-drain** — GE Appliances dishwasher not-draining guidance. Publisher: GE Appliances. Applies to: Hotpoint built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=16240
- **exp-hotpoint-dryer-start** — GE Appliances dryer will-not-start guidance. Publisher: GE Appliances. Applies to: Hotpoint electric dryers. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=17381
- **exp-hotpoint-top-washer-drain** — GE Appliances top-load washer will-not-drain guidance. Publisher: GE Appliances. Applies to: Hotpoint top-load washers. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=23080
- **exp-kitchenaid-dishwasher-drain** — KitchenAid dishwasher water-remains guidance. Publisher: KitchenAid. Applies to: KitchenAid built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://producthelp.kitchenaid.com/Dishwashers/Dishwasher/Operation/Not_Draining%2F%2FWater_Remains
- **exp-kitchenaid-refrigerator-water** — KitchenAid water-filter replacement guidance. Publisher: KitchenAid. Applies to: KitchenAid refrigerators with a water filter. Quality: primary. Verified: 2026-08-28. https://producthelp.kitchenaid.com/Refrigeration/Water_Filter_Information/Product_Assistance/Does_the_Water_Filter_Need_to_be_Replaced%253F
- **exp-lg-dishwasher-drain** — LG dishwasher not-draining guidance. Publisher: LG. Applies to: LG built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/how-to-fix-an-lg-dishwasher-that-is-not-draining--20155352254013
- **exp-lg-dryer-door** — LG dryer door-error guidance. Publisher: LG. Applies to: LG electric dryers. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-dryer-error-code-list--20152310891742
- **exp-lg-front-washer-drain** — LG washer water-not-draining guidance. Publisher: LG. Applies to: LG front-load washers. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-washing-machine-water-not-draining--20154726902590
- **exp-lg-front-washer-filter** — LG drain-pump filter cleaning. Publisher: LG. Applies to: LG front-load washers with the documented filter door. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-washer-how-to-clean-the-drain-pump-filter--20150206838321
- **exp-lg-refrigerator-water** — LG refrigerator slow-water guidance. Publisher: LG. Applies to: LG refrigerators with a water dispenser. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-refrigerator-water-dispensing-slowly-CT10000021-1337887886789
- **exp-lg-side-refrigerator-water** — LG refrigerator slow-water guidance. Publisher: LG. Applies to: LG side-by-side refrigerators with a water dispenser. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-refrigerator-water-dispensing-slowly-CT10000021-1337887886789
- **exp-lg-top-washer-drain** — LG top-load washer OE/no-drain guidance. Publisher: LG. Applies to: LG top-load washers. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-top-load-washer-troubleshooting-an-oe-error-code-CT00000305-1425330996723
- **exp-maytag-dishwasher-drain** — Maytag dishwasher not-draining guidance. Publisher: Maytag. Applies to: Maytag built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Dishwashers/Product_Info/Dishwasher_Product_Assistance/Dishwasher_Not_Draining
- **exp-maytag-dryer-start** — Maytag dryer not-starting guidance. Publisher: Maytag. Applies to: Maytag electric dryers. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Laundry/Dryers/Product_Info/Dryer_Product_Assistance/Dryer_Not_Starting_or_No_Operation
- **exp-maytag-french-refrigerator-water** — Maytag water-filter replacement guidance. Publisher: Maytag. Applies to: Maytag French-door refrigerators with a water filter. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Refrigeration/Water_Filter_Information/Product_Assistance/Does_the_Water_Filter_Need_to_be_Replaced%3F
- **exp-maytag-front-washer-drain** — Maytag front-load washer not-draining guidance. Publisher: Maytag. Applies to: Maytag front-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Laundry/Washers/Front_Load_Washers/Cycle_Concerns/Not_Draining/Not_Draining_-_Front_Load_Washer
- **exp-maytag-refrigerator-water** — Maytag water-filter replacement guidance. Publisher: Maytag. Applies to: Maytag refrigerators with a water filter. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Refrigeration/Water_Filter_Information/Product_Assistance/Does_the_Water_Filter_Need_to_be_Replaced%3F
- **exp-maytag-top-washer-drain** — Maytag washer not-draining or spinning guidance. Publisher: Maytag. Applies to: Maytag top-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Laundry/Washers/Product_Info/Washer_Product_Assistance/Washer_Not_Draining_or_Spinning%3F_Troubleshooting_Guide
- **exp-samsung-dishwasher-drain** — Samsung dishwasher not-draining guidance. Publisher: Samsung. Applies to: Samsung built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10004498/
- **exp-samsung-dryer-door** — Samsung dryer door-error guidance. Publisher: Samsung. Applies to: Samsung electric dryers. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10001006/
- **exp-samsung-french-refrigerator-water** — Samsung refrigerator water-dispenser troubleshooting. Publisher: Samsung. Applies to: Samsung French-door refrigerators with a water dispenser. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10003791/
- **exp-samsung-refrigerator-water** — Samsung refrigerator water-dispenser troubleshooting. Publisher: Samsung. Applies to: Samsung refrigerators with a water dispenser. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10003791/
- **exp-samsung-top-washer-drain** — Samsung washing machine will-not-drain guidance. Publisher: Samsung. Applies to: Samsung top-load washers. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10007110/
- **exp-samsung-washer-drain** — Samsung washing machine will-not-drain guidance. Publisher: Samsung. Applies to: Samsung washers. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10007110/
- **exp-samsung-washer-filter** — Samsung washer pump-filter cleaning. Publisher: Samsung. Applies to: Samsung front-load washers with the documented access door. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/answer/ANS10003197/
- **exp-whirlpool-dishwasher-drain** — Whirlpool dishwasher water-remains guidance. Publisher: Whirlpool. Applies to: Whirlpool built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Operation/Not_Draining%2F%2FWater_Remains
- **exp-whirlpool-dryer-start** — Whirlpool dryer not-starting guidance. Publisher: Whirlpool. Applies to: Whirlpool electric dryers. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Laundry/Dryers/Product_Info/Dryer_Product_Assistance/Dryer_Not_Starting_or_No_Operation
- **exp-whirlpool-french-refrigerator-water** — Whirlpool water-filter replacement guidance. Publisher: Whirlpool. Applies to: Whirlpool French-door refrigerators with a water filter. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Refrigeration/Water_Filter_Information/Product_Assistance/Does_the_Water_Filter_Need_to_be_Replaced%253F
- **exp-whirlpool-front-washer-drain** — Whirlpool front-load washer not-draining guidance. Publisher: Whirlpool. Applies to: Whirlpool front-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Laundry/Washers/Front_Load_Washers/Cycle_Concerns/Not_Draining/Not_Draining_-_Front_Load_Washer
- **exp-whirlpool-refrigerator-water** — Whirlpool water-filter replacement guidance. Publisher: Whirlpool. Applies to: Whirlpool refrigerators with a water filter. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Refrigeration/Water_Filter_Information/Product_Assistance/Does_the_Water_Filter_Need_to_be_Replaced%253F
- **exp-whirlpool-top-washer-drain** — Whirlpool top-load washer not-draining guidance. Publisher: Whirlpool. Applies to: Whirlpool top-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Laundry/Washers/Top_Load_Washer/Cycle_Concerns/Not_Draining_-_Washer
- **frigidaire-dishwasher-door** — Frigidaire dishwasher CL/Cd door-open code. Publisher: Frigidaire. Applies to: Frigidaire dishwashers that display CL or Cd; supports closure/latch confirmation only. Quality: primary. Verified: 2026-08-28. https://owner.frigidaire.com/support-articles/article/1830354-dishwasher-error-code-cl-or-cd-door-is-open
- **frigidaire-dishwasher-support** — Frigidaire dishwasher glass-trap and filter guide. Publisher: Frigidaire. Applies to: Frigidaire dishwashers. Quality: primary. Verified: 2026-08-28. https://owner.frigidaire.com/support-articles/article/1829617-dishwasher-glass-trap-and-filter-guide
- **frigidaire-dryer-support** — Frigidaire FFRE4120SW owner support. Publisher: Frigidaire. Applies to: Frigidaire electric dryers. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/owner-center/product-support/FFRE4120SW
- **frigidaire-fdpc4314as-model** — Frigidaire FDPC4314AS official model/support page. Publisher: Frigidaire. Applies to: FDPC4314AS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/owner-center/product-support/FDPC4314AS
- **frigidaire-fdph4316as-model** — Frigidaire FDPH4316AS official support. Publisher: Frigidaire. Applies to: FDPH4316AS. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/owner-center/product-support/FDPH4316AS
- **frigidaire-fffw5000qw-model** — Frigidaire FFFW5000QW official support. Publisher: Frigidaire. Applies to: FFFW5000QW. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/owner-center/product-support/FFFW5000QW
- **frigidaire-ffre4120sw-model** — Frigidaire FFRE4120SW official support. Publisher: Frigidaire. Applies to: FFRE4120SW. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/owner-center/product-support/FFRE4120SW
- **frigidaire-fftw4120sw-model** — Frigidaire FFTW4120SW official support. Publisher: Frigidaire. Applies to: FFTW4120SW. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/owner-center/product-support/FFTW4120SW
- **frigidaire-flve7000aw-model** — Frigidaire FLVE7000AW official model/support page. Publisher: Frigidaire. Applies to: FLVE7000AW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/Laundry-Care/Dryers/FLVE7000AW
- **frigidaire-frfs2823as-model** — Frigidaire FRFS2823AS official model/support page. Publisher: Frigidaire. Applies to: FRFS2823AS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/owner-center/product-support/FRFS2823AS
- **frigidaire-frss2623as-model** — Frigidaire FRSS2623AS official support. Publisher: Frigidaire. Applies to: FRSS2623AS. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/owner-center/product-support/FRSS2623AS
- **frigidaire-grfs2853af-model** — Frigidaire GRFS2853AF official model/support page. Publisher: Frigidaire. Applies to: GRFS2853AF family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/owner-center/product-support/GRFS2853AF
- **frigidaire-grss2652af-model** — Frigidaire GRSS2652AF official model/support page. Publisher: Frigidaire. Applies to: GRSS2652AF family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.frigidaire.com/en/p/owner-center/product-support/GRSS2652AF
- **frigidaire-refrigerator-door** — Frigidaire refrigerator door issues. Publisher: Frigidaire. Applies to: Frigidaire refrigerators. Quality: primary. Verified: 2026-08-28. https://owner.frigidaire.com/support-articles/article/refrigerators-door-issues
- **frigidaire-refrigerator-support** — Frigidaire refrigerator owner support. Publisher: Frigidaire. Applies to: Frigidaire refrigerators. Quality: primary. Verified: 2026-08-28. https://owner.frigidaire.com/support-articles/kitchen/refrigerators
- **frigidaire-washer-support** — Frigidaire washer not-draining guidance. Publisher: Frigidaire. Applies to: Frigidaire washers. Quality: primary. Verified: 2026-08-28. https://owner.frigidaire.com/support-articles/article/1853127-what-to-do-if-your-washer-is-not-draining
- **ge-dishwasher-door** — GE dishwasher door will not latch. Publisher: GE Appliances. Applies to: GE dishwashers; adjustable-rack note only for listed model prefixes. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=17527
- **ge-dishwasher-support** — GE dishwasher support. Publisher: GE Appliances. Applies to: GE dishwashers. Quality: primary. Verified: 2026-08-28. https://www.geappliances.com/ge/service-and-support/dishwashers.htm
- **ge-dryer-door** — GE dryer door support. Publisher: GE Appliances. Applies to: GE electric dryers. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=16635
- **ge-gdf670syvfs-model** — GE GDF670SYVFS official support. Publisher: GE. Applies to: GDF670SYVFS. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GDF670SYVFS/support
- **ge-gdt225sslss-model** — GE GDT225SSLSS official model/support page. Publisher: GE. Applies to: GDT225SSLSS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GDT225SSLSS/support
- **ge-gdt550pyrfs-model** — GE GDT550PYRFS official model/support page. Publisher: GE. Applies to: GDT550PYRFS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GDT550PYRFS/support
- **ge-gfd55essn0ww-we01x34600** — GFD55ESSN0WW front-panel diagram and current white door-strike replacement. Publisher: GE Appliances. Applies to: GFD55ESSN0WW. Quality: primary. Verified: 2026-08-28. https://www.geapplianceparts.com/store/parts/ModelSectionParts/GFD55ESSN0WW/2/0/0/0/FRONT_PANEL
- **ge-gfd55essnww-model** — GE GFD55ESSNWW official model/support page. Publisher: GE. Applies to: GFD55ESSN0WW. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GFD55ESSNWW/support
- **ge-gfe28gynfs-model** — GE GFE28GYNFS official model/support page. Publisher: GE. Applies to: GFE28GYNFS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GFE28GYNFS/support
- **ge-gfw550ssnww-model** — GE GFW550SSNWW official support. Publisher: GE. Applies to: GFW550SSNWW. Quality: primary. Verified: 2026-08-28. https://www.geapplianceparts.com/store/parts/assembly/GFW550SSN0WW
- **ge-gfw650ssnww-model** — GE GFW650SSNWW official support. Publisher: GE. Applies to: GFW650SSNWW. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GFW650SSNWW/support
- **ge-gfw655ssvww-model** — GE GFW655SSVWW official model/support page. Publisher: GE. Applies to: GFW655SSV0WW. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GFW655SSVWW/support
- **ge-gfw850spn0rs-wh11x39237** — GFW850SPN0RS cabinet diagram and current drain-pump replacement. Publisher: GE Appliances. Applies to: GFW850SPN0RS. Quality: primary. Verified: 2026-08-28. https://www.geapplianceparts.com/store/parts/ModelSectionParts/GFW850SPN0RS/4/0/0/0/CABINET_%281%29
- **ge-gfw850spnrs-model** — GE GFW850SPNRS official model/support page. Publisher: GE. Applies to: GFW850SPN0RS. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GFW850SPNRS/support
- **ge-gne27jymfs-model** — GE GNE27JYMFS official model/support page. Publisher: GE. Applies to: GNE27JYMFS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GNE27JYMFS/support
- **ge-gss23gypfs-model** — GE GSS23GYPFS official model/support page. Publisher: GE. Applies to: GSS23GYPFS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GSS23GYPFS/support
- **ge-gss25gypfs-model** — GE GSS25GYPFS official support. Publisher: GE. Applies to: GSS25GYPFS. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/gss25gypfs/parts
- **ge-gtd38easwws-current-1** — GE door-will-not-close guidance. Publisher: GE. Applies to: GE dryer cohort; model/revision limits in source. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=17381
- **ge-gtd38easwws-model** — GE GTD38EASWWS official model page. Publisher: GE. Applies to: GTD38EASWWS. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GTD38EASWWS/support
- **ge-gtd42easj2ww-model** — GE GTD42EASJ2WW official support. Publisher: GE. Applies to: GTD42EASJ2WW. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GTD42EASJWW/support
- **ge-gtw325aswww-current-1** — GE will-not-drain guidance. Publisher: GE. Applies to: GE washer cohort; model/revision limits in source. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=23080
- **ge-gtw325aswww-model** — GE GTW325ASWWW official model page. Publisher: GE. Applies to: GTW325ASWWW. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GTW325ASWWW/support
- **ge-gtw335asn1ww-wh23x28418** — GTW335ASN1WW tub and motor diagram with drain pump WH23X28418. Publisher: GE Appliances. Applies to: GTW335ASN1WW. Quality: primary. Verified: 2026-08-28. https://www.geapplianceparts.com/store/parts/ModelSectionParts/GTW335ASN1WW/3/0/0/0/TUB_%26_MOTOR
- **ge-gtw335asnww-model** — GE GTW335ASNWW official model/support page. Publisher: GE. Applies to: GTW335ASN1WW. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GTW335ASNWW/support
- **ge-gtw465asnww-model** — GE GTW465ASNWW official support. Publisher: GE. Applies to: GTW465ASNWW. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GTW465ASNWW/support
- **ge-gtw485aswwb-model** — GE GTW485ASWWB official model/support page. Publisher: GE. Applies to: GTW485ASWWB family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GTW485ASWWB/support
- **ge-gtw585bsvws-model** — GE GTW585BSVWS official support. Publisher: GE. Applies to: GTW585BSVWS. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GTW585BSVWS/support
- **ge-gtx33easkww-model** — GE GTX33EASKWW official model/support page. Publisher: GE. Applies to: GTX33EASKWW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/GTX33EASKWW/support
- **ge-guidance** — GE washer will not drain guidance. Publisher: GE Appliances. Applies to: GE front-load washers. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=23081
- **ge-ptd70ebstws-model** — GE PTD70EBSTWS official model/support page. Publisher: GE. Applies to: PTD70EBSTWS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/PTD70EBSTWS/support
- **ge-pvd28bynfs-model** — GE PVD28BYNFS official model/support page. Publisher: GE. Applies to: PVD28BYNFS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/PVD28BYNFS/support
- **ge-refrigerator-door** — GE refrigerator door will not close. Publisher: GE Appliances. Applies to: GE refrigerators and freezers; built-in leveling exclusions apply. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=18947
- **ge-refrigerator-water** — GE refrigerator water-filter guidance. Publisher: GE Appliances. Applies to: GE refrigerators with XWFE filters. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-support-search-content?contentId=17409
- **ge-top-load-no-drain** — GE top-load washer no-drain guidance. Publisher: GE Appliances. Applies to: GE top-load washers. Quality: primary. Verified: 2026-08-28. https://www.geappliances.com/ge/service-and-support/faq-washer.htm
- **ge-we01m10007** — GE GTD42EASJ2WW front panel and door parts. Publisher: GE Appliances. Applies to: GE GTD42EASJ2WW. Quality: primary. Verified: 2026-08-28. https://www.geapplianceparts.com/store/parts/ModelSectionParts/GTD42EASJ2WW/2/0/0/0/FRONT_PANEL_%26_DOOR
- **ge-wh11x39237-gfw550ssn0ww** — GE GFW550SSN0WW cabinet parts and drain-pump replacement. Publisher: GE Appliances. Applies to: GE GFW550SSN0WW. Quality: primary. Verified: 2026-08-28. https://www.geapplianceparts.com/store/parts/ModelSectionParts/GFW550SSN0WW/4/0/0/0/CABINET_%281%29
- **ge-xwfe** — GE GSS25GYPFS replacement-parts listing. Publisher: GE Appliances. Applies to: GE GSS25GYPFS. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/gss25gypfs/parts
- **hotpoint-hdf310pgrww-model** — Hotpoint HDF310PGRWW official model/support page. Publisher: Hotpoint. Applies to: HDF310PGRWW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/HDF310PGRWW/support
- **hotpoint-htw2065sbww-model** — Hotpoint HTW2065SBWW official model/support page. Publisher: Hotpoint. Applies to: HTW2065SBWW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/HTW2065SBWW/support
- **hotpoint-htw240askws-model** — Hotpoint HTW240ASKWS official support. Publisher: Hotpoint. Applies to: HTW240ASKWS. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/HTW240ASKWS/support
- **hotpoint-htw265aswww-model** — Hotpoint HTW265ASWWW official model/support page. Publisher: Hotpoint. Applies to: HTW265ASW0WW. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/HTW265ASWWW/support
- **hotpoint-htx24easkws-model** — Hotpoint HTX24EASKWS official support. Publisher: Hotpoint. Applies to: HTX24EASKWS. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/gea-specs/HTX24EASKWS/support
- **hotpoint-htx26easwww-model** — Hotpoint HTX26EASWWW official model/support page. Publisher: Hotpoint. Applies to: HTX26EASWWW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://products.geappliances.com/appliance/hotpoint-specs/HTX26EASWWW
- **kitchenaid-dishwasher-door** — KitchenAid dishwasher door will not close. Publisher: KitchenAid. Applies to: KitchenAid built-in dishwashers; Open Door Dry step only on equipped models. Quality: primary. Verified: 2026-08-28. https://producthelp.kitchenaid.com/Dishwashers/Dishwasher/Door_Concerns/Door_Will_Not_Close/Door_Will_Not_Close_-_Dishwasher
- **kitchenaid-dishwasher-support** — KitchenAid dishwasher not draining. Publisher: KitchenAid. Applies to: KitchenAid dishwashers. Quality: primary. Verified: 2026-08-28. https://producthelp.kitchenaid.com/Dishwashers/Dishwasher/Operation/Not_Draining%2F%2FWater_Remains
- **kitchenaid-kdfe204kps-model** — KitchenAid KDFE204KPS official model/support page. Publisher: KitchenAid. Applies to: KDFE204KPS0. Quality: primary. Verified: 2026-08-28. https://www.kitchenaid.com/major-appliances/dishwashers/front-controls/p.third-level-utensil-rack-dishwasher-with-30%2B-total-wash-jets%2C-39-dba-.kdfe204kps.html
- **kitchenaid-kdtm404kps-model** — KitchenAid KDTM404KPS official support. Publisher: KitchenAid. Applies to: KDTM404KPS. Quality: primary. Verified: 2026-08-28. https://www.kitchenaid.com/major-appliances/dishwashers/integrated-control/p.44-dba-dishwasher-in-printshield-finish-with-freeflex-third-rack.kdtm404kps.html
- **kitchenaid-krfc300ess-model** — KitchenAid KRFC300ESS official model/support page. Publisher: KitchenAid. Applies to: KRFC300ESS08. Quality: primary. Verified: 2026-08-28. https://www.kitchenaid.com/owners-center-pdp.KRFC300ESS08.html
- **kitchenaid-krff577kps-model** — KitchenAid KRFF577KPS official support. Publisher: KitchenAid. Applies to: KRFF577KPS. Quality: primary. Verified: 2026-08-28. https://www.kitchenaid.com/owners-center-pdp.KRFF577KPS.html
- **kitchenaid-refrigerator-door** — KitchenAid refrigerator doors not closing properly. Publisher: KitchenAid. Applies to: KitchenAid full-size refrigerators; French-door mullion guidance only on French-door models. Quality: primary. Verified: 2026-08-28. https://producthelp.kitchenaid.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Installation_Support/Doors_Not_Closing_Properly
- **kitchenaid-refrigerator-support** — KitchenAid KRFF577KPS owner support. Publisher: KitchenAid. Applies to: KitchenAid refrigerators. Quality: primary. Verified: 2026-08-28. https://www.kitchenaid.com/owners-center-pdp.KRFF577KPS.html
- **lg-dishwasher-support** — LG dishwasher owner support. Publisher: LG. Applies to: LG LDFN4542S. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-LDFN4542S.ASSESNA
- **lg-dle3400w-model** — LG DLE3400W official support. Publisher: LG. Applies to: DLE3400W. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-DLE3400W.ABWETUS
- **lg-dle6100w-model** — LG DLE6100W official model/support page. Publisher: LG. Applies to: DLE6100W.ABWETUS. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-DLE6100W.ABWETUS
- **lg-dle7000w-current-1** — LG door-will-not-close guidance. Publisher: LG. Applies to: LG dryer cohort; model/revision limits in source. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-dryer-error-code-list--20154710772482
- **lg-dle7000w-model** — LG DLE7000W official model page. Publisher: LG. Applies to: DLE7000W. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-DLE7000W
- **lg-dlex4000w-model** — LG DLEX4000W official model/support page. Publisher: LG. Applies to: DLEX4000W.ABWEUUS. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-DLEX4000W.ABWEUUS
- **lg-dryer-support** — LG electric dryer support. Publisher: LG. Applies to: LG DLE3400W. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-DLE3400W.ABWETUS
- **lg-filter** — LG drain-pump filter cleaning. Publisher: LG. Applies to: LG front-load washers with user-accessible filters. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-washer-how-to-clean-the-drain-pump-filter--20150206838321
- **lg-front-washer-door** — LG front-load washer dE/dE1/dE2 door errors. Publisher: LG. Applies to: LG front-load washers; all-model article with model-dependent visuals. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/front-load-washer-what-are-de-de1-and-de2-error-codes--1400508168566
- **lg-ldfn3432t-model** — LG LDFN3432T official model/support page. Publisher: LG. Applies to: LDFN3432T.ASTEEUS. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-LDFN3432T
- **lg-ldfn4542s-model** — LG LDFN4542S official support. Publisher: LG. Applies to: LDFN4542S. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-LDFN4542S.ASSESNA
- **lg-ldth7972s-model** — LG LDTH7972S official model/support page. Publisher: LG. Applies to: LDTH7972S.ASSESNA. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-LDTH7972S.ASSESNA?tab=1
- **lg-lfxs26973s-model** — LG LFXS26973S official model/support page. Publisher: LG. Applies to: LFXS26973S.ASTCNA2. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-LFXS26973S.ASTCNA2
- **lg-lmxs28626s-model** — LG LMXS28626S official model/support page. Publisher: LG. Applies to: LMXS28626S.ASTCNA1. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-LMXS28626S.ASTCNA1
- **lg-lrflc2706s-model** — LG LRFLC2706S official support. Publisher: LG. Applies to: LRFLC2706S. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/refrigerators/lg-lrflc2706s-french-3-door-refrigerator
- **lg-lrfws2906s-model** — LG LRFWS2906S official model/support page. Publisher: LG. Applies to: LRFWS2906S.ASTCNA1. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-LRFWS2906S.ASTCNA1
- **lg-lrsxs2706s-model** — LG LRSXS2706S official model/support page. Publisher: LG. Applies to: LRSXS2706S.ASTCNA0. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-LRSXS2706S.ASTCNA0
- **lg-lt1000p-lrflc2706s-astcna0** — LG LRFLC2706S specifications naming the LT1000P filter. Publisher: LG. Applies to: LG LRFLC2706S.ASTCNA0. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/business/download/resources/CT00021979/LRFLC2706S_LG_Pro_Builder_Spec_Sheet%5B20240531_231311%5D.pdf
- **lg-no-drain** — LG washer: water not draining. Publisher: LG. Applies to: LG front-load washers. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-washing-machine-water-not-draining--20154726902590
- **lg-refrigerator-door** — LG refrigerator door not closing properly. Publisher: LG. Applies to: LG refrigerators; all-model article with model-dependent visuals. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-refrigerator-how-to-troubleshoot-a-refrigerator-door-not-closing-properly-CT10000021-20153109606488
- **lg-refrigerator-support** — LG refrigerator water-filter support. Publisher: LG. Applies to: LG refrigerators. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-refrigerator-how-to-replace-the-water-filter--20153120724998
- **lg-top-load-no-drain** — LG top-load washer: OE drain error. Publisher: LG. Applies to: LG top-load washers. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-top-load-washer-troubleshooting-an-oe-error-code-CT00000305-1425330996723
- **lg-top-washer-lid** — LG top-load washer door will not close. Publisher: LG. Applies to: LG top-load washers; all-model article with model-dependent visuals. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/troubleshooting-an-lg-top-load-washer-door-that-will-not-close-properly-CT10000010-20152830489687
- **lg-wm3400cw-model** — LG WM3400CW official support. Publisher: LG. Applies to: WM3400CW. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WM3400CW.ABWEVUS
- **lg-wm3600hwa-model** — LG WM3600HWA official model/support page. Publisher: LG. Applies to: WM3600HWA.ABWEUUS. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WM3600HWA.ABWEUUS
- **lg-wm4000hba-current-1** — LG will-not-drain guidance. Publisher: LG. Applies to: LG washer cohort; model/revision limits in source. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/help-library/lg-washing-machine-water-not-draining--20154726902590
- **lg-wm4000hba-model** — LG WM4000HBA official model page. Publisher: LG. Applies to: WM4000HBA. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WM4000HBA.ABLEVUS?tab=1
- **lg-wm4000hwa-model** — LG WM4000HWA official support. Publisher: LG. Applies to: WM4000HWA. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WM4000HWA.ABWEUUS
- **lg-wm5500hwa-model** — LG WM5500HWA official model/support page. Publisher: LG. Applies to: WM5500HWA.ABWEUUS. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WM5500HWA.ABWEUUS
- **lg-wm6700hba-model** — LG WM6700HBA official model/support page. Publisher: LG. Applies to: WM6700HBA.ABLEVUS. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WM6700HBA.ABLEVUS
- **lg-wt6105cw-model** — LG WT6105CW official model/support page. Publisher: LG. Applies to: WT6105CW.BBWETUS. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WT6105CW
- **lg-wt7150cw-model** — LG WT7150CW official model/support page. Publisher: LG. Applies to: WT7150CW.ABWETUS. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WT7150CW.ABWETUS
- **lg-wt7300cw-model** — LG WT7300CW official model/support page. Publisher: LG. Applies to: WT7300CW.ABWEUCI. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WT7300CW.ABWEUCI
- **lg-wt7400cw-model** — LG WT7400CW official support. Publisher: LG. Applies to: WT7400CW. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WT7400CW.ABWEUUS
- **lg-wt7405cw-model** — LG WT7405CW official support. Publisher: LG. Applies to: WT7405CW. Quality: primary. Verified: 2026-08-28. https://www.lg.com/us/support/product/lg-WT7405CW
- **maytag-dryer-support** — Maytag electric dryer support. Publisher: Maytag. Applies to: Maytag electric dryers. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Laundry/Dryers/Electric_Dryers
- **maytag-filter** — Maytag front-load pump-filter cleaning. Publisher: Maytag. Applies to: Models whose owner manual confirms filter access. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Laundry/Washers/Product_Info/Washer_Cleaning_and_Care/Cleaning_the_Pump_Filter_-_Front_Load_Washer
- **maytag-front-washer-door** — Maytag front-load washer door will not lock. Publisher: Maytag. Applies to: Maytag front-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Laundry/Washers/Front_Load_Washers/Door_Issues/Door_Will_Not_Lock_or_Unlock_-_Front_Load_Washer
- **maytag-mdb4949skz-model** — Maytag MDB4949SKZ official model/support page. Publisher: Maytag. Applies to: MDB4949SKZ1. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MDB4949SKZ.html
- **maytag-med4500mw-model** — Maytag MED4500MW official support. Publisher: Maytag. Applies to: MED4500MW. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MED4500MW.html
- **maytag-med6230hw-model** — Maytag MED6230HW official model/support page. Publisher: Maytag. Applies to: MED6230HW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MED6230HW.html
- **maytag-med7230hw-model** — Maytag MED7230HW official model/support page. Publisher: Maytag. Applies to: MED7230HW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MED7230HW.html
- **maytag-mfi2570fez-model** — Maytag MFI2570FEZ official support. Publisher: Maytag. Applies to: MFI2570FEZ. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/kitchen/refrigerators/french-door/p.36-inch-wide-french-door-refrigerator-with-powercold-feature-25-cu.-ft%20.mfi2570fez.html
- **maytag-mft2772hez-model** — Maytag MFT2772HEZ official model/support page. Publisher: Maytag. Applies to: MFT2772HEZ family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MFT2772HEZ.html
- **maytag-mhw5500fw-model** — Maytag MHW5500FW official model/support page. Publisher: Maytag. Applies to: MHW5500FW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MHW5500FW.html
- **maytag-mhw5630hw-model** — Maytag MHW5630HW official support. Publisher: Maytag. Applies to: MHW5630HW. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MHW5630HW.html
- **maytag-mhw6630hw-model** — Maytag MHW6630HW official support. Publisher: Maytag. Applies to: MHW6630HW. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MHW6630HW.html
- **maytag-mss25c4mgz-model** — Maytag MSS25C4MGZ official model/support page. Publisher: Maytag. Applies to: MSS25C4MGZ03. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MSS25C4MGZ.html
- **maytag-mvw4505mw-model** — Maytag MVW4505MW official model/support page. Publisher: Maytag. Applies to: MVW4505MW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MVW4505MW.html
- **maytag-mvw5430mw-model** — Maytag MVW5430MW official support. Publisher: Maytag. Applies to: MVW5430MW. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MVW5430MW.html
- **maytag-no-drain** — Maytag front-load washer not draining. Publisher: Maytag. Applies to: Maytag front-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Laundry/Washers/Front_Load_Washers/Cycle_Concerns/Not_Draining/Not_Draining_-_Front_Load_Washer
- **maytag-refrigerator-door** — Maytag refrigerator doors not closing properly. Publisher: Maytag. Applies to: Maytag full-size refrigerators; French-door mullion guidance only on French-door models. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Refrigeration/Full-size_Refrigerators/Product_Info/Installation_Support/Doors_Not_Closing_Properly
- **maytag-refrigerator-support** — Maytag MFI2570FEZ owner support. Publisher: Maytag. Applies to: Maytag refrigerators. Quality: primary. Verified: 2026-08-28. https://www.maytag.com/owners-center-pdp.MFI2570FEZ.html
- **maytag-top-load-no-drain** — Maytag washer not draining or spinning. Publisher: Maytag. Applies to: Maytag top-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Laundry/Washers/Product_Info/Washer_Product_Assistance/Washer_Not_Draining_or_Spinning%3F_Troubleshooting_Guide
- **maytag-top-washer-lid** — Maytag top-load washer LdL lid-lock error. Publisher: Maytag. Applies to: Maytag top-load washers that display LdL; models without that code need manual confirmation. Quality: primary. Verified: 2026-08-28. https://producthelp.maytag.com/Laundry/Washers/Top_Load_Washer/Error_Codes_or_Flashing_Lights/Other_Error_Codes/LdL_-_Error_Code
- **maytag-w11429587-med4500mw0** — Maytag MED4500MW0 door-latch parts listing. Publisher: Whirlpool Parts. Applies to: Maytag MED4500MW0. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a8b4c72d2454088/Model-MED4500MW0-Maytag-Dryer-Latch-Parts
- **samsung-da97-17376b-rf28t5001sr-aa** — Samsung RF28T5001SR specifications naming the HAF-QIN filter. Publisher: Samsung. Applies to: Samsung RF28T5001SR/AA. Quality: primary. Verified: 2026-08-28. https://image-us.samsung.com/SamsungUS/home/home-appliances/refrigerators/3-door-french-door/pdp/rf28t5001/RF28T5001SR.pdf
- **samsung-dc97-20621a** — Samsung DC97-20621A compatible-model listing. Publisher: Encompass. Applies to: WF45T6000AW/A5 and WF45B6300AW/US. Quality: authorized-secondary. Verified: 2026-08-28. https://encompass.com/item/11667691/Samsung/DC97-20621A/
- **samsung-dishwasher-door** — Samsung dishwasher door does not close. Publisher: Samsung. Applies to: Samsung dishwashers; AutoRelease step only on equipped models. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshooting/TSG01001919/
- **samsung-dishwasher-support** — Samsung dishwasher owner support. Publisher: Samsung. Applies to: Samsung dishwashers. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10004498/
- **samsung-dryer-support** — Samsung dryer owner support. Publisher: Samsung. Applies to: Samsung electric dryers. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/home-appliances/dryers/
- **samsung-dve45b6300pa3-model** — Samsung DVE45B6300P/A3 official model/support page. Publisher: Samsung. Applies to: DVE45B6300P/A3. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/laundry/dryers/electric-dv6300b-front-load-smart-electric-dryer-with-steam-sanitize-7-5-cu-ft-platinum-sku-dve45b6300p-a3/
- **samsung-dve45t6000w-model** — Samsung DVE45T6000W official support. Publisher: Samsung. Applies to: DVE45T6000W. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/home-appliances/dryers/electric/7-5-cu--ft--electric-dryer-with-sensor-dry-in-white-dve45t6000w-a3/
- **samsung-dve50t5300ca3-model** — Samsung DVE50T5300C/A3 official model/support page. Publisher: Samsung. Applies to: DVE50T5300C/A3. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/service/warranty/DVE50T5300C/A3/
- **samsung-dw80b6060usaa-model** — Samsung DW80B6060US/AA official model/support page. Publisher: Samsung. Applies to: DW80B6060US/AA. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/home-appliances/dishwashers/?modelCode=DW80B6060US%2FAA
- **samsung-dw80cg4021sr-model** — Samsung DW80CG4021SR official support. Publisher: Samsung. Applies to: DW80CG4021SR. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/home-appliances/dishwashers/rotary/fingerprint-resistant-53-dba-dishwasher-with-height-adjustable-rack-in-stainless-steel-dw80cg4021sraa/
- **samsung-dw80cg5450sr-aa-current-1** — Samsung will-not-drain guidance. Publisher: Samsung. Applies to: Samsung dishwasher cohort; model/revision limits in source. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10004498/
- **samsung-dw80cg5450sr-aa-model** — Samsung DW80CG5450SR/AA official model page. Publisher: Samsung. Applies to: DW80CG5450SR/AA. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/home-appliances/dishwashers/rotary/smart-46-dba-dishwasher-with-stormwash-in-stainless-steel-dw80cg5450sraa/
- **samsung-dw80r2031usaa-model** — Samsung DW80R2031US/AA official model/support page. Publisher: Samsung. Applies to: DW80R2031US/AA. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/service/warranty/DW80R2031US/AA/
- **samsung-filter** — Samsung washer pump-filter cleaning. Publisher: Samsung. Applies to: Samsung front-load washers with user-accessible filters. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/answer/ANS10003197/
- **samsung-no-drain** — Samsung washing machine will not drain. Publisher: Samsung. Applies to: Samsung front- and top-load washers. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10007110/
- **samsung-refrigerator-door** — Samsung refrigerator or freezer doors will not close. Publisher: Samsung. Applies to: Samsung refrigerators; drawer, showcase, flap, and alignment branches are topology-specific. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10007112/
- **samsung-refrigerator-support** — Samsung refrigerator water-filter support. Publisher: Samsung. Applies to: Samsung refrigerators. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10003791/
- **samsung-rf23r6201sr-model** — Samsung RF23R6201SR official model/support page. Publisher: Samsung. Applies to: RF23R6201SR/AA. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/service/warranty/RF23R6201SR/AA/
- **samsung-rf27cg5100sr-aa-current-1** — Samsung slow-water-flow guidance. Publisher: Samsung. Applies to: Samsung refrigerator cohort; model/revision limits in source. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10003791/
- **samsung-rf27cg5100sr-aa-model** — Samsung RF27CG5100SR/AA official model page. Publisher: Samsung. Applies to: RF27CG5100SR/AA. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/business/home-appliances/refrigerators/3-door-french-door/27-cu-ft-mega-capacity-counter-depth-3-door-french-door-refrigerator-with-dual-auto-ice-maker-in-stainless-steel-rf27cg5100sraa/
- **samsung-rf28r7201sr-model** — Samsung RF28R7201SR official model/support page. Publisher: Samsung. Applies to: RF28R7201SR/AA. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/service/warranty/RF28R7201SR/AA/
- **samsung-rf28t5001sr-model** — Samsung RF28T5001SR official support. Publisher: Samsung. Applies to: RF28T5001SR. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/home-appliances/refrigerators/3-door-french-door/28-cu-ft-large-capacity-3-door-french-door-refrigerator-in-stainless-steel-rf28t5001sr-aa/
- **samsung-rs27t5200sr-model** — Samsung RS27T5200SR official model/support page. Publisher: Samsung. Applies to: RS27T5200SR/AA. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/service/warranty/RS27T5200SR/AA/
- **samsung-wa45t3200aw-model** — Samsung WA45T3200AW official support. Publisher: Samsung. Applies to: WA45T3200AW. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/home-appliances/washers/top-load/4-5-cu--ft--capacity-top-load-washer-with-vibration-reduction-technology--in-white-wa45t3200aw-a4/
- **samsung-wa50r5200aw-model** — Samsung WA50R5200AW official model/support page. Publisher: Samsung. Applies to: WA50R5200AW/US. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/service/warranty/WA50R5200AW/US/
- **samsung-wa54cg7105aw-model** — Samsung WA54CG7105AW official model/support page. Publisher: Samsung. Applies to: WA54CG7105AWUS. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/home-appliances/washers/top-load/5-4-cu-ft-extra-large-capacity-smart-top-load-washer-with-activewave-agitator-and-super-speed-wash-in-white-wa54cg7105awus/
- **samsung-wa55cg7100aw-model** — Samsung WA55CG7100AW official model/support page. Publisher: Samsung. Applies to: WA55CG7100AWUS. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/home-appliances/washers/top-load/5-5-cu-ft-extra-large-capacity-smart-top-load-washer-with-super-speed-wash-in-white-wa55cg7100awus/
- **samsung-washer-door** — Samsung washer door error guidance. Publisher: Samsung. Applies to: Samsung washers; exact error meaning varies by model and manual. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/troubleshoot/TSG10000997/
- **samsung-wf45b6300aw-model** — Samsung WF45B6300AW official support. Publisher: Samsung. Applies to: WF45B6300AW. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/home-appliances/washers/front-load/4-5-cu--ft--large-capacity-smart-front-load-washer-with-super-speed-wash-in-white-wf45b6300aw-us/
- **samsung-wf45t6000aw-model** — Samsung WF45T6000AW official support. Publisher: Samsung. Applies to: WF45T6000AW. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/home-appliances/washers/front-load/4-5-cu-ft-front-load-washer-with-vibration-reduction-technology-plus-in-white-wf45t6000aw-a5/
- **samsung-wf46bg6500av-model** — Samsung WF46BG6500AV official model/support page. Publisher: Samsung. Applies to: WF46BG6500AVUS. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/service/warranty/WF46BG6500AVUS/
- **samsung-wf53bb8700at-model** — Samsung WF53BB8700AT official model/support page. Publisher: Samsung. Applies to: WF53BB8700ATUS. Quality: primary. Verified: 2026-08-28. https://www.samsung.com/us/support/service/warranty/WF53BB8700ATUS/
- **whirlpool-279570-wed4950hw0** — Whirlpool WED4950HW0 door-latch parts listing. Publisher: Whirlpool Parts. Applies to: Whirlpool WED4950HW0. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a8b5c72d2170809/Model-WED4950HW0-Whirlpool-Dryer-Latch-Parts
- **whirlpool-dishwasher-door** — Whirlpool dishwasher door will not close. Publisher: Whirlpool. Applies to: Whirlpool built-in dishwashers; Open Door Dry step only on equipped models. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Door_Concerns/Door_Will_Not_Close/Door_Will_Not_Close_-_Dishwasher
- **whirlpool-dishwasher-drain** — Whirlpool dishwasher: water remains after a cycle. Publisher: Whirlpool. Applies to: Whirlpool built-in dishwashers. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Operation/Not_Draining%2F%2FWater_Remains/Water_Remains_at_End_of_Cycle_-_Dishwasher
- **whirlpool-dryer-support** — Whirlpool electric dryer support. Publisher: Whirlpool. Applies to: Whirlpool electric dryers. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Laundry/Dryers/Electric_Dryer
- **whirlpool-edr1rxd1-wrs315sdhz08** — Whirlpool WRS315SDHZ08 water-filter parts listing. Publisher: Whirlpool Parts. Applies to: Whirlpool WRS315SDHZ08. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/i183d2454535/Model-WRS315SDHZ08-Water-Filter-Parts
- **whirlpool-filter** — Whirlpool front-load pump-filter cleaning. Publisher: Whirlpool. Applies to: Models whose owner manual confirms filter access. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Laundry/Washers/Product_Info/Washer_Cleaning_and_Care/Cleaning_the_Pump_Filter_-_Front_Load_Washer
- **whirlpool-front-washer-door** — Whirlpool front-load washer door latching. Publisher: Whirlpool. Applies to: Whirlpool front-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Laundry/Washers/Product_Info/Washer_Product_Assistance/Latching_a_Front_Load_Washer_Door
- **whirlpool-no-drain** — Whirlpool front-load washer not draining. Publisher: Whirlpool. Applies to: Whirlpool front-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Laundry/Washers/Front_Load_Washers/Cycle_Concerns/Not_Draining/Not_Draining_-_Front_Load_Washer
- **whirlpool-refrigerator-door** — Whirlpool refrigerator doors not closing properly. Publisher: Whirlpool. Applies to: Whirlpool full-size refrigerators; French-door mullion guidance only on French-door models. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Installation_Support/Doors_Not_Closing_Properly
- **whirlpool-refrigerator-support** — Whirlpool refrigerator water and filter support. Publisher: Whirlpool. Applies to: Whirlpool refrigerators. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Water_Filter_Information
- **whirlpool-top-load-no-drain** — Whirlpool top-load washer not draining. Publisher: Whirlpool. Applies to: Whirlpool top-load washers. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/blog/washers-and-dryers/why-is-my-washing-machine-not-draining.html
- **whirlpool-top-washer-lid** — Whirlpool top-load washer lid not latching. Publisher: Whirlpool. Applies to: Whirlpool top-load washers. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/Laundry/Washers/Top_Load_Washer/Operation/Not_Operating/Lid_Not_Latching_-_Washer
- **whirlpool-w11412291** — Whirlpool W11412291 drain-pump model listing. Publisher: Whirlpool Parts. Applies to: Whirlpool WDT750SAKZ1. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/PartDetail/Drain-Pump/W11412291/4960707
- **whirlpool-wdf331pams-model** — Whirlpool WDF331PAMS official model/support page. Publisher: Whirlpool. Applies to: WDF331PAMS family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WDF331PAMS.html
- **whirlpool-wdt730hamz-model** — Whirlpool WDT730HAMZ official model/support page. Publisher: Whirlpool. Applies to: WDT730HAMZ0. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/kitchen/dishwasher-and-cleaning/dishwashers/built-in-hidden-control-console/p.quiet-dishwasher-with-3rd-rack.wdt730hamz.html
- **whirlpool-wdt750sakz1-model** — Whirlpool WDT750SAKZ1 official support. Publisher: Whirlpool. Applies to: WDT750SAKZ1. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/kitchen/dishwasher-and-cleaning/dishwashers/built-in-hidden-control-console/p.24%E2%80%9D-stainless-steel-dishwasher-with-ai-intelligent-wash-47-dba.wdt750sakz.html
- **whirlpool-wed4815ew-model** — Whirlpool WED4815EW official model/support page. Publisher: Whirlpool. Applies to: WED4815EW1. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WED4815EW.html
- **whirlpool-wed4950hw-model** — Whirlpool WED4950HW official support. Publisher: Whirlpool. Applies to: WED4950HW. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WED4950HW.html
- **whirlpool-wed5050lw-model** — Whirlpool WED5050LW official model/support page. Publisher: Whirlpool. Applies to: WED5050LW0. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/laundry/dryers/electric/p.7.0-cu.-ft.-top-load-electric-moisture-sensing-dryer-with-steam.wed5050lw.html
- **whirlpool-wfw4720rw-model** — Whirlpool WFW4720RW official model/support page. Publisher: Whirlpool. Applies to: WFW4720RW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/laundry/washers/front-load/p.WFW4720RW.html
- **whirlpool-wfw5605mw-model** — Whirlpool WFW5605MW official support. Publisher: Whirlpool. Applies to: WFW5605MW. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WFW5605MW.html
- **whirlpool-wfw6620hw-model** — Whirlpool WFW6620HW official support. Publisher: Whirlpool. Applies to: WFW6620HW. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WFW6620HW.html
- **whirlpool-wrs315sdhz-model** — Whirlpool WRS315SDHZ official support. Publisher: Whirlpool. Applies to: WRS315SDHZ. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WRS315SDHZ.html
- **whirlpool-wrs321sdhz08-current-1** — Whirlpool slow-water-flow guidance. Publisher: Whirlpool. Applies to: Whirlpool refrigerator cohort; model/revision limits in source. Quality: primary. Verified: 2026-08-28. https://producthelp.whirlpool.com/%40api/deki/pages/11745/pdf/Not%2BDispensing%2BIce%2Bor%2BWater%2B-%2BRefrigerator.pdf
- **whirlpool-wrs321sdhz08-model** — Whirlpool WRS321SDHZ official model page. Publisher: Whirlpool. Applies to: WRS321SDHZ. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WRS321SDHZ08.html
- **whirlpool-wrs588fihz-model** — Whirlpool WRS588FIHZ official model/support page. Publisher: Whirlpool. Applies to: WRS588FIHZ00. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WRS588FIHZ.html
- **whirlpool-wrx735sdhz-model** — Whirlpool WRX735SDHZ official model/support page. Publisher: Whirlpool. Applies to: WRX735SDHZ family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WRX735SDHZ.html
- **whirlpool-wtw5010lw-model** — Whirlpool WTW5010LW official model/support page. Publisher: Whirlpool. Applies to: WTW5010LW0. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WTW5010LW.html
- **whirlpool-wtw5057lw-model** — Whirlpool WTW5057LW official support. Publisher: Whirlpool. Applies to: WTW5057LW. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WTW5057LW.html
- **whirlpool-wtw5105lw-model** — Whirlpool WTW5105LW official model/support page. Publisher: Whirlpool. Applies to: WTW5105LW family; rating-label revision still required. Quality: primary. Verified: 2026-08-28. https://www.whirlpool.com/owners-center-pdp.WTW5105LW.html
- **whirlpoolparts-kdfe204kps0-w11462456** — KDFE204KPS0 authorized model-parts listing for drain pump W11462456. Publisher: Whirlpool Parts. Applies to: KDFE204KPS0. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a9b121d2248070/Model-KDFE204KPS0-Kitchenaid-Dishwasher-Parts?n=3
- **whirlpoolparts-krfc300ess08-edr4rxd1** — KRFC300ESS08 authorized model-parts listing for water filter EDR4RXD1. Publisher: Whirlpool Parts. Applies to: KRFC300ESS08. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a4b121d2463919/Model-KRFC300ESS08-Kitchenaid-Refrigerator-Parts
- **whirlpoolparts-mdb4949skz1-w11497943** — MDB4949SKZ1 pump category identifying drain pump W11497943. Publisher: Whirlpool Parts. Applies to: MDB4949SKZ1. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a9b4c36d2463970/Model-MDB4949SKZ1-Maytag-Dishwasher-Pump-Parts
- **whirlpoolparts-wdt730hamz0-w10876537** — WDT730HAMZ0 drain-pump category with one exact pump result. Publisher: Whirlpool Parts. Applies to: WDT730HAMZ0. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a9b5i168d2454271/Model-WDT730HAMZ0-Whirlpool-Dishwasher-Drain-Pump-Parts
- **whirlpoolparts-wed4815ew1-w11429587** — WED4815EW1 catch category with one exact catch result. Publisher: Whirlpool Parts. Applies to: WED4815EW1. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a8i2691d2145566/Model-WED4815EW1-Dryer-Catch-Parts
- **whirlpoolparts-wed5050lw0-w11429587** — WED5050LW0 latch listing superseding W11224630 with W11429587. Publisher: Whirlpool Parts. Applies to: WED5050LW0. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a8b5c72d2454284/Model-WED5050LW0-Whirlpool-Dryer-Latch-Parts
- **whirlpoolparts-wrs588fihz00-edr1rxd1** — WRS588FIHZ00 filter listing identifying EDR1RXD1. Publisher: Whirlpool Parts. Applies to: WRS588FIHZ00. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a4b5c43d2269249/Model-WRS588FIHZ00-Whirlpool-Refrigerator-Filter-Parts
- **whirlpoolparts-wtw5010lw0-w11399437** — WTW5010LW0 drain-pump category with one exact pump result. Publisher: Whirlpool Parts. Applies to: WTW5010LW0. Quality: authorized-secondary. Verified: 2026-08-28. https://www.whirlpoolparts.com/Shop-For-Parts/a11b5i168d2461121/Model-WTW5010LW0-Whirlpool-Washing-Machine-Drain-Pump-Parts

## Files and reproducibility

- `candidate-coverage.json`: canonical machine-readable matrix with full model, symptom, evidence, checks, safety boundaries, profiles, tiers, part evidence, verification dates, and gaps.
- `candidate-coverage.csv`: flat index for filtering and pivoting.
- `cohorts-and-exceptions.json`: reusable cohort definitions and applicable-looking unsupported rows.
- `counts.json`: frozen aggregate counts.
- `build-evidence-recon.ts`: deterministic generator importing the current catalog without modifying it.

## Limitations and next verification steps

The reconnaissance verifies source identity and applicability, not physical repair outcomes. Manufacturer pages can change. Before product implementation, re-open each reused source, review the exact model manual for feature branches, add schema/runtime support for `unsupported` research rows outside the production capability enum, and rerun URL/content checks.

## Shopify Global Catalog existence audit

A separate live, credential-free, no-store UCP pass re-queried all 17 unique exact SKUs already supporting Clunk's 25 purchase-ready model rows. All 17 were present in Shopify Global Catalog and all 17 returned at least one available exact-SKU listing on 2026-08-28; neighboring part numbers were excluded. This is the SKU-level commerce criterion for this reconnaissance. Catalog presence remains independent of manufacturer or authorized-parts compatibility evidence.

Shopify documents WebMCP tools on every Liquid storefront and Hydrogen developer-preview storefront, with current agent support limited to Chromium-based browsers. Therefore this pass does not require a completed checkout transaction per SKU; the platform supplies the storefront search, cart, and navigation path after catalog discovery.

Supporting files:

- `shopify-global-catalog-audit.json`: machine-readable exact-SKU presence results.
- `shopify-global-catalog-audit.md`: human-readable live catalog audit and agentic-commerce boundary.
- `audit-shopify-global-catalog.ts`: reproducible no-store UCP audit that persists aggregate observations only.
