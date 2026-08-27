# Clunk

**Tell it what’s broken. It shows you what to check and finds the exact part.**

[Open the live repair bench](https://clunk-appliance-assistant.lovable.app) · [Review the source ledger](./docs/model-source-ledger.md) · [Read the safety model](./docs/safety.md)

Clunk is a lightweight, open-source WebMCP app where a person and a browser agent investigate a broken household appliance together. The person supplies physical observations. The agent searches Clunk’s supported catalog, reads the shared repair state, focuses the relevant location, and records only what the person reports.

The catalog covers 31 real U.S. model families: 19 washers, four dishwashers, four electric dryers, and four refrigerators. One flagship in every category has a complete purchase-ready path backed by a manufacturer or authorized parts source. Additional models are plainly labeled **Guided checks only** until their exact compatibility data is verified. The illustrations are original location guides—not model-specific service diagrams.

No account, API key, model call, database, server function, or runtime API is required. If WebMCP is unavailable, the entire experience remains usable in manual mode.

> **Important:** Clunk is a bounded troubleshooting aid, not a diagnostic authority. It supports only the listed symptom for each listed model. Always follow the manufacturer’s manual. Stop for heat, smoke, a burning smell, an active leak near power, unsafe access, or any step that does not match the appliance.

## Judge it in under three minutes

1. Pick Washer, Dishwasher, Electric dryer, or Refrigerator.
2. Choose **See the full answer**. One click replays a complete, labeled example through the same shared WebMCP actions and lands on the exact part, price, seller, and **Buy this part** link.
3. Open **Agent activity** to see the model selection, safety boundary, recorded observations, component focus, compatibility resolution, and active tool inventory.
4. Reset and use **Diagnose yours** to supply real observations instead of the example fixture.

The same sequence can be driven by a person, the manual judge controls, or a WebMCP-capable browser agent. Every accepted and rejected action appears in the shared activity log.

Try four purchase-ready proof cases:

- **Washer:** LG `WM3400CW.ABWEVUS` → drain pump `AHA75693425`.
- **Dishwasher:** Whirlpool `WDT750SAKZ1` → drain pump `W11412291`.
- **Electric dryer:** GE `GTD42EASJ2WW` → visible door strike `WE01M10007`.
- **Refrigerator:** GE `GSS25GYPFS` → water filter `XWFE`.

For a no-purchase answer, run the washer or dishwasher flow and report the visible debris. For a deterministic safety stop, report smoke or a burning smell.

## Why WebMCP fits

Appliance troubleshooting crosses a physical boundary. An agent can reason over structured evidence, but only the person beside the appliance can see the rating label, hose, filter, door catch, or leak. WebMCP lets both parties operate one visible, deterministic repair state instead of hiding the work behind a chat transcript or private API.

- The available tools change with the page state, so the agent sees only valid next actions.
- Search and selection are model-aware; unsupported models produce a visible refusal.
- Physical observations are explicit tool arguments and must come from the person.
- Component focus, progress, likely causes, sources, and part outcomes update in the same UI.
- The site—not the model—enforces order, evidence thresholds, and terminal safety stops.
- The judge can replay every capability without credentials or WebMCP support.

The app contains eight literal `document.modelContext.registerTool` registrations in [`src/webmcp/registerTools.ts`](./src/webmcp/registerTools.ts). Registration is progressively enhanced, lifecycle-owned by an `AbortController`, and independent of the manual fallback.

## Dynamic tool surface

| Tool                          | Purpose                                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `search_supported_appliances` | Search the bounded catalog by appliance kind, model code, and optional brand without substitution.       |
| `select_appliance`            | Select an exact supported family and optionally provide the complete rating-label code.                    |
| `get_repair_state`            | Read the visible catalog, evidence, current check, likely causes, sources, result, and valid next actions. |
| `start_diagnosis`             | Start the selected model’s one supported symptom flow.                                                     |
| `show_component`              | Focus the shared original topology orientation without claiming a physical observation.                    |
| `record_observation`          | Record one explicit person-supplied result for the current check.                                          |
| `find_compatible_part`        | Return no-part, variant-needed, or exact-source-backed outcomes, including a dated seller handoff.         |
| `stop_and_escalate`           | Enter a terminal safe state for electrical, access, hazard, or unresolved boundaries.                      |

Only contextually valid tools are registered at a given moment. Every input schema is bounded with `additionalProperties: false`. [`evals/webmcp-evals.json`](./evals/webmcp-evals.json) contains reproducible discovery, happy-path, unsupported-model, exact-part, hazard, and protection-bypass cases.

## Architecture

```text
Human control ─┐
               ├─> shared action layer ─> deterministic engine ─> repair state ─> UI
WebMCP call ───┘                                │
                                                └─> accepted/rejected activity event

source-backed catalog ─> validated repair-pack generator ─> model-specific checks and outcomes
```

Clunk ships as static HTML, CSS, JavaScript, JSON, original raster topology illustrations, and local font files. The browser agent supplies reasoning; Clunk supplies the bounded tools, authoritative state, sources, deterministic transitions, and safety policy. See [`docs/architecture.md`](./docs/architecture.md), [`docs/repair-pack-schema.md`](./docs/repair-pack-schema.md), and the [`category expansion plan`](./docs/category-expansion-plan.md).

## Evidence and compatibility

The catalog is intentionally honest about evidence depth:

- **Family verified:** an official manufacturer page confirms the selected model family.
- **Complete code verified:** the entered rating-label code exactly matches a cataloged code.
- **Exact part:** a manufacturer or authorized parts source maps that code to a part and Clunk surfaces the associated seller listing.
- **Variant needed:** the family is supported, but Clunk needs the complete engineering/product code before any part claim.
- **Professional only:** the visible checks are exhausted or manufacturer guidance ends at service.

The source ledger records every supported model, official page, topology, and current part-evidence status. Exact results may include a dated seller price and stock snapshot plus a direct product link. The seller controls live availability, tax, delivery, and checkout; Clunk handles no payment and provides no pump-installation instructions.

## Deterministic safety

Clunk never provides gas, mains/high-voltage, energized, refrigerant, sealed-compressor, protection-bypass, internal-wiring, control-board, panel-removal, or professional-only repair instructions.

The app validates repair packs, rejects out-of-order calls, requires person-supplied observations, and enters a terminal professional state for burning smell, smoke, hot water, leaks near power, mismatched access, or unsafe reach. Full policy and tested outcomes are in [`docs/safety.md`](./docs/safety.md).

## Browser setup

- **WebMCP-capable browser:** enable the browser’s WebMCP testing support and open the live URL.
- **Any other modern browser:** Clunk reports **Manual mode ready**. Use the normal controls or Tool inspector; both reach the same state and log.

The source-backed production build was verified in Chrome 149 with WebMCP testing enabled and in the in-app browser fallback. Chrome reported **Agent tools ready**, changed its active inventory as the repair state advanced, and completed the exact-code LG path with no console errors. The in-app browser reported **Manual mode ready** and exposed the same credential-free judge controls. A recorded natural-language agent session remains part of the final submission capture.

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. No environment file or external service is needed.

To run the complete quality gate:

```bash
npx playwright install chromium
npm run verify
```

The gate runs TypeScript, ESLint, deterministic unit/integration/eval tests, a production build, and desktop/mobile browser checks for core paths, keyboard access, responsive overflow, reduced motion, and automated WCAG A/AA rules.

## Demo and AI usage

The required public demo video will be linked before the Devpost entry is finalized. The recording outline lives in [`devpost-submission.md`](./devpost-submission.md).

Codex helped implement, test, and document the conventional codebase. Lovable hosts the static build. The shipped app itself does not call an LLM, include a model SDK, or require an OpenAI API key.

## Contributing and license

Small, reviewable contributions are welcome; start with [`CONTRIBUTING.md`](./CONTRIBUTING.md). Safety or security concerns are covered by [`SECURITY.md`](./SECURITY.md).

MIT © 2026 Mark Costigliola. See [`LICENSE`](./LICENSE).
