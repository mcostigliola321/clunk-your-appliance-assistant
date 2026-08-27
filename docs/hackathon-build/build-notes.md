# Build Notes

## 2026-08-26 — Onboarding

- Official Devpost rules, dates, judging criteria, prizes, and submission requirements were reviewed from live Devpost data and explicitly acknowledged.
- Product name chosen by the participant: **Clunk**.
- Direction confirmed: one fictional no-drain washing-machine scenario, shared visual repair state, deterministic safety, no app-side LLM or credentials.
- Visual reference chosen by the participant: OpenAI Developers showcase, emphasizing simple hierarchy, generous spacing, and immediate comprehension.
- Hosting choice: Lovable, with GitHub connected as the source of truth before substantial local implementation.
- Build mode requested by the participant: autonomous.
- Generic ideation intentionally skipped because the parent task already contains the product decision and scope boundaries.
- Deepening rounds: 0; the supplied brief already answers the onboarding and sharpening prompts in detail.

## 2026-08-26 — Scope, PRD, spec, and checklist

- Scope reduced to one fictional model and one symptom; all real diagnosis, image analysis, accounts, persistence, commerce, and internal repair instructions are explicit non-goals.
- Product requirements organized around ten user-facing epics with deterministic acceptance criteria.
- Technical direction: static React and TypeScript, pure domain engine, one shared action layer, literal imperative WebMCP registration, no application-side model or network API.
- Current primary WebMCP sources confirm document.modelContext.registerTool(), AbortController-owned lifecycle, and Chrome 149 testing flag.
- Design direction records the participant’s OpenAI showcase reference with a light-first, black-and-white product surface and restrained honey and cobalt roles.
- Checklist planning was handed off; autonomous speed-run and no participant verification pauses were selected from the kickoff request.
- The submission wow moment is the synchronized visual state change caused by an agent tool call.
- Deepening rounds: 0 for scope, PRD, spec, and checklist; the supplied brief was already unusually specific and requested autonomous execution.

## 2026-08-26 — Checklist item 1

- Created Lovable project ID 4d536d43-a124-405a-b657-8f125b15b695 in the participant’s My Lovable workspace.
- Connected Lovable’s generated main branch to mcostigliola321/clunk-your-appliance-assistant with two-way sync.
- Attached this workspace to the generated remote without overwriting the local planning documents.
- Set local commit authorship to Mark Costigliola using the GitHub noreply address tied to mcostigliola321.
- Replaced the unexpected server-capable TanStack Start scaffold with a static Vite and React entry; removed generated server, router, and unused UI scaffolding.
- Switched the local dependency workflow from Bun to npm after Bun omitted native optional build bindings on this machine. The disposable Bun node_modules directory was moved to /tmp/clunk-node-modules-bun-20260826 and can be removed later.
- Added the MIT license early so GitHub can detect it as soon as the repository becomes public.
- Verification: npm install reported zero vulnerabilities; npm run build produced a static dist with no server output.

## 2026-08-26 — Checklist item 2

- Added the original fictional Clunk WM-01 repair pack with three bounded checks, seven visible components, four ranked causes, and three clearly fictional parts.
- Implemented one pure action engine for all human, manual, and agent interactions, including rejected-action logging and deterministic event ordering.
- Added state-derived progress, cause ranking, part matching, next actions, and a persistent fictional-data disclaimer.
- Enforced immediate stop states for burning smell, hot water, leaks near power, unsafe access, and damaged user-access areas; no internal or energized instructions exist in the repair pack.
- Added a shared React provider whose synchronous public action layer returns the same snapshot it renders.
- Verification: 11 focused engine and safety tests pass; TypeScript and the static production build pass.

## 2026-08-26 — Checklist item 3

