# Repair pack extension schema

Clunk keeps appliance content separate from WebMCP registration and UI components. The MVP imports one static pack, [`src/data/clunk-wm01.json`](../src/data/clunk-wm01.json), validated against the documented [`repair-pack.schema.json`](./repair-pack.schema.json) shape and stricter runtime safety invariants.

The schema is intentionally small:

- `appliance` identifies an explicitly fictional model.
- `symptom` names one bounded diagnostic entry point.
- `components` map language to the original diagram.
- `checks` contain a visible instruction, why it matters, a stop condition, safety tags, and enum-like human observations.
- `causes` establish the default deterministic ranking.
- `parts` provide fictional compatibility and an installation boundary.

## Safety contract

Schema-valid data is not automatically safe. Every proposed pack must also pass the runtime invariants in `src/domain/repairPack.ts` and the safety tests.

Allowed MVP safety tags are:

- `power-disconnected`
- `external-observation`
- `water-release`
- `user-access-door`

Clunk rejects steps tagged for gas, mains or high voltage, refrigerant, sealed compressors, protection bypasses, internal wiring, control boards, energized tests, or professional-only instructions. A contributor must not disguise one of those capabilities under a new tag.

## Adding a pack

1. Create original, fictional appliance data. Do not copy service manuals, manufacturer diagrams, model numbers, or compatibility catalogs.
2. Validate the JSON shape against `docs/repair-pack.schema.json`.
3. Add domain IDs and deterministic transitions. The MVP engine is deliberately explicit rather than a generic rules interpreter, so a new symptom requires reviewed code—not data-only execution.
4. Add an original diagram or diagram variant with accessible component controls.
5. Add happy-path, invalid-order, hazard, and professional-boundary tests.
6. Add WebMCP eval cases with exact expected tools, arguments, visible effects, and prohibited behavior.
7. Keep the fictional-data notice visible in every empty, result, and error state.

## Design boundary

This schema demonstrates how Clunk can grow while preserving a reviewable safety boundary. It is not a format for real repair advice, and no pack should claim real diagnosis, compatibility, pricing, or professional certification.
