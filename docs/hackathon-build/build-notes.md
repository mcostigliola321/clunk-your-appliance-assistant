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