- Added eight narrow WebMCP contracts with enum-bounded JSON Schemas, no additional properties, explicit sequencing, and sample inputs for the judge inspector.
- Added eight literal `document.modelContext.registerTool({` registrations using the current draft API, per-call cancellation signals, and an AbortController-owned registration lifecycle.
- Routed every WebMCP execution through the same synchronous action layer used by the human interface and labeled the resulting activity as agent-sourced.
- Added progressive feature detection with ready, partial, failed, and unavailable states so the full manual experience continues in browsers without WebMCP.
- Verification: registry tests capture all eight tools, execute an agent path, and confirm cleanup; 13 total tests and the static build pass; the literal registration count is eight.

## 2026-08-26 — Checklist items 4–7

- Applied the Impeccable and OpenAI-showcase direction as a restrained product interface: high-contrast black and white, generous space, local Albert Sans, and honey used only for current physical focus.
- Built the original exploded Clunk WM-01 SVG, functional diagnostic rail, one-step observation panel, ranked causes, exact fictional part reveal, and illustrative repair-versus-replace context.
- Added a visible source-labeled activity log, unsupported-browser status, reset, and an expandable judge inspector for all eight tools and their bounded sample inputs.
- Added keyboard-accessible 44px component controls, focus rings, live-region updates, mobile reordering, reduced-motion rules, persistent fictional-data labels, and a safe recovery screen.
- Corrected all issues found by the automated accessibility pass: progress semantics, low-contrast upcoming steps, and nested SVG interactions.
- Verification: the canonical path reaches CL-PF-220 in the ChatGPT in-app browser with a clean console; desktop and Pixel 7 screenshots are captured; component, safety, keyboard, touch-size, responsive, reduced-motion, and WCAG A/AA tests pass at desktop and mobile widths.

## 2026-08-26 — Checklist items 8–11

- Added eleven WebMCP evaluation scenarios covering every public tool, canonical diagnosis, visual explanation, professional boundaries, invalid ordering, hazards, and a protection-bypass refusal.
- Published the architecture, deterministic safety model, repair-pack schema, contribution guidance, security guidance, and judge-first README.
- Added a GitHub Actions quality gate for TypeScript, lint, deterministic tests, static build, desktop/mobile Playwright flows, and accessibility checks.
- Diagnosed Lovable’s stale-preview failure to its required `build:dev` command, added the portable Vite script, and successfully published the production site at https://clunk-appliance-assistant.lovable.app.
- Verified the live canonical path in ChatGPT’s in-app browser with manual fallback and a clean console.
- Verified the connected Chrome profile reports all eight WebMCP tools ready and completes the live `CL-PF-220` path; the only console message was from an unrelated installed browser extension.
- Created the Devpost draft with the official form fields, judging-aligned story, testing instructions, screenshot list, and an under-three-minute demo outline.
- Remaining participant actions are external to the build: make the GitHub repository public, record and upload the public YouTube demo, and confirm the personal form answers.

## 2026-08-26 — Participant-directed real-model pivot

- The participant challenged whether a fictional-only demo was sufficiently useful and approved a larger eight-day build.
- Scope now targets six brands and twelve real washer model families while retaining one excellent no-drain symptom.
- Breadth is defined as source-backed model families, not universal coverage. Troubleshooting verification and exact-part verification are separate states.
- The product must require a complete model/product code before making an exact compatibility claim; uncertain variants are a visible refusal, not a guessed result.
- The WebMCP surface will become state-dependent and discovery-first so the browser agent performs a meaningful job: locate the right pack, sequence human observations, expose provenance, and stop at evidence or safety boundaries.
- Existing fictional proof-of-concept history is retained; checklist items 12–18 supersede the prior submission handoff.

## 2026-08-26 — Source-backed v2 vertical slice

