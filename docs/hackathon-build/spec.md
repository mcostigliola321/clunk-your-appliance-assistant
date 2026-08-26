# Technical Spec

## Overview

Clunk is a static React and TypeScript single-page application. It owns a deterministic repair state in the browser and registers a small imperative WebMCP tool surface on document.modelContext. No server, database, authentication, application-side model, or secret is required.

The central architectural rule is:

**Human UI action → public tool action → validated domain event → repair reducer → derived UI**

**WebMCP callback → public tool action → validated domain event → repair reducer → derived UI**

This guarantees that agents and people operate the same product rather than two loosely synchronized interfaces.

## PRD Mapping

- Shared repair state implements PRD Epics 2, 4, 5, and 10.
- Exploded appliance view implements Epic 3.
- Diagnostic workbench components implement Epics 1, 4, 5, 6, and 7.
- WebMCP registry and action layer implement Epic 8.
- Activity log, inspector, and manual mode implement Epic 9.
- Safety policy and guards implement Epics 4, 6, 7, and 10.

## Stack

- Lovable project and hosting: initial project creation, visual iteration, preview, and static production deploy.
- GitHub: public source of truth immediately after Lovable project creation.
- React 18+ and TypeScript: component UI and explicit domain contracts.
- Vite: static development and production build.
- Tailwind CSS: utility styling, extended with semantic CSS variables in OKLCH.
- Local variable font: Albert Sans through an OFL-compatible font package or checked-in font assets.
- Lucide React: small interface icons only; the original mechanically constrained washer topology illustrations are local static assets with conventional HTML controls layered above them.
- Vitest and Testing Library: domain, registration, and component integration tests.
- Playwright: deterministic browser smoke path, responsive checks, and manual-mode flow.
- No runtime data library, API SDK, database client, state-management dependency, or model client.

Documentation:

