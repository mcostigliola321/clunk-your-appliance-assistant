# Repair pack extension schema

Clunk keeps model identity, symptom coverage, repair-pack identity, capability tier, and exact-part evidence separate from the WebMCP registration and UI. The 50 published-milestone entries and 113 expansion entries are composed into one 163-model catalog by [`src/data/applianceCatalog.ts`](../src/data/applianceCatalog.ts). The legacy expansion file remains a compact single-symptom import source, validated by [`catalog-expansion.schema.json`](./catalog-expansion.schema.json), then normalized into the same many-to-many coverage structure in [`src/data/catalogExpansion.ts`](../src/data/catalogExpansion.ts). The separately reviewed overlays in [`src/data/purchaseCoverageExpansion.json`](../src/data/purchaseCoverageExpansion.json) and [`src/data/demoReadyPurchaseExpansion.json`](../src/data/demoReadyPurchaseExpansion.json) bind exact revisions to source-backed part identities without granting another revision or symptom a part. The catalog currently classifies all 782 schema-v6 model × symptom pairs: 84 purchase-ready, 682 guided, and 16 explicitly unsupported, checked by the catalog and pack invariants in [`src/domain/repairPack.ts`](../src/domain/repairPack.ts).

The 91-row door-closure addition uses a second narrow evidence shape: [`symptom-coverage-expansion.schema.json`](./symptom-coverage-expansion.schema.json) validates [`src/data/symptomCoverageExpansion.json`](../src/data/symptomCoverageExpansion.json). Every row binds one production `modelId` to one category, brand, family alias, topology/load style, primary troubleshooting source ID, explicit applicability, safe observable checks, professional and stop boundaries, feature exception, guided-only tier, unresolved exact-part gaps, and verification date. Runtime validation fixes the allowed counts at 36 washer, 20 dishwasher, and 35 refrigerator rows and rejects duplicates, unknown sources, tier inflation, or non-HTTPS evidence.

The 303-row broad-route addition uses [`broad-symptom-coverage.schema.json`](./broad-symptom-coverage.schema.json), [`src/data/broadSymptomCoverage.json`](../src/data/broadSymptomCoverage.json), and a runtime validator in [`src/data/broadSymptomCoverage.ts`](../src/data/broadSymptomCoverage.ts). It locks 12 separate route counts, requires an exact row for every activated model × symptom, separates manufacturer model-page corroboration from troubleshooting sources, records topology and ice/water feature gates, and rejects duplicate identities, unknown sources, category mismatches, unsafe public URLs, incomplete stops, and capability inflation. [`scripts/generate-broad-symptom-coverage.ts`](../scripts/generate-broad-symptom-coverage.ts) reproducibly projects only the explicitly approved cohorts into exact rows.

The documented [`repair-pack.schema.json`](./repair-pack.schema.json) describes the serialized extension shape:

- `id` is the immutable `model-id::symptom-id` repair-pack identity; `modelId` independently identifies the appliance model.
- `appliance` identifies the category, real brand/model family, plain-language noun, symptom-specific capability tier, diagram topology, original illustration, and accuracy note.
- `verifiedProductCodes` lists complete rating-label codes that Clunk may compare exactly.
- `symptom` names this pack's bounded observable-behavior entry point. A model can own multiple packs.
- `components` map plain-language labels to hotspot coordinates on the original location guide and an access boundary.
- `checks` contain a visible instruction, why it matters, stop conditions, safety tags, source IDs, and bounded person-supplied observations. Each result declares a deterministic effect, optional next check, focus location, stop reason, and customer-facing outcome copy.
- `causes` contain per-result score and explanation rules; observed evidence changes the visible ordering without an app-side model call.
- `parts` are optional and require exact product-code compatibility, a manufacturer or authorized-parts source, and at least one secure handoff: a dated fixed seller snapshot, a dated Shopify UCP query, or both. `corroboratingSources` may preserve the rest of a multi-document chain—for example exact revision identity, family filter specification, and manufacturer part identity—without replacing the primary compatibility source.
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
4. Add one coverage record per evidenced symptom and declare its capability tier: `purchase-ready`, `guided-checks`, or `verified-part-unavailable`. Runtime validation requires the selected model × symptom record, exact-part evidence, and seller state to agree.
5. Attach source IDs to every safe check. If access differs by engineering revision, stop and request the complete code instead of guessing.
6. Add a part only when a manufacturer or authorized-parts source chain maps the complete code to the exact SKU. Expansion exact parts must bind to one verified code, and that same code must appear in every compatibility source's applicability plus the compatible-model label; a sibling revision requires its own evidence row. A fixed seller handoff records its destination and dated price/availability snapshot. A Shopify handoff records provider, protocol, exact-SKU query, positive observed exact-offer count, and verification date. Neither Shopify Global Catalog nor public storefront data such as `/products.json` may create the compatibility claim; otherwise leave `parts` empty.
7. Validate the JSON shape and runtime invariants. A reusable family profile may deduplicate a proven safe baseline, but every model × symptom pair still requires its own pack identity, applicability, troubleshooting source, capability tier, and ledger record.
8. Add search, selection, happy-path, mismatch, invalid-order, hazard, part-boundary, and WebMCP eval coverage.
9. Update [`docs/model-source-ledger.md`](./model-source-ledger.md).

For a cohort expansion, add a separate evidence row for every model × symptom combination. A cohort profile may share only the checks that remain true for every listed row; topology-specific names and feature exceptions stay explicit. A research candidate is not production coverage until its production model ID is reconciled and the record passes schema, runtime, catalog, pack, and unsupported-neighbor tests.

## Adding an appliance category or symptom

Schema v6 uses explicit model × symptom pack IDs, an independent model ID, a symptom-specific capability tier, deterministic rules, and an optional live-commerce descriptor across washers, dishwashers, electric dryers, and refrigerators. A new category or symptom requires a reviewed code change, category-specific observable checks and stopping points, primary-source applicability evidence, and dedicated tests. Existing location art may be reused only as a labeled orientation guide where its component positions remain accurate; unreviewed data never enables a public flow.

## Compatibility boundary

A supported family is not automatically covered for the selected symptom, and symptom coverage is not automatically an exact part match. The app distinguishes unsupported-for-this-problem, guided checks, verified-part-unavailable, family verification, complete-code verification, no-part-needed, exact match, variant-needed, and professional-only outcomes. Shopify results are live seller listings, not compatibility evidence; Clunk rejects listings that do not contain the exact part number. No extension may claim a confirmed diagnosis, guaranteed price or availability, repair success, seller authenticity, or professional certification.