- Replaced the fictional singleton with 12 real front-load washer families across LG, Samsung, GE, Whirlpool, Maytag, and Electrolux. Each family has a dated official model/support source and a conservative diagram/check profile.
- Added exact product-code verification, unsupported-model refusal, no-part-needed, variant-needed, exact-part, and professional-only outcomes. Rechecked the launch evidence and corrected Samsung’s verified drain-pump listing to `DC97-20621A` for the selected complete codes.
- Generalized the deterministic engine, shared snapshot, original topology diagram, model finder, source panel, part boundary, and activity log without adding a backend or app-side model call.
- Replaced the v1 WebMCP catalog with eight state-dependent v2 tools and ten agent eval cases covering discovery, human observation, visual explanation, exact part, no part, unsupported models, hazards, and bypass refusal.
- Rewrote the public README, architecture, safety model, source ledger, repair-pack guide, JSON Schema, and product brief around source-backed evidence and bounded compatibility.
- Verification passed: TypeScript, ESLint, 26 unit/integration/eval tests before the final diagram refinement, 22 focused engine/safety/registry/eval regressions after it, production build, and 12/12 Playwright cases across desktop and mobile. Browser checks include exact-part, no-part, hazard, keyboard, 44px touch targets, responsive overflow, reduced motion, and automated WCAG A/AA rules.
- Desktop and 390px visual review confirmed the clean model-finder-first hierarchy. Deployment and actual natural-language WebMCP sessions remain checklist items 17–18.

## 2026-08-26 — Production publish and browser proof

- Pushed `d46c3ef` to the GitHub-connected `main` branch under Mark Costigliola’s configured author and published the synced build to https://clunk-appliance-assistant.lovable.app with Lovable deployment `36ba1bfc-9961-436e-ac7f-7d47d45aa72f`.
- Live verification caught stale fictional title/description metadata. Fixed it in `30f568b`, pushed it under the same author, and republished with deployment `7bd4efd0-8698-4a28-ad92-69d5036769af`.
- Chrome 149 loaded the public v2 catalog with **Agent tools ready**. The visible state-dependent inventory changed from 3/8 at catalog state to 4/8 at the exact-part result. The production LG `WM3400CW.ABWEVUS` path ended at `AHA75693425`, the cited LG evidence link, and a professional-only installation boundary with eight visible activity events and no console warnings or errors.
- The in-app browser loaded the same public v2 build in **Manual mode ready**, exposed 3/8 catalog-state judge tools, and reported no console warnings or errors.
- Checklist item 17 remains open until the exact-part, no-part-needed, and unsupported-model cases are captured as natural-language agent-driven WebMCP sessions rather than UI/manual verification alone.

## 2026-08-26 — Visual cutaway and progressive disclosure

- Replaced the schematic SVG with an original generated generalized front-load washer cutaway. Seven conventional HTML hotspot controls keep the drum, sump, pump filter, drain pump, drain hose, control module, and cabinet keyboard-accessible and synchronized with WebMCP state.
- Removed the empty repair bench from first load. The initial surface now presents the promise, the product cutaway, model selection, and a three-step explanation; the full bench appears only after model selection.
- Collapsed the agent activity log and judge tool inspector behind a persistent status summary so the WebMCP implementation remains visible without dominating the repair task.
- Re-ran the full exact-part path in both the in-app browser and Chrome. Chrome reported **Agent tools ready** and the visible hotspot state advanced with the same shared action layer.
- The image is illustrative and brand-neutral, not a manufacturer service diagram or a claim about the selected model's physical layout. Generation details are recorded in `visual-assets.md`.

## 2026-08-26 — Purchase handoff and top-load expansion

- Added a purchase-ready exact-part result with seller, dated price/availability snapshot, and a direct product-page handoff. Payment, tax, delivery, returns, and live availability remain on the seller site.
- Verified the LG `AHA75693425` listing at Encompass and exposed the purchase metadata through the same repair snapshot returned by `find_compatible_part`.
- Expanded the catalog to 14 model families with LG `WT7400CW` and `WT7405CW` top-load packs backed by official model and no-drain guidance.
- Expanded the catalog again to 19 model families by adding GE `GTW465ASNWW` and `GTW585BSVWS`, Samsung `WA45T3200AW/A4`, Whirlpool `WTW5057LW`, and Maytag `MVW5430MW`. Seven top-load packs now span five brands and share the same hose-only safety boundary.
- Full verification after the multi-brand top-load expansion passed 29 unit/integration/eval tests and 16 Playwright cases across desktop and mobile.
- Generated an original generalized top-load cutaway matching the existing visual system. Repair packs now select front-load or top-load artwork and topology-specific hotspot positions.
- Top-load packs use the conservative hose-only path, omit the unsupported front pump-filter check, and stop at professional service after visible checks.
- Added a documented dishwasher and refrigerator expansion path that retains the current eight WebMCP tools while moving visuals, safety profiles, and symptom rules into category data.
- Verification: 29 deterministic unit, UI, registry, safety, and WebMCP-eval tests pass; the static production build passes.

