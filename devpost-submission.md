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

- GE `GFW550SSN0WW` washer → `WH11X39237` drain pump/filter assembly.
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
- The primary UI makes that protocol transition visible: `record_observation` is available while Clunk waits for a person, then `find_compatible_part` unlocks after the report.
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

Schemas are bounded with pack-derived enums and `additionalProperties: false`. The active registration set changes with repair state and is lifecycle-owned by an `AbortController`. Tool responses include text plus compact current-task structured content. `get_repair_state` is genuinely read-only and does not append an activity mutation.

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
5. Open **Human + agent activity** to inspect plain-language milestones, exact shared actions, and currently available WebMCP tools.
6. Reset and use **Diagnose yours** to supply real observations. In the washer flow, report visible filter debris for a no-purchase answer, or report smoke/burning smell for the terminal safety proof.

### WebMCP browser

In Chrome 149+, enable WebMCP testing, open the top-level live URL, and ask:

> My electric dryer is GE GTD42EASJ2WW and the door will not stay closed. Select that exact model, show me the part of the door to inspect, and ask me for every physical observation. Do not infer what I see.

Then reset and try:

> I smell burning and see smoke at the same dryer. Stop safely and do not offer a part or purchase path.

### Local verification

```bash
npm ci
npx playwright install chromium
npm run verify
```

The quality gate passes TypeScript, ESLint, **33 deterministic unit/integration/scenario-fixture tests**, a production build, and **18 desktop/mobile browser tests** covering all flagship links, the visible baton pass, real no-part flow, safety, top-load switching, 320px overflow, keyboard access, 44px touch targets, reduced motion, and automated WCAG A/AA.

## AI usage

AI is present at the browser-agent layer, not inside the shipped app. A compatible agent reasons over the state and tools supplied by Clunk. Codex helped scope, implement, test, visually inspect, and document the conventional codebase. Built-in image generation created the original appliance location guides, which were mechanically reviewed and documented. Lovable hosts the static GitHub build. The deployed product has no Codex or model runtime dependency.

## Key features

- Four one-click, source-backed, purchase-ready flagship outcomes.
- 31 real model families with honest pre-selection evidence labels.
- Original category/location visuals and interactive component hotspots.
- Eight state-dependent WebMCP tools and one shared repair state.
- Deterministic safety, ordering, compatibility, and rejection logic.
- Plain-language collaboration milestones, technical inspector, sources, and manual fallback.
- Versioned deterministic WebMCP scenario fixtures plus a separate manual real-agent matrix and runbook.
- Responsive, keyboard/touch accessible, reduced-motion, WCAG A/AA-tested UI.
- Static credential-free Lovable hosting, public GitHub source, and MIT license.

## Public links

- Live app: https://clunk-appliance-assistant.lovable.app
- Repository: https://github.com/mcostigliola321/clunk-your-appliance-assistant
- Demo video: TODO — public YouTube URL under three minutes

## Under-three-minute recording outline

- **0:00–0:12 — Outcome first:** Open the GE dryer result on `WE01M10007`, `$6.90`, dated availability, and the external GE seller. “This is where Clunk ends when the evidence is exact.”
- **0:12–0:30 — Physical boundary:** Reset and search `GTD42EASJ2WW`. “The agent can manage the workflow, but it cannot see the appliance.”
- **0:30–1:18 — Live baton pass:** The agent selects the exact model, starts the flow, and highlights the door strike. Show **Your turn — Clunk cannot see this** with `record_observation` available and part lookup locked. The person reports each observation; show **Observation recorded — part lookup unlocked**, then the exact part and seller.
- **1:18–1:42 — Safety proof:** Reset, report smoke/burning smell, and show the terminal stop. Confirm the purchase path and part tool are absent.
- **1:42–2:02 — Trust proof:** Run a debris/no-part case or unsupported-model search. Show that Clunk declines the purchase or refuses substitution.
- **2:02–2:28 — Implementation proof:** Open the collaboration timeline and inspector; show literal state-dependent tools, compact structured state, source date, original visual, and the 31-model catalog.
- **2:28–2:42 — Close:** “Clunk is a repair bench a person and their agent operate together.” Static, open source, no login, no API key, no app-side model.

## Official submission requirements — checked 2026-08-27

- [x] Working public live URL for ChatGPT’s in-app browser or Chrome with WebMCP enabled.
- [x] Public code repository with source, assets, setup instructions, literal `document.modelContext.registerTool` code, and MIT license.
- [x] Text description covering WebMCP fit, user experience, new person/agent collaboration, and implementation.
- [ ] Public YouTube demo under three minutes **with audio**, clearly showing what was built and how WebMCP is used. The existing 45-second Guided-mode draft is b-roll, not the required finished video.
- [ ] Confirm the final natural-language agent/client evidence to enter in the required testing field. Current browser/UI checks must not be described as real-agent runs.

Official deadline: **September 3, 2026 at 1:00 PM Pacific Time**. No recent organizer announcements were present when checked.

## Participant-specific Devpost fields

- [ ] Submitter Type: choose Individual, Team of Individuals, or Organization.
- [ ] Country of residence: select the participant/team country or countries.
- [ ] App Status: choose New or Existing; if Existing, describe the work completed during the submission period.
- [x] Live URL: https://clunk-appliance-assistant.lovable.app
- [x] Public repo: https://github.com/mcostigliola321/clunk-your-appliance-assistant
- [ ] Agent/client testing answer: update from the completed manual matrix; do not claim unrecorded natural-language runs.
- [x] AI tools used draft: browser-agent layer in supported clients; Codex for implementation/testing/documentation; Lovable for static hosting and GitHub sync; generated original visuals documented in the repo.
- [ ] Learning level: choose None, Moderate, or Significant.
- [ ] Reusable career value: choose Yes or No.

## Known limitations

- Each model currently supports one intentionally bounded symptom.
- Four flagships are purchase-ready; the remaining breadth is explicitly guided-only or unavailable.
- Clunk does not confirm a diagnosis, guarantee stock or price, complete payment, or replace a technician.
- WebMCP is evolving; unsupported environments use the identical manual action layer.
- The person remains responsible for reporting physical observations and confirming the complete model on the seller page.

## Remaining submission tasks

- Run and record the manual real-agent matrix in `docs/webmcp-agent-evaluation.md`, including any failures.
- Record the final natural-language WebMCP exchange, add audio to the prepared b-roll, upload the public YouTube video, and replace the TODO.
- Complete the unchecked participant-specific Devpost fields above.
