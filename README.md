# Clunk

**A human-and-browser-agent guide for safe appliance checks, exact-part matches, and current seller offers—without guessing.**

[![App](https://img.shields.io/badge/app-Clunk-0b5d4c)](https://clunk.repair)
[![Demo video](https://img.shields.io/badge/demo-2%3A28-dff46a)](https://youtu.be/hUHGxR0iRR8)
[![Verify](https://github.com/mcostigliola321/clunk-your-appliance-assistant/actions/workflows/verify.yml/badge.svg)](https://github.com/mcostigliola321/clunk-your-appliance-assistant/actions/workflows/verify.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-14231d)](./LICENSE)

[Open Clunk](https://clunk.repair) · [Watch the demo](https://youtu.be/hUHGxR0iRR8) · [Browse the evidence](./docs/model-source-ledger.md) · [Read the documentation](./docs/README.md)

Clunk helps a homeowner and a compatible browser agent work through a broken washer, dishwasher, electric dryer, or refrigerator together. The agent handles structured lookup and state. The person reports what is physically visible. Clunk keeps both on the same appliance view and enforces the order, compatibility evidence, and safety boundary.

The result is one of four honest outcomes:

- a visible blockage or obstruction can be cleared without buying a part;
- Clunk needs the complete model code before making a compatibility claim;
- the observations support an exact, source-backed part and a current seller handoff;
- the safe visible checks are over and a qualified professional should continue.

Clunk is a bounded troubleshooting aid, not a diagnostic authority or a replacement for the manufacturer's manual.

## See it work

[![Clunk demo: a person and browser agent diagnose an appliance together](https://img.youtube.com/vi/hUHGxR0iRR8/maxresdefault.jpg)](https://youtu.be/hUHGxR0iRR8)

The 2:28 demo shows a browser agent select GE dryer `GTD42EASJ2WW`, wait for the homeowner's physical observations, unlock the exact `WE01M10007` door strike, and stop the purchase path when smoke or a burning smell is reported.

The full experience also works without WebMCP support: open [clunk.repair](https://clunk.repair), choose any appliance, and select **See a finished guide**. The sample uses the same guarded action layer as the manual and browser-agent paths.

## Current scope

Clunk's release catalog contains 163 source-backed U.S. appliance identities across 11 brands. Every possible model/problem pair in that catalog is classified; an unsupported pair stops explicitly instead of borrowing a nearby model's guide.

| Appliance       | Identities | Model × problem pairs | Supported pairs | Models with an exact-part route |
| --------------- | ---------: | --------------------: | --------------: | ------------------------------: |
| Washers         |         56 |                   280 |             274 |                              15 |
| Dishwashers     |         33 |                   165 |             165 |                              23 |
| Electric dryers |         33 |                   132 |             132 |                              18 |
| Refrigerators   |         41 |                   205 |             195 |                              28 |
| **Total**       |    **163** |               **782** |         **766** |                          **84** |

Coverage is intentionally broad but bounded. A recognized model does not imply that every problem is supported, and a family-level match is never promoted into exact revision compatibility. The original appliance illustrations show common physical locations; they are not model-specific service diagrams.

## Why WebMCP

Appliance troubleshooting crosses a physical boundary. A browser agent can search model evidence, track the valid next action, and point to a component. It cannot see the rating label, hose, filter, latch, leak, smoke, or damaged access beside the person.

WebMCP lets the page expose its real task model instead of making the agent scrape interface text or maintain a separate hidden workflow:

1. The agent searches only the supported catalog and selects an exact returned identity.
2. Clunk starts only a model/problem flow with explicit coverage.
3. The agent can focus a visible location, but the person must supply every physical observation.
4. Every tool result names the valid `nextTools` for the current state. While Clunk waits for the person, observation recording is valid and premature part lookup is rejected.
5. Clunk resolves the observation history to a no-part, more-detail, exact-part, or professional outcome.
6. Every accepted or rejected action appears in the same visible activity history.

The site—not the agent—owns sequence, evidence thresholds, exact-fit rules, and terminal safety stops. Browsers without WebMCP retain the complete manual experience.

## Eight discoverable, state-guarded tools

Clunk contains eight literal `document.modelContext.registerTool` registrations in [`src/webmcp/registerTools.ts`](./src/webmcp/registerTools.ts).

| Tool                          | What it can do                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `search_supported_appliances` | Search full or partial model text, preserve suffix ambiguity, and return model-label guidance.  |
| `select_appliance`            | Select an identity returned by search and optionally attach a complete code read by the person. |
| `get_repair_state`            | Read the current bounded task, active handoff, and valid next actions without mutating state.   |
| `start_diagnosis`             | Start the selected model/problem flow only after coverage is verified.                          |
| `show_component`              | Focus the relevant location without claiming that the agent observed it.                        |
| `record_observation`          | Record one bounded, person-supplied result for the current check.                               |
| `find_compatible_part`        | Resolve to no part, complete-code required, exact part, or professional service.                |
| `stop_and_escalate`           | End the flow at a hazard, access, electrical, or unresolved boundary.                           |

All eight tools are registered on page load so browser agents and directories can discover the complete workflow. Every result has an explicit structured-output schema and a `nextTools` list for the current phase. IDs that depend on catalog or repair state must come from prior tool output instead of a copied catalog-sized enum, while the engine still rejects invented IDs, out-of-order observations, unsupported model/problem pairs, and post-terminal advancement. Inputs use bounded schemas with `additionalProperties: false`, registration lifecycle is managed with an `AbortController`, and the same public action layer serves the UI, sample guides, inspector, and browser-agent calls.

## One shared, inspectable engine

```text
Person controls ─┐
Sample guide ────┼─> shared action layer ─> deterministic engine ─> repair state ─> UI
Manual inspector ┤                              │
WebMCP call ─────┘                              └─> accepted/rejected activity event

source-backed catalog ─> validated repair packs ─> safe checks and bounded outcomes
                                                         │
                                                         └─> exact SKU ─> Shopify offers
```

The customer experience ships as static React, TypeScript, CSS, JSON, original illustrations, and local fonts. There is no account system, database, app-side model call, private API key, or payment handling. A compatible browser agent supplies reasoning; Clunk supplies the authoritative state and rules.

Lovable also publishes a read-only remote MCP server for clients that cannot use the page's in-browser WebMCP surface. Its five catalog and diagnosis tools replay the same deterministic data and engine without changing the visible browser session. Every input is bounded, every successful structured result is schema-validated, and the public endpoint has no database or secret access. See the [remote MCP deployment contract](./docs/remote-mcp.md).

Read the [architecture](./docs/architecture.md) for the layer-by-layer design and the [repair-pack schema](./docs/repair-pack-schema.md) for the evidence model.

## Evidence before commerce

Clunk keeps five claims separate:

- **Model identity:** an official manufacturer source confirms the family or complete code.
- **Problem coverage:** the exact model/problem pair has a reviewed, low-risk visible-check route.
- **Part compatibility:** a manufacturer or authorized-parts source maps the complete code to one SKU.
- **Seller availability:** Shopify Global Catalog returns a current listing containing that exact SKU.
- **Paid placement:** Shopify identifies a promoted offer and supplies the attributed destination URL.

Shopify discovers offers; it does not decide what fits. Clunk rejects unavailable listings and nearby part numbers, does not cache catalog responses, labels merchant claims as seller claims, and leaves checkout on the merchant's site. Organic lookup is credential-free. An approved public saved-catalog identifier can enable visibly disclosed affiliate placement without adding a private browser credential.

See the [Shopify/UCP boundary](./docs/shopify-ucp-integration.md), [model source ledger](./docs/model-source-ledger.md), and [source URL audit](./docs/source-url-audit.md).

## Safety boundary

Clunk requires person-supplied observations and stops at professional service for hazards, unsafe access, or exhausted visible checks. It does not provide instructions for gas work, energized diagnostics, mains or high voltage, refrigerant or sealed systems, protection bypasses, internal wiring, control boards, panel removal, or other professional-only work.

Smoke, a burning smell, hot water, a leak near power, damaged access, mismatched access, or unsafe reach enters a terminal stop. A part result is still a likely outcome based on reported observations—not a confirmed diagnosis or an instruction to perform an internal repair.

The full policy and tested outcome table are in [`docs/safety.md`](./docs/safety.md).

## Run locally

Requirements: Node.js 22 or newer.

```bash
git clone https://github.com/mcostigliola321/clunk-your-appliance-assistant.git
cd clunk-your-appliance-assistant
npm ci
npm run dev
```

Open `http://localhost:5173`. Diagnosis and organic seller lookup require no `.env` file or API key.

An approved Shopify saved catalog can be tested by copying `.env.example` to `.env.local` and setting the public `VITE_SHOPIFY_CATALOG_ID`. Every `VITE_` value is included in the browser build; never put a secret or private token there.

## Verify the release

```bash
npx playwright install chromium
npm run verify
```

The complete gate runs strict TypeScript, ESLint, 118 unit/integration/WebMCP/MCP tests, a production build, 56 desktop/mobile Playwright journeys, and a generated-MCP drift check. Coverage includes catalog and symptom boundaries, exact-code handling, nearby-SKU rejection, person/agent handoff, catalog failure fallback, no-part outcomes, safety stops, keyboard access, touch targets, reduced motion, 320px layouts, automated WCAG A/AA checks, and protocol-level remote MCP exact-part, hazard, and input-boundary journeys.

Useful focused commands:

```bash
npm run test
npm run test:e2e
npm run audit:coverage
npm run audit:purchase
npm run build
```

Deterministic scenario fixtures live in [`evals/webmcp-evals.json`](./evals/webmcp-evals.json). They verify contracts and state transitions, not probabilistic agent behavior. The separate [real-agent evaluation matrix](./docs/webmcp-agent-evaluation.md) is deliberately marked as not run until a supported natural-language agent session is recorded.

## Documentation map

| Start here                                                             | Purpose                                                      |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`docs/README.md`](./docs/README.md)                                   | Current documentation index and source-of-truth guide.       |
| [`docs/architecture.md`](./docs/architecture.md)                       | State, data, WebMCP, UI, and commerce layers.                |
| [`docs/remote-mcp.md`](./docs/remote-mcp.md)                           | Remote MCP contract, deployment, and verification.           |
| [`docs/safety.md`](./docs/safety.md)                                   | Deterministic safety rules and prohibited capabilities.      |
| [`docs/repair-pack-schema.md`](./docs/repair-pack-schema.md)           | Model/problem coverage and exact-part evidence requirements. |
| [`docs/model-source-ledger.md`](./docs/model-source-ledger.md)         | Catalog identities, sources, and exact-part status.          |
| [`docs/shopify-ucp-integration.md`](./docs/shopify-ucp-integration.md) | Exact-SKU offer discovery and checkout boundary.             |
| [`docs/webmcp-agent-evaluation.md`](./docs/webmcp-agent-evaluation.md) | Repeatable natural-language agent evaluation plan.           |
| [`DESIGN.md`](./DESIGN.md)                                             | “Approachable Precision” interface system.                   |
| [`PRODUCT.md`](./PRODUCT.md)                                           | Durable product promise and customer-facing principles.      |

`docs/hackathon-build/` preserves the project's build history, including the early fictional single-washer proof of concept. It is an archive, not the current product scope.

## Project status and limitations

- The [live app](https://clunk.repair), source, and [public demo](https://youtu.be/hUHGxR0iRR8) are available without login.
- Sixteen of 782 model/problem pairs stop because current evidence is insufficient.
- Exact-part results require a complete verified revision; family-only identities remain safe-checks-only.
- Clunk does not confirm a diagnosis, guarantee price or stock, validate a merchant, complete payment, or replace a qualified technician.
- WebMCP is progressively enhanced; unsupported environments use the same manual action layer.
- Genuine natural-language agent runs remain separate from deterministic test fixtures and are not claimed as completed evidence.

## AI usage

AI is present at the browser-agent layer, not inside the shipped app. A compatible agent reasons over the state and tools supplied by Clunk, while the page owns repair sequence, safety, and compatibility. Codex helped scope, implement, test, review, and document the conventional codebase. Built-in image generation helped create the original appliance location guides, which were mechanically reviewed and documented. Lovable hosts the static GitHub build.

## Contributing and license

Small, reviewable contributions are welcome. Start with [`CONTRIBUTING.md`](./CONTRIBUTING.md); report security or unsafe-repair issues through [`SECURITY.md`](./SECURITY.md).

MIT © 2026 Mark Costigliola. See [`LICENSE`](./LICENSE).