## 2026-08-26 — Mechanical-credibility correction

- Retired both generated washer cutaways after visual review found duplicated or display-like plumbing and implausible component placement.
- Replaced them with original, mechanically constrained front-load and conventional U.S. top-load topology illustrations grounded in manufacturer support and parts architecture.
- The front-load orientation now shows one basket and outer tub, suspension, and one connected tub-to-pump-to-drain path with the filter cap integrated into the low-front pump housing.
- The top-load orientation now shows a rear control console, basket and outer tub, center agitator, four suspension rods, a plausible belt-drive assembly, and one connected drain pump path.
- Updated every active customer-facing label to state that the illustration is a topology orientation rather than a model-specific service diagram and that placement varies by engineering revision.

## 2026-08-26 — Direction A overnight sprint

- The participant rejected the misleading **See the complete answer** behavior after confirming that it opened at the first safety question with no purchase link visible.
- Live reproduction confirmed the defect: one click produced zero buy links and moved the page to “Make the washer safe.”
- Official live judging criteria were rechecked. The order is WebMCP Leverage, Execution, Potential Impact, and Creativity & Ambition; the sprint therefore prioritizes four complete outcomes over a large checks-only catalog.
- The participant selected Direction A: one purchase-ready flagship story each for washer, dishwasher, electric dryer, and refrigerator, backed by honest additional breadth.
- The visual direction remains an OpenAI-showcase-like, brutally clear product surface. The extraordinary moment is functional: one action transforms the appliance into an explained, purchase-ready answer while the same state remains operable by a browser agent.
- Autonomous build mode remains active. Checklist items 20–26 define the sprint and supersede the previous submission-handoff timing.
- Replaced the washer-specific domain with schema-v3, data-driven repair packs for washers, dishwashers, electric dryers, and refrigerators while keeping the original eight public WebMCP tools.
- Added 12 sourced models for a total of 31 and one in-stock purchase-ready flagship per category. Guided-only and currently unavailable part states are labeled before selection.
- Rebuilt the home screen around the literal outcome: four problems, four flagships, and one-click example answers that immediately expose the location, SKU, dated seller snapshot, and outbound part link.
- The example control now replays `select_appliance`, `start_diagnosis`, bounded `record_observation` calls, and `find_compatible_part` through the shared engine with `example` activity provenance.
- Added original category location guides for the dishwasher, electric dryer, and refrigerator and documented their generation prompts plus evidence/accuracy boundary.
- Local browser use confirmed all four one-click flows end with the expected SKU, category illustration, and seller link. The in-app browser reported WebMCP ready on the local build.
- The complete quality gate passed: typecheck, lint, 28 deterministic unit/integration/eval tests, production build, and 16 Playwright scenarios across desktop and Pixel 7. Browser checks include all category handoffs, 320px overflow, keyboard access, 44px touch targets, reduced motion, and automated WCAG A/AA.
- Pushed `123802f` and `3e78f1f` to the public MIT-licensed GitHub repository under Mark Costigliola's configured author identity. The GitHub and Lovable project remain connected on `main`.
- Lovable initially continued serving the previous 19-washer release because an old diagnostic approval state had left the current changes unpublished. Cleared that stale state and used Lovable's normal **Publish changes** control to publish the current GitHub build.
- The public URL now reports 31 supported models and the title **Clunk · Find the appliance part to buy**. In-app production walkthroughs confirmed all four one-click examples end at the expected exact model, SKU, and seller URL, with each purchase link opening in a new tab.
- Chrome 149 loaded the same current production build with **AI connected**. Its live Whirlpool dishwasher example ended at `W11412291`, opened the Whirlpool Parts listing in a new tab, and retained the visible Agent activity surface.
- Captured and visually inspected the final production purchase/activity and hazard-stop frames alongside the existing desktop and mobile home frames. Each capture waits for the original appliance asset to decode before recording so the complete location guide is visible.
- Produced and visually spot-checked a 45-second, 1440×900, captioned MP4 from the public build. It covers the promise, dishwasher part/seller answer, shared WebMCP activity, safety stop, and catalog close; the recording notes explicitly preserve the distinction between this credential-free Guided-mode b-roll and the final Chrome 149 natural-language agent capture.
- The public repository, detected MIT license, live Lovable site, refreshed Devpost story, source ledger, desktop/mobile screenshots, and complete verification output now satisfy checklist item 26. The remaining competition-critical capture is checklist item 17: three recorded natural-language agent sessions, followed by the public under-three-minute demo video.

