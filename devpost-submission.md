# Title

Clunk

## One-line Summary

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

**Find my model number** makes the first physical handoff visible before diagnosis. The person chooses an appliance (and front/top load for washers), follows manufacturer-backed common label locations drawn with original Clunk artwork, and reads the Model/Model No./E-Nr line. Partial search ignores punctuation and case, suggests supported families, calls out ambiguous suffixes, and rejects text labeled Serial or S/N before any compatibility claim. The same guidance is present in compact WebMCP state, so an agent can ask for the right physical evidence without a separate tool.

## Five-second proof

The home screen presents four appliance categories and observable problems. **See a finished guide** runs a clearly labeled example through the same WebMCP action layer and, in one click, shows:

- where the part sits on the appliance;
- the exact part name and SKU;
- the compatible full model code;
- a visible “Clunk confirmed the fit” boundary;
- current exact-SKU offers from Shopify Global Catalog over UCP;
- external merchant cart links, with merchant “OEM” and “compatible” language labeled as seller claims.

The four flagship stories are:

- GE `GFW550SSN0WW` washer → `WH11X39237` drain pump/filter assembly.
- Whirlpool `WDT750SAKZ1` dishwasher → `W11412291` drain pump.
- GE `GTD42EASJ2WW` electric dryer → `WE01M10007` visible door strike.
- GE `GSS25GYPFS` refrigerator → `XWFE` water filter.

The broader catalog contains 163 source-backed U.S. appliance identities across 11 brands: 56 washers, 33 dishwashers, 33 electric dryers, and 41 refrigerators. Clunk reproducibly classifies all 782 model × symptom pairs: 766 have bounded support and 16 stop explicitly rather than borrowing another model's guide. Eighty-four complete model revisions can reach an exact, source-backed part result. Clunk never substitutes a similar model, treats a seller result as proof of fit, or claims exhaustive compatibility.

Compatibility and commerce are deliberately separate. Manufacturer or authorized-parts evidence maps the complete appliance code to one exact SKU. Only then does Clunk call Shopify Global Catalog's keyless `search_catalog` tool over UCP. A cheaper or more relevant-looking nearby SKU is discarded. Live results are not cached, and a catalog failure cannot weaken or rewrite Clunk's deterministic fit decision.

Every exact-part row keeps the complete engineering code, exact SKU, compatibility source, commerce query, and retrieval date together. Ambiguous multi-pump pages, family-only matches, and conflicting revision evidence remain safe checks only. Sixteen model × symptom gaps are explicit evidence boundaries, not silent implementation omissions.

## Why This Matters

This is not a chatbot wrapped around a parts catalog. WebMCP is the collaboration layer between reasoning and physical evidence:

- The agent can search and maintain structured state without scraping arbitrary UI text.
- The person stays responsible for observations the browser cannot make.
- Component focus gives both parties the same visual reference.
- State-dependent registration exposes only valid next tools.
- The primary UI makes that protocol transition visible: `record_observation` is available while Clunk waits for a person, then `find_compatible_part` unlocks after the report.
- Accepted and rejected calls appear in the UI, making agent work inspectable.
- Deterministic site rules can stop unsafe or unsupported actions even when an agent asks incorrectly.

The better experience is concrete: the agent can move through model lookup, safe checks, and evidence-backed state without making the homeowner translate a manual or click through a long troubleshooting tree. The person supplies only the facts a browser cannot know. Both see the same appliance location, next question, and result.

Before WebMCP, this workflow was split between a chat transcript and a website, leaving the agent to scrape interface text or the person to re-enter every step. In Clunk, the agent can operate the site's real task model while the page keeps safety and compatibility rules in force. That pattern extends beyond appliances to field service, equipment inspection, guided setup, and any workflow where software reasoning must coordinate with a person in the physical world.

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

Exact part results require a complete product-code match and a manufacturer or authorized-parts source. Shopify supplies current seller listings and cart URLs, not the compatibility decision. Seller checkout remains external and human-controlled; Clunk does not collect payment, certify merchant claims, or guarantee price or stock.

The original appliance illustrations are mechanically conservative location guides, not copied manufacturer diagrams or claims of pixel-level model fidelity.

## Architecture

```text
human control ─┐
example replay ─┼─> shared action layer ─> deterministic engine ─> repair state ─> UI
manual inspector┤                              │
WebMCP call ────┘                              └─> visible activity event

source-backed catalog ─> validated repair pack ─> checks + results + exact SKU
                                                                         │
                                                                         └─> Shopify UCP live offers
```

The production app is static HTML, CSS, JavaScript, JSON, original images, and local fonts. It has no database, auth, backend, server function, environment secret, model SDK, or app-side LLM call. Its one external runtime request is the optional credential-free Shopify catalog lookup after an exact SKU is known. Unsupported browsers and catalog failures retain the complete manual diagnosis and evidence flow.

## Testing instructions

### Fast judge path

