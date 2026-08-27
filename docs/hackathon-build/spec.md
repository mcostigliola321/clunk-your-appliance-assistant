# Technical specification

## Runtime architecture

Static React + TypeScript + Vite. No backend, API key, model SDK, database, auth, server function, or payment integration. Exact outcomes can make one optional keyless Shopify Global Catalog request for current offers.

```text
human controls ─┐
example replay ─┼─> invokeTool ─> deterministic engine ─> RepairState ─> selectors ─> UI
manual inspector┤                         │
WebMCP callback ┘                         └─> accepted/rejected activity event

catalog entry ─> schema-v5 repair-pack generator ─> checks + results + sources + exact SKU
                                                                        │
                                                                        └─> Shopify UCP offers
```

`RepairProvider` keeps a synchronous state ref so every callback returns the exact state it dispatches to React.

## Domain model

### Catalog entry

- Stable `id`, `kind`, brand, model, label, aliases.
- `profile` chooses one reviewed deterministic path.
- Complete verified product codes and label prompt.
- Diagram topology/load style when applicable.
- Official model source and troubleshooting sources.
- Optional exact part with compatibility codes, location, install boundary, source, and a dated fixed seller and/or Shopify UCP handoff.

### Repair pack v5

- Category identity and plain-language noun.
- One symptom ID/label/short label.
- Original illustration manifest and accuracy note.
- Components with access boundary and percentage hotspot coordinates.
- Ordered checks with source IDs and safety tags.
- Results with deterministic `effect`:
  - `continue`
  - `no-part-needed`
  - `part-candidate`
  - `professional-only`
  - `hazard`
- Optional next check, focus component, escalation reason, and final customer copy.
- Cause ranking rules expressed as per-result score/explanation maps.
- Optional example fixture containing complete model code plus ordered observation calls.

Runtime invariants verify schema version, unique IDs, component/check/source/result references, allowed source URLs/dates, forbidden safety tags, exact part evidence, secure seller URLs, exact-SKU UCP descriptors, and complete compatibility codes.

## Profiles

### `washer-front-drain`

`safety-check` → `inspect-drain-hose` → `inspect-filter` → no-part, part candidate, professional, or hazard.

### `washer-hose-only`

`safety-check` → `inspect-drain-hose` → no-part or professional. No filter component/check is emitted.

### `dishwasher-drain`

`safety-check` → `inspect-drain-connection` → `inspect-sump-filter` → no-part, part candidate, professional, or hazard.

### `dryer-door-strike`

`safety-check` → `inspect-door-strike` → exact visible strike candidate or professional latch/alignment service.

### `refrigerator-water-filter`

`safety-check` → `inspect-water-filter` → exact filter candidate or professional supply/housing service.

## Engine rules

- Search filters by optional category and brand plus normalized model text; it never chooses a nearest model.
- Selection accepts only a stable catalog ID and optional participant-supplied complete product code.
- Diagnosis accepts only the selected pack’s symptom.
- Observation accepts only the current check and one of that check’s results.
- `continue` advances only to the declared next check.
- `hazard` enters terminal escalation immediately.
- Other effects enter result state and preserve the declared focus component/copy.
- Exact part resolution requires both a `part-candidate` terminal result and a normalized complete-code match.
- Missing code or evidence returns `variant-needed`; guided-only models never borrow parts.
- Exact part reveal is a state mutation and is recorded in activity; live offer fetching cannot change the outcome.

## Public WebMCP tools

Tool contracts live in `src/webmcp/contracts.ts`. Enums are derived from the catalog and validated repair packs.

| Phase        | Available actions                              |
| ------------ | ---------------------------------------------- |
| Catalog      | read, search, select                           |
| Selected     | read, search, select, start                    |
| Active check | read, show component, record observation, stop |
| Result       | read, show component, find part, stop          |
| Escalated    | read, search, select                           |

`registerClunkTools` contains eight literal `document.modelContext.registerTool` calls. The provider aborts and replaces the active registration group when this inventory changes. `get_repair_state` is annotated read-only, does not append an activity mutation, and returns compact current-task structured content. All callbacks return text, bounded structured content, and `isError` for rejected calls.

## Example replay

The home screen obtains the selected pack’s fixture and synchronously invokes:

1. `select_appliance`
2. `start_diagnosis`
3. one `record_observation` per fixture item
4. `find_compatible_part`

Every call uses source `example`, reaches the same engine, and is logged. The UI displays the fixture summary as an example disclosure. No ninth tool or alternate answer store exists.

## UI

- Two-column outcome-first home at desktop; single column on mobile.
- Four category controls, one flagship card, model search, and evidence labels.
- Selected state pairs the location guide with the current safe action or part answer.
- Hotspots use regular buttons, accessible names, `aria-pressed`, text labels, and non-color emphasis.
- Part result includes name, SKU, full compatible model, location, source, install boundary, and accessible Shopify loading/error/empty/seller states. Merchant labels are disclosed and only exact-SKU offers are rendered.
- Activity/tool detail stays collapsed until requested.
- Reduced motion globally collapses transitions to 0.01ms.

## Test strategy

- Catalog/repair-pack invariant tests across all 50 entries and three capability labels.
- Shopify UCP extraction tests for punctuation-insensitive exact SKU, nearby-SKU rejection, availability, request shape, and WebMCP handoff equivalence.
- Exact example replay for all four flagships.
- No-part, guided-only, complete-code, unsupported-model, invalid-order, and hazard tests.
- Literal registration, dynamic inventory, and shared callback tests.
- Versioned deterministic scenario fixtures replayed through the engine with schema-enum validation.
- A separate manual real-agent matrix records client, model, prompt, discovered tools, argument correctness, state transitions, and failures without treating fixture replay as agent evidence.
- React integration tests for home clarity, one-click seller link, category switching, real observations, visuals, and manual inspector.
- Playwright desktop + Pixel 7 tests for all category handoffs, 320px overflow, keyboard, 44px touch targets, reduced motion, and WCAG A/AA.

## Deployment

Lovable hosts the static repository build at the published top-level URL. GitHub is the source of truth. No environment variables are required. Final verification is run locally, on the live Lovable URL in the in-app browser, and in Chrome 149+ with WebMCP testing enabled.