- [Chrome WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp)
- [WebMCP Community Group repository](https://github.com/webmachinelearning/webmcp)
- [WebMCP draft specification](https://webmachinelearning.github.io/webmcp/)
- [Vite](https://vite.dev/guide/)
- [Vitest](https://vitest.dev/guide/)
- [Playwright](https://playwright.dev/docs/intro)

## Visual System

### Physical scene

A homeowner is standing in a bright laundry room with water still in the washer, glancing between the machine and a laptop. The UI must remain legible at arm’s length and feel calm enough to reduce panic.

### Direction

- Product register, not a marketing landing page.
- OpenAI showcase restraint: pure surfaces, large product visual, few simultaneous actions, concise labels, and generous space.
- Light-first because safety copy, diagram labels, and physical observation controls must be easy to scan in a lit room.
- Restrained color strategy: black and white carry the interface; honey marks the current physical focus; cobalt distinguishes agent activity; green and red are reserved for pass and stop states.
- No glass, gradients, faux workshop texture, decorative grids, nested cards, or chat transcript as the main UI.

### Tokens

- Background: oklch(1 0 0)
- Surface: oklch(0.965 0 0)
- Surface strong: oklch(0.92 0 0)
- Ink: oklch(0.12 0 0)
- Muted ink: oklch(0.43 0 0)
- Primary honey: oklch(0.72 0.16 78)
- Primary pale: oklch(0.93 0.055 83)
- Agent cobalt: oklch(0.44 0.14 258)
- Success: oklch(0.47 0.11 150)
- Stop: oklch(0.48 0.18 28)
- Focus ring: a 3px outside ring using agent cobalt with a white separation ring.

All final text and control combinations must be contrast-tested. Saturated fills use near-white text.

### Typography

- Albert Sans Variable for display and body.
- Headings use weight, size, and space rather than decorative type pairing.
- Body copy is capped near 70 characters.
- Component and tool identifiers may use a compact code treatment only inside the tool inspector.

## Architecture

### Repair pack

A serializable repair pack describes the fictional appliance, components, supported symptom, checks, causes, parts, safety stops, and deterministic transitions. The app imports one pack: clunk-wm01.

The extension schema is documented in docs/repair-pack-schema.md and exemplified by src/data/clunk-wm01.json. This shows how the project could grow without adding more MVP scenarios.

### Domain engine

Pure functions validate actions, enforce safety gates, compute next steps, rank causes, and look up parts. They accept serializable values and return either a new state or a typed rejection. UI components never duplicate diagnosis or safety rules.

### State provider

React useReducer owns RepairState. A RepairProvider exposes:

- state
- invokeTool(name, input, source)
- dispatchHumanAction(name, input)
- reset()

The action layer is stored in a stable ref so WebMCP callbacks always reach current state without re-registering tools after every render.

### WebMCP adapter

On application mount, registerWebMcpTools feature-detects document.modelContext and registers all tools with an AbortController. The adapter:

1. Registers literal imperative definitions.
2. Validates input again at the application boundary.
3. Calls the shared invokeTool function.
4. Returns text and structured content.
5. Reports ready, unavailable, partial, or failed status to the UI.
6. Aborts registrations on unmount.

The published page must be tested as a top-level document. Lovable’s editor preview iframe may not delegate the tools permission.

### Manual judge adapter

Manual mode renders the same tool catalog with safe sample inputs. Pressing Run calls invokeTool with source manual. It is a protocol simulator, not an alternative reducer.

### Presentation

Selectors derive current component, progress, cause ranking, next safe check, part result, and status summary. The diagram and panels are declarative consumers of those selectors.

## State Model

RepairState contains:

- packId: clunk-wm01
- applianceId: null or clunk-wm01
- symptomId: null or will-not-drain
- phase: idle, preparing, checking, result, escalated
- currentStepId
- highlightedComponentId
- completedChecks: map from check ID to result ID
- acknowledgedSafety: list of safety gate IDs
- causes: derived ordered cause summaries
- selectedPartId
- escalation: null or reason and message
- webMcpStatus: detecting, ready, unavailable, partial, failed
- activity: append-only list of visible ActivityEvent items
- sequence: monotonic integer used for deterministic ordering

ActivityEvent contains:

- id derived from sequence, never random
- sequence
- source: agent, human, manual, system
- action
- arguments summary
- outcome: accepted or rejected
- message

Tests use the sequence rather than wall-clock time. The rendered UI may add a local display time without using it for assertions.

## Tool Contracts

### get_repair_state

- Type: read-only.
- Input: empty object.
- Result: serializable current state summary, valid next actions, and fictional-data notice.
- Visible effect: adds an agent read event to the activity log but does not advance diagnosis.

### identify_appliance

- Input: modelId, enum limited to clunk-wm01.
- Guard: reject unknown models.
- Effect: identifies the demo appliance and highlights the overall machine.

### start_diagnosis

- Input: symptomId, enum limited to will-not-drain.
- Guard: appliance must be identified.
- Effect: enters preparation, shows the safety gate, and initializes cause ranking.

### highlight_component

- Input: componentId from the repair pack.
- Guard: component must exist.
- Effect: changes visible diagram focus without advancing progress.

### record_check_result

- Input: checkId and resultId, both enum-bounded.
- Guards: diagnosis started, check is available, required safety gate acknowledged, result belongs to check.
- Effect: stores observation, recomputes causes and next step, and may produce a part or escalation.

The power-disconnected preparation is modeled as the result acknowledged on the prepare-power check, keeping the public tool surface small.

### show_repair_step

- Input: stepId from current valid steps.
- Guard: hazardous and unavailable steps are never returned.
- Effect: highlights the associated component and makes the safe instruction primary.

### find_compatible_part

- Input: componentId.
- Guards: appliance identified and component implicated by current evidence.
- Effect: selects and displays the matching fictional part.

### escalate_to_professional

- Input: reason enum: electrical, burning-smell, hot-water, active-leak, internal-access, unresolved.
- Effect: moves to a safe terminal state with stop instructions and no hazardous repair steps.

## Deterministic Diagnosis

### Supported checks

1. prepare-power
   - Acknowledge: cancel cycle, disconnect power, wait for movement to stop.
   - Stop: burning smell, smoke, hot water, or active leak near power.
2. inspect-drain-hose
   - Results: kinked, clear, disconnected, unsafe-to-reach.
3. inspect-pump-filter
   - Prerequisite: prepare-power acknowledged.
   - Instruction includes towels and shallow tray because water may release.
   - Results: blocked, clear, damaged, unsafe-to-open.

### Cause ranking

Initial order: blocked filter, kinked hose, drain pump failure, control fault.

- Hose kinked → kinked hose strong match.
- Hose clear → kinked hose possible.
- Filter blocked → blocked filter strong match and CL-PF-220 available.
- Filter clear after clear hose → drain pump likely; CL-DP-420 may be shown with professional-only installation.
- Unsafe, damaged, electrical, hot, smell, or leak result → escalation.
- No result ever exposes internal-control or live-power instructions.

Confidence is categorical and scenario-specific, never a real-world probability.

## Safety Architecture

SafetyPolicy is code, not prose alone.

- Deny-listed capability tags: gas, mains-voltage, high-voltage, refrigerant, sealed-compressor, bypass-protection, internal-wiring, control-board, energized-test, professional-only-instruction.
- Any repair pack step containing a deny-listed tag fails schema validation tests.
- Hazard observations transition to escalation before cause ranking.
- Part data includes installBoundary: user-observation, user-cleanable, or professional-only.
- show_repair_step cannot return a professional-only instruction body.
- Error and empty states retain the fictional-data and safety notices.

## Layout And Components

### AppShell

Top navigation with Clunk, fictional model badge, WebMCP status, manual mode, and reset. No oversized marketing header.

### IntroBand

One-line promise, symptom, and start action. Collapses after diagnosis starts but remains available to screen readers through landmarks.

### DiagnosticRail

Ordered steps with completed, current, upcoming, and stopped states. Uses a real sequence, so numbering is functional.

### ApplianceWorkbench

Large precise SVG on a neutral surface. Components separate slightly in the exploded view. Buttons and labels are outside SVG where needed for reliable focus behavior.

### NextCheckPanel

The primary action surface: safety state, short instruction, why it matters, result buttons, and stop condition.

### CauseStack

Ranked causes with categorical confidence and evidence explanation. Uses a flat list rather than identical cards.

### PartResult

Fictional SKU, compatibility, illustrative effort, install boundary, and persistent disclaimer.

### RepairContext

A compact comparison of clean or replace the accessible fictional item, hire service for an internal fictional part, and consider replacement when repeated professional faults exist. All values are illustrative.

### ActivityDrawer

Visible recent event line in the main layout; expandable full activity and tool inspector below. On desktop it can remain a narrow lower band. On mobile it follows the next check.

### LiveRegion

Announces component focus, accepted observation, next step, and escalation without duplicating all visible text.

## Responsive Behavior

- 1200px+: three-column bench—rail, dominant workbench, next-check and results.
- 768–1199px: two-column bench—workbench plus action panel, with rail across the top.
- Below 768px: ordered single column—status, diagram, next check, causes, part, activity.
- Controls never shrink below 44px.
- Critical functionality is reordered, not hidden.
- At 200% zoom, content reflows without horizontal page scroll.

## Motion

- Initial appliance assembly may use one short opacity and transform sequence.
- Component focus uses a 160–220ms transform and stroke transition.
- Activity insertion uses a short opacity transition.
- No bouncing, continuous pulsing, animated layout height, or ornamental scroll reveal.
- Reduced motion disables translation and uses immediate color, stroke, and label changes.

## File Structure

- package.json — scripts and pinned dependencies.
- vite.config.ts — Vite and Vitest configuration.
- src/main.tsx — application entry.
- src/App.tsx — top-level layout and error boundary.
- src/index.css — semantic tokens, base styles, reduced motion, and print behavior.
- src/data/clunk-wm01.json — fictional repair pack.
- src/domain/types.ts — repair pack, state, action, and result types.
- src/domain/repairPack.ts — pack loader and invariant checks.
- src/domain/safety.ts — deterministic safety policy.
- src/domain/diagnosis.ts — transition and cause ranking functions.
- src/domain/reducer.ts — state reducer and initial state.
- src/domain/selectors.ts — derived UI state.
- src/state/RepairProvider.tsx — shared state and public action layer.
- src/webmcp/contracts.ts — tool definitions and schemas.
- src/webmcp/registerTools.ts — literal document.modelContext.registerTool calls.
- src/webmcp/invokeTool.ts — validation, domain dispatch, and tool results.
- src/types/webmcp.d.ts — minimal current browser type augmentation.
- src/components/AppShell.tsx — navigation and status.
- src/components/DiagnosticRail.tsx — progress sequence.
- src/components/ApplianceDiagram.tsx — original exploded SVG.
- src/components/NextCheckPanel.tsx — safe observation controls.
- src/components/CauseStack.tsx — ranked evidence.
- src/components/PartResult.tsx — fictional compatibility.
- src/components/RepairContext.tsx — illustrative decision context.
- src/components/ActivityLog.tsx — visible event history.
- src/components/ToolInspector.tsx — schemas and manual invocations.
- src/components/StatusLiveRegion.tsx — assistive announcements.
- src/test/setup.ts — DOM and WebMCP stubs.
- src/domain/diagnosis.test.ts — deterministic path tests.
- src/domain/safety.test.ts — hazard and deny-list tests.
- src/webmcp/registerTools.test.ts — registration and shared-action tests.
- src/App.test.tsx — key human flow integration tests.
- tests/demo.spec.ts — Playwright demo and responsive smoke tests.
- evals/webmcp-cases.json — agent prompts, expected tools, and visible outcomes.
- docs/repair-pack-schema.md — extension contract.
- docs/hackathon-build/ — scope, PRD, spec, checklist, risks, and notes.
- README.md — judge and contributor guide.
- LICENSE — MIT license.

## Data Flow

1. RepairProvider loads the static pack and creates initial state.
2. UI mounts and registerWebMcpTools receives the stable invokeTool function.
3. A human action or tool callback calls invokeTool.
4. invokeTool validates the schema and maps input to a domain event.
5. safety.ts checks capability tags, prerequisites, and hazard results.
6. reducer.ts accepts or rejects the event.
7. selectors.ts recompute progress, next check, causes, and part availability.
8. React updates every visible consumer in one render.
9. invokeTool returns a serialized result based on the accepted state transition.

Because React dispatch is asynchronous, the action layer uses a synchronous pure transition against stateRef.current, updates the ref, then dispatches the accepted next state. The returned WebMCP result therefore describes the same state the UI is about to render.

## External APIs And Dependencies

Runtime external APIs: none.

Build-time package dependencies are limited to React, Vite, Tailwind, icons, local font assets, Vitest, Testing Library, and Playwright. The app must not fetch remote data during normal use.

## AI Usage

Clunk does not contain or call an AI model. WebMCP exposes deterministic tools to the browser agent supplied by ChatGPT or Chrome. The browser agent performs reasoning outside the site; Clunk supplies structured state and bounded actions.

The README and submission will distinguish:

- Codex and Lovable used to build the project.
- WebMCP browser agent used to operate the project.
- No application-side AI API.

## Testing Strategy

### Unit

- All valid and invalid transitions.
- Cause ranking for each observation combination.
- Safety escalation for every hazard enum and deny-listed capability.
- Exact fictional part lookup.
- Reset and deterministic event ordering.

### Integration

- Manual and agent adapters yield equal states.
- Literal tool registry receives eight tools.
- Missing modelContext produces usable manual mode.
- Rejected tool input cannot mutate state.
- UI flow reaches CL-PF-220 from clear hose plus blocked filter.

### Browser

- Main manual demo at desktop and 390px.
- Keyboard-only start, component selection, results, inspector, and reset.
- Reduced-motion computed styles.
- No console errors.

### Deployed WebMCP

- Test the published top-level Lovable URL in ChatGPT’s in-app browser.
- Test Chrome 149+ with chrome://flags/#enable-webmcp-testing enabled.
- Confirm all eight tools are discoverable.
- Run the canonical eval prompt and compare visible state and activity log.
- Do not treat Lovable’s editor iframe as authoritative.

## Demo And Submission Flow

- 0–15 seconds: show Clunk and invoke the first agent tool.
- 15–75 seconds: agent highlights hose, person supplies clear result, agent advances.
- 75–120 seconds: blocked filter result yields the exact fictional part.
- 120–145 seconds: show activity and tool inspector, emphasizing shared state.
- 145–165 seconds: show safety escalation and manual mode.
- Remaining time: repo, literal registration, no credentials, and final URL.

## Risks And Verification

See risks.md for the active register. Highest-risk items must be verified before visual polish:

1. Literal WebMCP registration in the deployed top-level page.
2. Lovable-to-GitHub source-of-truth workflow.
3. Shared synchronous action results.
4. Safety deny-list coverage.
5. Judge path without credentials.

## Real-model expansion addendum

This addendum replaces the singleton `clunk-wm01` assumptions while retaining the static architecture and one shared action layer.

### Catalog architecture

- `ApplianceCatalogEntry` owns brand, family model, aliases, required product-code shape, topology, verification tier, and repair-pack ID.
- `RepairPack` owns model-specific safe checks, cause rules, compatibility outcomes, and a provenance array.
- A registry validates every pack at module load and provides exact normalized lookup plus filtered catalog search.
- Catalog search never uses nearest-neighbor or fuzzy substitution; an unsupported query must remain unsupported.
- Packs can share versioned check templates, but the fully materialized pack is validated after composition.

### Provenance

`SourceReference` contains `id`, `kind`, `title`, `url`, `publisher`, `appliesTo`, and `lastVerified`.

Allowed source kinds are `manufacturer-model`, `manufacturer-troubleshooting`, `manufacturer-part`, and `authorized-parts`. An exact part requires at least one part source plus an explicit array of compatible complete product codes.

### State

The initial state has no selected pack. It includes catalog query, optional brand filter, visible result IDs, selected product code, and the existing diagnosis state. Selecting a different model clears downstream observations and part state deterministically.

### V2 WebMCP tools

1. `search_supported_appliances({ modelQuery?, brand? })`
2. `select_appliance({ applianceId, productCode? })`
3. `get_repair_state({})`
4. `start_diagnosis({ symptomId })`
5. `show_component({ componentId })`
6. `record_observation({ checkId, resultId })`
7. `find_compatible_part({})`
8. `stop_and_escalate({ reason })`

Registration is state-dependent:

- Catalog: search, select, get state.
- Selected: search, select, get state, start diagnosis.
- Active check: get state, show component, record observation, stop and escalate.
- Result with compatible outcome: get state, show component, find compatible part, stop and escalate.
- Terminal escalation: get state, search, select.

The provider derives a stable availability key. A registration effect aborts the old group and registers the current group. Each literal tool registration remains visible in source for judging and auditability.

### Diagrams

Original SVG geometry supports topology flags rather than manufacturer artwork. The submission includes front-filter, lower-service, and hose-only variants. Components omitted by a pack are not interactive or suggested by tools.

### Test matrix

- All nineteen entries pass schema and source validation.
- Search/select normalizes supported aliases and refuses unsupported models.
- LG WM3400CW and both Samsung complete product codes can reach verified professional-only pump results after observations.
- A blocked user-accessible filter returns no-part-needed, not a purchase prompt.
- GE, Whirlpool, Maytag, and Electrolux incomplete product codes return variant-needed for internal part matching.
- Packs without manufacturer-documented filter access advance from a clear hose directly to a service boundary.
- WebMCP registry tests assert state-dependent registration and AbortController cleanup.
