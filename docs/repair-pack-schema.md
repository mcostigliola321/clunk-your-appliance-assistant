# Repair pack extension schema

Clunk keeps model evidence separate from the WebMCP registration and UI. The 50 published-milestone entries and 81 expansion entries are composed into one 131-entry catalog by [`src/data/applianceCatalog.ts`](../src/data/applianceCatalog.ts). Thirteen expansion rows contain a separately evidenced one-revision exact-part record; the other 68 are guided-only. The added families live as compact data in [`src/data/catalogExpansion.json`](../src/data/catalogExpansion.json), are documented by [`catalog-expansion.schema.json`](./catalog-expansion.schema.json), and pass runtime source, identity, topology, symptom, alias, full-code, exact-revision, and capability validation in [`src/data/catalogExpansion.ts`](../src/data/catalogExpansion.ts). Every catalog entry is then converted into a schema-v5 repair pack and checked by the catalog and pack invariants in [`src/domain/repairPack.ts`](../src/domain/repairPack.ts).

The documented [`repair-pack.schema.json`](./repair-pack.schema.json) describes the serialized extension shape:

- `appliance` identifies the category, real brand/model family, plain-language noun, explicit capability tier, diagram topology, original illustration, and accuracy note.
- `verifiedProductCodes` lists complete rating-label codes that Clunk may compare exactly.
- `symptom` names one bounded diagnostic entry point.
- `components` map plain-language labels to hotspot coordinates on the original location guide and an access boundary.
- `checks` contain a visible instruction, why it matters, stop conditions, safety tags, source IDs, and bounded person-supplied observations. Each result declares a deterministic effect, optional next check, focus location, stop reason, and customer-facing outcome copy.
- `causes` contain per-result score and explanation rules; observed evidence changes the visible ordering without an app-side model call.
- `parts` are optional and require exact product-code compatibility, a manufacturer or authorized-parts source, and at least one secure handoff: a dated fixed seller snapshot, a dated Shopify UCP query, or both.
- `sources` make every model, check, and part claim auditable.
- `example` is an optional, labeled fixture that replays the same public actions to a real purchase-ready result.

## Safety contract

Schema-valid data is not automatically safe. Every pack must also pass runtime safety invariants and review.

Permitted tags describe constraints such as disconnected power, cool water, external observation, no disassembly, spill control, a sink check, visible door hardware, and manufacturer-documented user-access filters. Clunk rejects steps tagged for gas, mains or high voltage, refrigerant, sealed compressors, protection bypasses, internal wiring, control boards, energized tests, or professional-only instructions.

A contributor must not disguise a forbidden capability under a new tag.

## Adding a model family

1. Add the exact real brand/model family and aliases. Never use fuzzy substitution to select a repair pack.
2. Add an official manufacturer product/support source with its applicability and retrieval date. Merchant pages are never model-identity evidence.
3. Choose the conservative load style, topology, and check profile supported by that model’s public guidance.
4. Declare exactly one capability tier: `purchase-ready`, `guided-checks`, or `verified-part-unavailable`. Runtime validation requires its part evidence and seller state to agree.
5. Attach source IDs to every safe check. If access differs by engineering revision, stop and request the complete code instead of guessing.
6. Add a part only when a manufacturer or authorized-parts source maps the complete code to the exact SKU. Expansion exact parts must bind to one verified code, and that same code must appear in the evidence applicability and compatible-model label; a sibling revision requires its own evidence row. A fixed seller handoff records its destination and dated price/availability snapshot. A Shopify handoff records provider, protocol, exact-SKU query, positive observed exact-offer count, and verification date. Neither handoff may create the compatibility claim; otherwise leave `parts` empty.
7. Validate the JSON shape and runtime invariants. A reusable family profile may deduplicate safe behavior, but every model still requires its own identity, aliases/full-code rule, official URL, category/topology, symptom, and ledger record.
8. Add search, selection, happy-path, mismatch, invalid-order, hazard, part-boundary, and WebMCP eval coverage.
9. Update [`docs/model-source-ledger.md`](./model-source-ledger.md).

## Adding an appliance category or symptom

Schema v5 uses pack-derived string IDs, an explicit capability tier, deterministic rules, and an optional live-commerce descriptor across washers, dishwashers, electric dryers, and refrigerators. A new category or symptom still requires an explicit reviewed code change, a new original location guide, category-specific safety boundaries, primary-source evidence, and dedicated tests. Dropping in unreviewed data never enables a public flow.

## Compatibility boundary

A supported family is not automatically an exact part match. The app distinguishes family verification, complete-code verification, no-part-needed, exact match, variant-needed, and professional-only outcomes. Shopify results are live seller listings, not compatibility evidence; Clunk rejects listings that do not contain the exact part number. No extension may claim a confirmed diagnosis, guaranteed price or availability, repair success, seller authenticity, or professional certification.