1. Open https://clunk-appliance-assistant.lovable.app.
2. Pick any of the four appliance categories.
3. Click **See a finished guide**.
4. Confirm the labeled example disclosure, highlighted location, exact SKU, compatible model, seller disclosure, and external **View offer** link.
5. Open **One guide. Two ways to use it.**, then inspect the person/browser-agent handoff, exact shared actions, and currently available WebMCP tools.
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

The current public release passed deterministic evidence audits, strict TypeScript, ESLint, Prettier, **112 unit/integration/WebMCP tests**, a production build, and **54 desktop/mobile Playwright journeys**. Coverage includes catalog and symptom boundaries, model-label discovery, partial/serial handling, exact and nearby-SKU behavior, the visible person/agent baton pass, live-catalog failure fallback, no-part outcomes, safety stops, 320px layouts, keyboard access, 44px touch targets, reduced motion, and automated WCAG A/AA checks.

## How We Used AI

AI is present at the browser-agent layer, not inside the shipped app. A compatible agent reasons over the state and tools supplied by Clunk, but the page owns the repair sequence, safety rules, and compatibility boundary. Built-in image generation helped create the original appliance location guides, which were mechanically reviewed and documented. Lovable hosts the static GitHub build. The deployed product has no app-side model call or model-runtime dependency.

## How We Used Codex

Codex helped turn the product idea into a tested conventional codebase: scoping the human/agent boundary, implementing the shared state engine and WebMCP registrations, checking source applicability, debugging interactions, generating edge cases, running accessibility and browser verification, reviewing the public deployment, and tightening the documentation. The project name **Clunk** was chosen by the participant, not generated by AI.

## Key features

- Eighty-four complete model revisions that can reach an exact, source-backed part outcome.
- 163 source-backed appliance identities across 11 brands and 782 explicitly classified model × symptom pairs.
- A first-class, original-illustration **Find my model number** flow shared with the browser agent.
- Punctuation/case-insensitive partial suggestions with suffix ambiguity and serial-number rejection.
- Shopify Global Catalog/UCP live offers with exact-SKU filtering, no caching, retry/empty states, and visible merchant-claim disclosure.
- Original category/location visuals and interactive component hotspots.
- Eight state-dependent WebMCP tools and one shared repair state.
- Deterministic safety, ordering, compatibility, and rejection logic.
- Plain-language collaboration milestones, technical inspector, sources, and manual fallback.
- Versioned deterministic WebMCP scenario fixtures plus a separate manual real-agent matrix and runbook.
- Responsive, keyboard/touch accessible, reduced-motion, WCAG A/AA-tested UI.
- Static credential-free Lovable hosting, public GitHub source, and MIT license.

## Public Demo Link

https://clunk-appliance-assistant.lovable.app

## Public Repository Link

https://github.com/mcostigliola321/clunk-your-appliance-assistant

## Demo Video

https://youtu.be/hUHGxR0iRR8 — **Clunk: A Person and Browser Agent Diagnose an Appliance with WebMCP** (2:28)

## Submission Readiness Notes

Official requirements and form fields were rechecked from Devpost on **September 2, 2026**. The deadline is **Thursday, September 3, 2026 at 1:00 PM Pacific Time**. The account is registered and submissions are currently open.

- [ ] Create the Devpost project. The authenticated account currently has no Devpost projects.
- [ ] Restore and reverify the public live URL. On September 2, 2026, the Lovable URL redirected to `clunk.repair`, whose apex domain did not resolve in public DNS.
- [x] Public code repository with source, assets, setup instructions, literal `document.modelContext.registerTool` code, and MIT license.
- [x] Text description covering WebMCP fit, user experience, new person/agent collaboration, and implementation.
- [x] Public YouTube demo under three minutes **with audio**, clearly showing what was built and how WebMCP is used: https://youtu.be/hUHGxR0iRR8 (2:28).
- [ ] Confirm the final natural-language agent/client evidence to enter in the required testing field. Current browser/UI checks must not be described as real-agent runs.

## TODO Official Form Fields

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

- Sixteen of 782 model × symptom pairs intentionally stop because the current evidence is insufficient.
- Exact-part coverage applies only to complete, verified model revisions; family-only identities remain safe-checks-only.
- Clunk does not confirm a diagnosis, guarantee stock or price, complete payment, or replace a technician.
- Shopify Global Catalog coverage is broad but not universal; Clunk shows an honest no-offer/retry state and never substitutes a nearby SKU.
- WebMCP is evolving; unsupported environments use the identical manual action layer.
- The person remains responsible for reporting physical observations and confirming the complete model on the seller page.

## Remaining submission tasks

- Create and save the Devpost project early so the remaining form gaps are visible before the deadline.
- Run and record the manual real-agent matrix in `docs/webmcp-agent-evaluation.md`, including any failures.
- Add the public YouTube demo URL (`https://youtu.be/hUHGxR0iRR8`) to the Devpost project once it is created.
- Complete the unchecked participant-specific Devpost fields above.
