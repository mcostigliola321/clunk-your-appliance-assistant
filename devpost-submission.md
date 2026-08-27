# Title

Clunk

## One-line summary

Tell Clunk what broke. A person and browser agent check the same visual appliance together, then Clunk shows the exact part and seller link when the evidence supports one.

## Problem

Appliance troubleshooting crosses a physical boundary. An AI can track model data, evidence, and next steps, but only the person beside the appliance can read its complete label and report what they see, smell, or can safely reach. Today that collaboration is scattered across generic search results, long videos, manuals, chat messages, and guessed compatibility.

## Solution

Clunk is a static, open-source visual repair bench for washers, dishwashers, electric dryers, and refrigerators. A browser agent discovers eight bounded WebMCP tools, selects an exact supported model, reads the visible repair state, highlights a component, records only a person-supplied observation, and resolves one of four honest outcomes:

- no part is needed;
- the complete model code is still required;
- a source-backed exact part and seller link are available;
- a qualified professional should continue.

The page—not the agent—enforces sequence, compatibility, and safety. Every human, example, manual-inspector, and agent action uses the same deterministic engine and visibly updates the same appliance, progress, result, and activity log.

## Five-second proof

The home screen presents four recognizable problems and one purchase-ready flagship per category. **See the full answer** runs a clearly labeled example through the same WebMCP action layer and, in one click, shows:

- where the part sits on the appliance;
- the exact part name and SKU;
- the compatible full model code;
- dated price and availability;
- a prominent external seller link.

The four flagship stories are:

- LG `WM3400CW.ABWEVUS` washer → `AHA75693425` drain pump.
- Whirlpool `WDT750SAKZ1` dishwasher → `W11412291` drain pump.
- GE `GTD42EASJ2WW` electric dryer → `WE01M10007` visible door strike.
- GE `GSS25GYPFS` refrigerator → `XWFE` water filter.

The broader catalog contains 31 real U.S. model families. Additional entries are labeled **Guided checks only** or **Verified part unavailable** before selection; Clunk never substitutes a similar model or borrows a flagship part.

## Why WebMCP

This is not a chatbot wrapped around a parts catalog. WebMCP is the collaboration layer between reasoning and physical evidence:

- The agent can search and maintain structured state without scraping arbitrary UI text.
- The person stays responsible for observations the browser cannot make.
- Component focus gives both parties the same visual reference.
- State-dependent registration exposes only valid next tools.
- Accepted and rejected calls appear in the UI, making agent work inspectable.
- Deterministic site rules can stop unsafe or unsupported actions even when an agent asks incorrectly.

That pattern extends beyond appliances to field service, equipment inspection, guided setup, and any workflow where an agent must coordinate with a human in the physical world.

## WebMCP implementation

Clunk contains eight literal `document.modelContext.registerTool` registrations:

1. `search_supported_appliances`
2. `select_appliance`
3. `get_repair_state`
4. `start_diagnosis`
5. `show_component`
6. `record_observation`
7. `find_compatible_part`
8. `stop_and_escalate`

Schemas are bounded with pack-derived enums and `additionalProperties: false`. The active registration set changes with repair state and is lifecycle-owned by an `AbortController`. Tool responses include text plus the same serializable state snapshot rendered on screen.

## Safety and evidence

Clunk never provides gas, live/high-voltage, energized-test, refrigerant, sealed-compressor, interlock-bypass, internal-wiring, control-board, or professional-only repair instructions. Smoke, burning smell, heat, an active leak near power, unsafe reach, or damaged/mismatched access enters a terminal professional state.

Exact part results require a complete product-code match and a manufacturer or authorized-parts source. Seller checkout remains external and human-controlled. Price and stock are visibly dated snapshots, not live guarantees.

The original appliance illustrations are mechanically conservative location guides, not copied manufacturer diagrams or claims of pixel-level model fidelity.

## Technical architecture

```text
human control ─┐
example replay ─┼─> shared action layer ─> deterministic engine ─> repair state ─> UI
manual inspector┤                              │
WebMCP call ────┘                              └─> visible activity event

source-backed catalog ─> validated schema-v3 repair pack ─> checks + results + parts
```

The production app is static HTML, CSS, JavaScript, JSON, original images, and local fonts. It has no database, auth, backend, server function, runtime API, environment secret, model SDK, or app-side LLM call. Unsupported browsers retain the complete manual flow.

