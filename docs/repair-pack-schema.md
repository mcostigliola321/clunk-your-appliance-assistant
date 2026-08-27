# Repair pack extension schema

Clunk keeps model evidence separate from the WebMCP registration and UI. The 31 entries live in [`src/data/applianceCatalog.ts`](../src/data/applianceCatalog.ts). Each entry is converted into a schema-v3 repair pack and checked by the runtime invariants in [`src/domain/repairPack.ts`](../src/domain/repairPack.ts).

The documented [`repair-pack.schema.json`](./repair-pack.schema.json) describes the serialized extension shape:

- `appliance` identifies the category, real brand/model family, plain-language noun, diagram topology, original illustration, and accuracy note.
- `verifiedProductCodes` lists complete rating-label codes that Clunk may compare exactly.
- `symptom` names one bounded diagnostic entry point.
- `components` map plain-language labels to hotspot coordinates on the original location guide and an access boundary.
- `checks` contain a visible instruction, why it matters, stop conditions, safety tags, source IDs, and bounded person-supplied observations. Each result declares a deterministic effect, optional next check, focus location, stop reason, and customer-facing outcome copy.
- `causes` contain per-result score and explanation rules; observed evidence changes the visible ordering without an app-side model call.
- `parts` are optional and require exact product-code compatibility, a manufacturer or authorized-parts source, and a secure dated seller handoff.
- `sources` make every model, check, and part claim auditable.
- `example` is an optional, labeled fixture that replays the same public actions to a real purchase-ready result.

## Safety contract

Schema-valid data is not automatically safe. Every pack must also pass runtime safety invariants and review.

Permitted tags describe constraints such as disconnected power, cool water, external observation, no disassembly, spill control, a sink check, visible door hardware, and manufacturer-documented user-access filters. Clunk rejects steps tagged for gas, mains or high voltage, refrigerant, sealed compressors, protection bypasses, internal wiring, control boards, energized tests, or professional-only instructions.

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

Schema v3 uses pack-derived string IDs and deterministic rules across washers, dishwashers, electric dryers, and refrigerators. A new category or symptom still requires an explicit reviewed code change, a new original location guide, category-specific safety boundaries, primary-source evidence, and dedicated tests. Dropping in unreviewed data never enables a public flow.

## Compatibility boundary

A supported family is not automatically an exact part match. The app distinguishes family verification, complete-code verification, no-part-needed, exact match, variant-needed, and professional-only outcomes. A dated seller snapshot may be shown, but no extension may claim a confirmed diagnosis, live price or availability, repair success, or professional certification.