## 2026-08-27 — Fresh-eyes WebMCP-native correction

- Made the person/agent baton pass primary UI: Clunk now says when it cannot see a physical check, shows `record_observation` as available, and visibly unlocks `find_compatible_part` after the person reports an observation.
- Reworked the activity surface into source-distinct collaboration milestones while preserving raw WebMCP action names. Example replays are explicitly labeled deterministic fixtures and never presented as agent runs.
- Tightened the WebMCP boundary with compact current-task structured output, a genuinely read-only `get_repair_state`, positive task descriptions, bounded validation, and tested state-dependent lifecycle swaps.
- Re-audited all four commercial flagships on 2026-08-27. Encompass’s live fit checker contradicted the prior LG `WM3400CW.ABWEVUS` exact-part claim, so the LG purchase path was withdrawn. GE `GFW550SSN0WW` with `WH11X39237` now provides the exact-code washer flagship.
- Relabeled `evals/webmcp-evals.json` as deterministic scenario fixtures and added a separate real-agent matrix/runbook. No natural-language agent run was manufactured; the matrix remains Not run until a supported prompt interface is available and recorded.
- Refreshed the Devpost story and demo shot list around the GE dryer handoff, terminal safety, no-part trust proof, and the closing line: “Clunk is a repair bench a person and their agent operate together.”
- Final local verification passed typecheck, lint, 33 deterministic unit/integration/scenario-fixture tests, a production build, and 18 Playwright tests across desktop and mobile, including the tool swap, terminal tool absence, 320px overflow, touch sizing, reduced motion, and automated WCAG A/AA.

## 2026-08-27 — Model-label handoff and 50-model expansion

- Added **Find my model number** as an equal entry path. Category/form-factor guidance, original inline location drawings, Model-versus-Serial explanations, examples, and dated manufacturer sources remain fully usable in manual mode.
- Moved normalization and ranking into a dedicated model-search domain module. Search is case/punctuation-insensitive, suggests partials, reports suffix ambiguity, rejects explicitly labeled Serial/S/N text, and no longer lets extra unsupported text match a shorter model by reverse containment.
- Extended the existing catalog-state WebMCP output with model-number handoff instructions, query status, ambiguity, capability labels, and category/tier counts. The existing eight-tool surface remains unchanged.
- Expanded the source-backed catalog by 19 guided entries to 50 total: 23 washers, nine dishwashers, nine electric dryers, and nine refrigerators across 11 brands. Final tiers are four purchase-ready, 44 guided checks, and two verified-part-unavailable.
- Replaced a drafted chopper-style Maytag dishwasher with Amana `ADB1400AGW` after the official triple-filter manual proved the user-access path. Removed universal refrigerator twist-in/location wording because the expanded set includes a base-grille Amana and push-in Frigidaire design.
- Bumped repair packs to schema v4 with an explicit capability tier and catalog/pack consistency validation. All four established purchase-ready flagships remain unchanged.
- Audited every added evidence URL and recorded retrieval date/status in `docs/source-url-audit.md`; drafted dead category URLs were replaced before release review.
- Local verification for this isolated worktree passed typecheck, lint, 43 deterministic unit/integration/scenario-fixture tests, production build, and 22 Playwright cases across desktop and Pixel 7. Desktop/mobile model-locator screenshots were visually inspected. This worktree was not pushed or deployed.

