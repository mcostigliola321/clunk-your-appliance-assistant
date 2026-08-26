# Repair pack extension schema

Clunk keeps model evidence separate from the WebMCP registration and UI. The 19 launch entries live in [`src/data/applianceCatalog.ts`](../src/data/applianceCatalog.ts). Each entry is converted into a schema-v2 repair pack and checked by the runtime invariants in [`src/domain/repairPack.ts`](../src/domain/repairPack.ts).

The documented [`repair-pack.schema.json`](./repair-pack.schema.json) describes the serialized extension shape:

- `appliance` identifies the real brand, model family, load style, and diagram topology.
- `verifiedProductCodes` lists complete rating-label codes that Clunk may compare exactly.
- `symptom` names one bounded diagnostic entry point.
- `components` map plain-language labels to the original diagram and an access boundary.
- `checks` contain a visible instruction, why it matters, stop conditions, safety tags, source IDs, and enum-like person-supplied observations.
- `causes` establish a deterministic starting rank; observed evidence changes the visible ordering.
- `parts` are optional and require exact product-code compatibility, a manufacturer or authorized-parts source, and a secure dated seller handoff.
- `sources` make every model, check, and part claim auditable.

## Safety contract

Schema-valid data is not automatically safe. Every pack must also pass runtime safety invariants and review.

Permitted launch tags describe constraints such as disconnected power, cool water, external observation, no disassembly, spill control, and a manufacturer-documented user-access filter. Clunk rejects steps tagged for gas, mains or high voltage, refrigerant, sealed compressors, protection bypasses, internal wiring, control boards, energized tests, or professional-only instructions.

A contributor must not disguise a forbidden capability under a new tag.

## Adding a model family

1. Add the exact real brand/model family and aliases. Never use fuzzy substitution to select a repair pack.
2. Add an official manufacturer product/support source with its applicability and verification date.
3. Choose the conservative load style, topology, and check profile supported by that model’s public guidance.
4. Attach source IDs to every safe check. If access differs by engineering revision, stop and request the complete code instead of guessing.
5. Add a part only when a manufacturer or authorized-parts source maps the complete code to the exact SKU. Record the seller destination, verification date, and dated price/availability snapshot; otherwise leave `parts` empty.
6. Validate the JSON shape and runtime invariants.
7. Add search, selection, happy-path, mismatch, invalid-order, hazard, part-boundary, and WebMCP eval coverage.
8. Update [`docs/model-source-ledger.md`](./model-source-ledger.md).

## Adding an appliance category or symptom

The schema reserves open string IDs, source records, topologies, checks, and parts, but the current TypeScript unions and deterministic ranking deliberately support only front-load and top-load washers with `will-not-drain`. A new category or symptom therefore requires an explicit reviewed code change, a new original diagram/topology, new safety policy, and dedicated tests. It is not enabled by dropping in unreviewed data. See [`category-expansion-plan.md`](./category-expansion-plan.md).

## Compatibility boundary

A supported family is not automatically an exact part match. The app distinguishes family verification, complete-code verification, no-part-needed, exact match, variant-needed, and professional-only outcomes. A dated seller snapshot may be shown, but no extension may claim a confirmed diagnosis, live price or availability, repair success, or professional certification.