## Testing instructions

### Fast judge path

1. Open https://clunk-appliance-assistant.lovable.app.
2. Pick any of the four appliance categories.
3. Click **See the full answer**.
4. Confirm the labeled example disclosure, highlighted location, exact SKU, compatible model, price/availability snapshot, and **Buy this part** link.
5. Open **Agent activity** to inspect the exact shared actions and currently available WebMCP tools.
6. Reset and use **Diagnose yours** to supply real observations. In the washer flow, report visible filter debris for a no-purchase answer, or report smoke/burning smell for the terminal safety proof.

### WebMCP browser

In Chrome 149+, enable WebMCP testing, open the top-level live URL, and ask:

> Use Clunk to show the complete washer example and explain each visible state change.

Then reset and try:

> My dishwasher is WDT750SAKZ1 and it will not drain. Ask me for each physical observation; do not infer what I see.

### Local verification

```bash
npm ci
npx playwright install chromium
npm run verify
```

The quality gate runs TypeScript, ESLint, 28 unit/integration/eval tests, a production build, and 16 desktop/mobile browser tests covering all flagship links, real no-part flow, safety, top-load switching, 320px overflow, keyboard access, 44px touch targets, reduced motion, and automated WCAG A/AA.

## AI usage

AI is present at the browser-agent layer, not inside the shipped app. A compatible agent reasons over the state and tools supplied by Clunk. Codex helped scope, implement, test, visually inspect, and document the conventional codebase. Built-in image generation created the original appliance location guides, which were mechanically reviewed and documented. Lovable hosts the static GitHub build. The deployed product has no Codex or model runtime dependency.

## Key features

- Four one-click, source-backed, purchase-ready flagship outcomes.
- 31 real model families with honest pre-selection evidence labels.
- Original category/location visuals and interactive component hotspots.
- Eight state-dependent WebMCP tools and one shared repair state.
- Deterministic safety, ordering, compatibility, and rejection logic.
- Visible agent activity, tool inspector, sources, and manual fallback.
- Versioned WebMCP eval fixtures replayed through the engine.
- Responsive, keyboard/touch accessible, reduced-motion, WCAG A/AA-tested UI.
- Static credential-free Lovable hosting, public GitHub source, and MIT license.

## Public links

- Live app: https://clunk-appliance-assistant.lovable.app
- Repository: https://github.com/mcostigliola321/clunk-your-appliance-assistant
- Demo video: TODO — public YouTube URL under three minutes

## Under-three-minute recording outline

- **0:00–0:15 — Hook:** Show the four problems. “Tell Clunk what broke. Get the part to buy.”
- **0:15–0:38 — Instant proof:** Click the dishwasher example; show its highlighted pump, `W11412291`, seller, price, and buy link.
- **0:38–1:08 — WebMCP proof:** Open Agent activity and show the shared select/start/observation/part calls plus state-dependent tool inventory.
- **1:08–1:42 — Human–agent collaboration:** Reset; have the agent start a washer flow and ask the person about the hose/filter. Record visible debris and show the no-purchase answer.
- **1:42–2:02 — Safety:** Reset and report smoke/burning smell. Show the terminal professional stop and missing part tool.
- **2:02–2:32 — Ambition:** Switch across dryer and refrigerator examples; mention 31 source-backed models and the purchase-ready/guided-only distinction.
- **2:32–2:48 — Close:** Static, open source, no login, no API key, no app-side model, deterministic evals and mobile/accessibility proof.

## Known limitations

- Each model currently supports one intentionally bounded symptom.
- Four flagships are purchase-ready; the remaining breadth is explicitly guided-only or unavailable.
- Clunk does not confirm a diagnosis, guarantee stock or price, complete payment, or replace a technician.
- WebMCP is evolving; unsupported environments use the identical manual action layer.
- The person remains responsible for reporting physical observations and confirming the complete model on the seller page.

## Remaining submission tasks

- Record/upload the public narrated video and replace the TODO.
- Capture the final activity/tools and safety frames for the screenshot gallery; current home and mobile frames are in `docs/hackathon-build/screenshots/`.
- Complete participant-specific Devpost form fields: submitter type, country, learning level, and reusable-career-value answer.