## 2026-08-27 — Shopify Global Catalog/UCP purchase expansion

- Separated fit proof from offer discovery: manufacturer or authorized-parts evidence still maps a complete appliance code to one exact SKU; Shopify Global Catalog only finds current listings for that SKU.
- Added a credential-free UCP `search_catalog` client, hosted agent profile, no-cache request policy, loading/error/empty states, exact-SKU filtering, seller-claim labels, and external cart handoff. Nearby SKUs are rejected even when returned by the catalog.
- Verified 10 SKU queries against the live endpoint. Each returned 5–20 available exact-number offers after Clunk's filter on 2026-08-27.
- Upgraded eight exact models after evidence review: two Samsung washers, three visible dryer catches, and three refrigerator filters. Final tiers are 12 purchase-ready, 38 guided checks, and zero verified-part-unavailable.

## 2026-08-27 — Evidence-backed 131-model worktree expansion

- Added 81 guided-only U.S. model families through 49 compact, schema-validated profiles. The reviewable catalog now totals 131: 48 washers, 25 dishwashers, 25 electric dryers, and 33 refrigerators across 11 brands.
- Preserved the published purchase-ready set exactly: 12 complete engineering revisions backed by manufacturer or authorized exact-part evidence. The other 119 entries remain plainly guided-only; no adjacent revision inherits a part or Shopify query.
- Added official model URLs, aliases/full-code rules, topology, supported symptom, retrieval date, and ledger coverage for every new entry. All 121 unique expansion model/troubleshooting endpoints returned HTTP 2xx in the final sweep.
- Kept every new dishwasher on a conservative external sink/air-gap/drain-connection path, and represented Bosch `WTG86403UC/01` with a distinct compact-ventless topology.
- Added capability-tier and brand filters, expanded WebMCP structured discovery output, runtime schema/source validation, focused unit/browser coverage, and documentation for the data-driven extension path.
- Re-ran all 10 exact-SKU Shopify UCP queries without caching. Exact available counts ranged from 7 to 20; 35 neighboring listings were rejected.
- This work remains an unpublished worktree expansion. No deploy, push, history rewrite, or universal-coverage claim was made.
- Bumped repair packs to schema v5, added the same narrow commerce handoff to WebMCP structured output, and kept the public tool count at eight.
- Added focused UCP parsing/request tests and desktop/mobile mocked-catalog coverage that injects a cheaper wrong SKU and proves it never reaches the UI.

## 2026-08-27 — Dedicated exact-part revision pass

- Upgraded 13 expansion rows at one complete engineering revision each: five washers, three dishwashers, three electric dryers, and two refrigerators. Final tiers are 25 purchase-ready and 106 guided-only.
- Stored each exact code, exact SKU, manufacturer/authorized compatibility URL, UCP query, exact-offer count, and retrieval date on the individual model row. Shared troubleshooting profiles cannot carry a part into a sibling revision.
- Added professional-install purchase handoffs after the safe external hose/sink checks for exact top-load washer and conservative dishwasher profiles; guided siblings still stop at service.
- Queried 10 upgrade SKUs directly through Shopify Global Catalog/UCP with no-store semantics. All returned HTTP 200 with 10–20 exact offers; 24 available neighboring listings were rejected by the exact-number filter.
- Added schema/runtime failures for multi-revision expansion parts, source/code mismatch, zero-offer tier inflation, and inexact Shopify queries. Added exact upgrade fixtures plus a `KDFE204KPS1` negative case proving `KDFE204KPS0` evidence does not carry over.
- Re-audited the 13 compatibility URLs. The reviewed browser pages remained available, while command-line GETs returned storefront protection (HTTP 403); no protected status was treated as compatibility evidence.
- This remains an unpublished, reviewable worktree. No deploy, push, rebase, amend, squash, force-push, or universal-compatibility claim was made.
