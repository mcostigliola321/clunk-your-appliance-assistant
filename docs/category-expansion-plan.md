# Category expansion plan

Clunk now ships the reusable multi-appliance foundation: 31 real model families across washers, dishwashers, electric dryers, and refrigerators; pack-derived tool enums; per-pack component hotspots, result effects, ranking rules, safety boundaries, sources, and optional purchase fixtures. The eight public WebMCP tools did not change as categories expanded.

## Submission slice

| Category       | Purchase-ready flagship | Supported outcome                             | Additional breadth                                        |
| -------------- | ----------------------- | --------------------------------------------- | --------------------------------------------------------- |
| Washer         | GE GFW550SSN0WW         | Will not drain → WH11X39237 pump/filter       | 18 additional models; front- and top-load location guides |
| Dishwasher     | Whirlpool WDT750SAKZ1   | Will not drain → W11412291 drain pump         | Bosch, GE, and KitchenAid guided checks                   |
| Electric dryer | GE GTD42EASJ2WW         | Door will not stay closed → WE01M10007 strike | Whirlpool, Maytag, and LG guided checks                   |
| Refrigerator   | GE GSS25GYPFS           | Slow dispenser flow → XWFE filter             | Whirlpool, Samsung, and LG guided checks                  |

“Purchase-ready” means that a complete product code maps to a manufacturer or authorized-parts source and a dated seller handoff. It does not mean Clunk confirms the diagnosis, guarantees stock, or completes payment. “Guided checks only” is visible before model selection and never silently borrows a flagship part.

## What can expand without changing the protocol

- More model entries using an existing category profile.
- More exact parts after compatibility evidence is verified.
- Additional original location-guide variants for materially different layouts.
- New example fixtures that replay the existing public tools.

All of these remain static data and deterministic state transitions.

## What requires explicit product and safety review

- A new symptom path or repair profile.
- A new appliance category.
- Any user action beyond visible observation or a clearly documented consumer-maintenance boundary.
- Any new seller, compatibility, price, or stock claim.

Every such change needs primary-source evidence, a category safety review, original visual work, schema/runtime validation, unit coverage, deterministic WebMCP scenario fixtures, real-agent runbook coverage, and desktop/mobile browser tests.

## Deliberately excluded

Clunk will not add gas work, live electrical tests, refrigerant or sealed-compressor diagnosis, protection-bypass instructions, internal wiring, control-board work, OCR/image diagnosis, app-side LLM calls, checkout automation, payments, accounts, or a hidden repair database merely to appear broader.

## Recommended next expansion

1. Verify purchase-ready parts for one guided model at a time, prioritizing common U.S. engineering revisions.
2. Add model-specific visual manifests only where the general category location guide is materially misleading.
3. Add one additional safe symptom per category after source and safety review—for example, a washer door-strike or dishwasher rack-wheel problem rather than energized/internal diagnosis.
4. Automate source-link and seller-snapshot re-verification without changing the static judge experience.
