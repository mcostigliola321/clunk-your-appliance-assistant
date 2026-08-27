# Category expansion plan

Clunk now ships the reusable multi-appliance foundation: 50 real model families across washers, dishwashers, electric dryers, and refrigerators; 11 brands; explicit capability tiers; pack-derived tool enums; per-pack component hotspots, result effects, ranking rules, safety boundaries, sources, and optional static/live commerce handoffs. The eight public WebMCP tools did not change as categories, model discovery, and Shopify UCP offer discovery expanded.

Final tier totals are 12 **Purchase-ready**, 38 **Guided checks**, and zero **Verified part unavailable**. The material model expansion added 19 entries, while a separate exact-evidence pass upgraded eight models without cloning a part claim into a neighboring revision.

## Submission slice

| Category       | Purchase-ready exact models | Exact outcomes                                                            | Additional breadth                                                   |
| -------------- | --------------------------: | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Washer         |                           3 | `WH11X39237`; `DC97-20621A` for two separately verified Samsung codes     | 23 total; nine brands; front- and top-load external paths            |
| Dishwasher     |                           1 | `W11412291`                                                               | 9 total; documented removable-filter access or conservative boundary |
| Electric dryer |                           4 | `WE01M10007`, `279570`, and `W11429587` for two separately verified codes | 9 total; visible door-hardware inspection only                       |
| Refrigerator   |                           4 | `XWFE`, `EDR1RXD1`, `DA97-17376B`, `LT1000P`                              | 9 total; model guidance controls location/mechanism assumptions      |

“Purchase-ready” means that a complete product code maps to a manufacturer or authorized-parts source and a dated seller or Shopify UCP handoff. It does not mean Clunk confirms the diagnosis, guarantees stock, certifies a merchant claim, or completes payment. “Guided checks only” is visible before model selection and never silently borrows another model's part.

## What can expand without changing the protocol

- More model entries using an existing category profile.
- More exact parts after compatibility evidence is verified.
- Additional original location-guide variants for materially different layouts.
- New example fixtures that replay the existing public tools.

All of these remain static data and deterministic state transitions.

## Expansion effort observed

- Nine of the 19 additions were mechanically straightforward after official model verification: four hose-only washer paths and five visible dryer-door paths fit existing conservative profiles.
- Ten required topology/access evidence: each dishwasher needed documented user-filter access, while each refrigerator needed its filter location/mechanism checked. The Maytag `MDB4949SKZ` candidate was removed because its chopper-style filtration did not support the existing removable-filter instruction; Amana `ADB1400AGW` replaced it with an official triple-filter manual.
- Eight models were upgraded only after complete-code-to-SKU evidence was located. The live Shopify lookup was mechanically easy once an exact SKU existed; compatibility research remained the expensive step. Ten unique SKU queries returned 5–20 exact available offers during the 2026-08-27 audit.

The entry factory, explicit capability field, schema-v5 pack generator, catalog validator, and reusable UCP descriptor mean the next catalog batch is primarily data work after the evidence review. Brand unions and prose counts still require an intentional review so public claims cannot drift silently.

## What requires explicit product and safety review

- A new symptom path or repair profile.
- A new appliance category.
- Any user action beyond visible observation or a clearly documented consumer-maintenance boundary.
- Any new compatibility claim or exact SKU. Shopify can discover live offers after that proof, but cannot supply it.

Every such change needs primary-source evidence, a category safety review, original visual work, schema/runtime validation, unit coverage, deterministic WebMCP scenario fixtures, real-agent runbook coverage, and desktop/mobile browser tests.

## Deliberately excluded

Clunk will not add gas work, live electrical tests, refrigerant or sealed-compressor diagnosis, protection-bypass instructions, internal wiring, control-board work, OCR/image diagnosis, app-side LLM calls, checkout automation, payments, accounts, or a hidden repair database merely to appear broader.

## Recommended next expansion

1. Verify purchase-ready parts for one guided model at a time, prioritizing common U.S. engineering revisions.
2. Add model-specific visual manifests only where the general category location guide is materially misleading.
3. Add one additional safe symptom per category after source and safety review—for example, a washer door-strike or dishwasher rack-wheel problem rather than energized/internal diagnosis.
4. Automate source-link and exact-SKU offer re-verification without caching Shopify results or changing the static judge experience.
