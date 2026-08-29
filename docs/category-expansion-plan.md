# Category expansion plan

Clunk now ships a reusable multi-appliance foundation: 163 source-backed U.S. model families across washers, dishwashers, electric dryers, and refrigerators; 11 brands; explicit capability tiers; pack-derived tool enums; per-pack component hotspots, result effects, ranking rules, safety boundaries, sources, and optional static/live commerce handoffs. The eight public WebMCP tools did not change as categories, model discovery, evidence filters, and Shopify UCP offer discovery expanded. This is useful breadth, not exhaustive or universal compatibility.

At the model level, tier totals are 25 **Purchase-ready**, 138 **Guided checks**, and zero **Verified part unavailable**. At the model × symptom level, the 163 identities resolve to 557 packs: the same 25 purchase-ready combinations plus 532 guided combinations. The catalog expansion adds 113 entries through 50 validated family profiles, with 13 of those entries upgraded only at a separately evidenced complete engineering revision. Exact-part data lives on the model row—not the shared profile—so no neighboring revision or symptom inherits a part or Shopify query.

## Many-to-many release slice

Every homepage problem now has meaningful checked breadth. The unchanged cohorts are washer drain (56) and door/lid closure (36), dishwasher drain (33) and door closure (20), electric-dryer door closure (33), and refrigerator slow water (41) and door closure (35). The 12 previously thin routes now cover 39 washers per route across five brands, 21 dishwashers per route across five brands, 19 vented electric dryers per route across four brands, and 22 refrigerators per route across four brands. An unsupported model × symptom pair still produces a visible refusal and cannot enter a borrowed tree.

The door-closure release activates exactly 91 previously researched candidate rows from `docs/research/clunk-evidence-recon-2026-08-28/`: 36 washers, 20 dishwashers, and 35 refrigerators. It does not activate the remaining research gaps or infer coverage for the later 24-model batch. The compact production ledger is `src/data/symptomCoverageExpansion.json`, validated against `docs/symptom-coverage-expansion.schema.json` and runtime invariants. Common trees contain only cohort-wide external observations; front/top-load nouns, feature gates, AutoRelease/open-dry behavior, French-door mullions, leveling, alignment, hinges, and internal locks remain excluded or professional/model-manual boundaries unless separately proven.

The 2026-08-29 broad-route release adds 303 exact guided-only evidence rows across the 12 thin symptoms. The compact ledger is `src/data/broadSymptomCoverage.json`, validated against `docs/broad-symptom-coverage.schema.json` and runtime invariants. Its 59 current primary manufacturer troubleshooting sources are separate from the exact model-page evidence used only to corroborate identity, topology, and factory water/ice features. Shared trees contain only cohort-wide exterior observations; top/front washer language is topology-aware, compact ventless dryers are excluded, and refrigerator water/ice routes stop before model-specific reset or internal work. No row adds a part, SKU, offer, or purchase-ready claim.

## Submission slice

| Category       | Purchase-ready exact models | Exact outcomes                                           | Additional breadth                                                            |
| -------------- | --------------------------: | -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Washer         |                           8 | `WH11X39237`, `WH23X28418`, `W11399437`, `DC97-20621A`   | 56 total; nine brands; front- and top-load external paths                     |
| Dishwasher     |                           4 | `W11412291`, `W10876537`, `W11497943`, `W11462456`       | 33 total; exact pumps retain the conservative sink-then-service boundary      |
| Electric dryer |                           7 | `WE01M10007`, `WE01X34600`, `279570`, `W11429587`        | 33 total; visible door-hardware inspection only; Bosch ventless kept distinct |
| Refrigerator   |                           6 | `XWFE`, `EDR1RXD1`, `EDR4RXD1`, `DA97-17376B`, `LT1000P` | 41 total; model guidance controls location/mechanism assumptions              |

“Purchase-ready” means that a complete product code maps to a manufacturer or authorized-parts source and a dated seller or Shopify UCP handoff. It does not mean Clunk confirms the diagnosis, guarantees stock, certifies a merchant claim, or completes payment. “Guided checks only” is visible before model selection and never silently borrows another model's part.

## What can expand without changing the protocol

- More model entries using an existing category profile.
- More exact parts after compatibility evidence is verified.
- Additional original location-guide variants for materially different layouts.
- New example fixtures that replay the existing public tools.

All of these remain static data and deterministic state transitions.

## Expansion effort observed

- The 113 additions share 50 source-backed profiles. Each model still owns its official URL, aliases, complete-code rule, category, topology, symptom, and retrieval record; the profile only deduplicates conservative repair behavior and source metadata.
- All new dishwashers use the sink/air-gap/drain-connection check. The three exact-code upgrades can reveal their verified professional-install pump after that external path is clear; guided entries still stop at service. No removable-filter instruction was generalized across families.
- Bosch `WTG86403UC/01` retains a distinct compact ventless topology even though its only supported action is the same visible door-hardware check used by vented electric dryers.
- Thirteen additions became purchase-ready only after an exact complete-code-to-SKU mapping was found on a manufacturer or authorized-parts page. The other 100 additions remain guided-only; ambiguous Samsung/LG pump pages, refrigerator filter pages with multiple candidates, and Bosch revision conflicts were not promoted.
- Ten no-store Shopify queries for the upgrade SKUs returned 10–20 available exact-number offers during the 2026-08-27 pass. Clunk rejected 24 available neighboring listings before recording those counts.

The JSON expansion file, documented JSON Schema, runtime validator, explicit per-symptom capability field, schema-v6 pack generator, catalog validator, and reusable UCP descriptor make the next catalog batch primarily data work after evidence review. Public counts are derived in the app and covered by tests; prose counts still require an intentional review so documentation cannot drift silently.

## What requires explicit product and safety review

- A new symptom path or repair profile.
- A new appliance category.
- Any user action beyond visible observation or a clearly documented consumer-maintenance boundary.
- Any new compatibility claim or exact SKU. Shopify can discover live offers after that proof, but cannot supply it.

Every such change needs primary-source evidence, a category safety review, original visual work, schema/runtime validation, unit coverage, deterministic WebMCP scenario fixtures, real-agent runbook coverage, and desktop/mobile browser tests.

## Deliberately excluded

Clunk will not add gas work, live electrical tests, refrigerant or sealed-compressor diagnosis, protection-bypass instructions, internal wiring, control-board work, OCR/image diagnosis, app-side LLM calls, checkout automation, payments, accounts, or a hidden repair database merely to appear broader.

## Recommended next expansion

1. Continue one complete engineering revision at a time, prioritizing the remaining Samsung/LG washer, Maytag/Amana refrigerator, and Bosch filter gaps only when one authoritative page resolves one exact SKU.
2. Add model-specific visual manifests only where the general category location guide is materially misleading.
3. Continue widening the 12 broad guided routes brand by brand only when primary guidance proves the same category/topology boundary; the current exclusions remain intentional evidence gaps, not inferred neighbors.
4. Automate source-link and exact-SKU offer re-verification without caching Shopify results or changing the static judge experience.
