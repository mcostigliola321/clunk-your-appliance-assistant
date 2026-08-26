# Build Checklist

## Build Preferences

- **Build mode:** Autonomous
- **Comprehension checks:** N/A
- **Git:** Commit each verified vertical slice after Lovable creates and connects the GitHub repository
- **Verification:** Yes; no participant look-at-it pauses until a working MVP exists
- **Check-in cadence:** Speed-run with concise commentary updates
- **Internal deadline:** Submission-ready by September 2, 2026 at 1:00 PM PT
- **Wow moment:** An agent tool call highlights the exact physical component while progress, evidence, next check, and activity all update together

## Checklist

- [x] **1. Create the Lovable project and establish GitHub as source of truth**
      Spec ref: spec.md > Stack and Architecture
      What to build: Create Clunk in Lovable from the approved plan, connect its generated repository to GitHub, attach this workspace to that remote, preserve planning files, and confirm the static React and TypeScript scaffold.
      Acceptance: Lovable has a Clunk project, a public-source workflow exists, the local workspace tracks the generated repository, and no application feature code predates that connection.
      Verify: Read the Lovable project metadata, inspect the Git remote and default branch, and run the scaffold build.

- [x] **2. Implement the repair pack, domain engine, safety policy, and shared state**
      Spec ref: spec.md > Repair pack, Domain engine, State Model, and Safety Architecture
      What to build: Add the fictional Clunk WM-01 data, types, pack invariants, pure diagnosis transitions, cause ranking, part lookup, safety deny-list, reducer, selectors, and RepairProvider public action layer.
      Acceptance: PRD Epics 2, 4, 5, 6, and 10 have deterministic state behavior; invalid or hazardous actions cannot mutate into an unsafe state.
      Verify: Run focused domain and safety unit tests, including clear-hose plus blocked-filter and professional-escalation paths.

- [x] **3. Register and verify the literal WebMCP tool surface**
      Spec ref: spec.md > WebMCP adapter and Tool Contracts
      What to build: Add current document.modelContext types, eight literal registerTool definitions, bounded schemas, AbortController lifecycle, feature detection, structured results, and registration status.
      Acceptance: PRD Epic 8 passes; every callback calls the shared action layer and the app remains usable without WebMCP.
      Verify: Run registry tests with a stub modelContext and search the built source for literal document.modelContext.registerTool({ registrations.

- [x] **4. Build the clean application shell and interactive exploded appliance**
      Spec ref: spec.md > Visual System and Layout And Components
      What to build: Implement tokens, typography, AppShell, IntroBand, DiagnosticRail, and the original keyboard-accessible Clunk WM-01 SVG with diagram labels and focus states.
      Acceptance: PRD Epics 1 and 3 pass; the model, symptom, promise, diagram, and start action are immediately legible at desktop and mobile widths.
      Verify: Run the app, capture desktop and 390px screenshots, and complete a keyboard-only component selection check.

- [x] **5. Build the diagnostic, causes, parts, and repair-context experience**
      Spec ref: spec.md > NextCheckPanel, CauseStack, PartResult, and RepairContext
      What to build: Connect safe observation controls to the action layer, render ranked evidence, reveal fictional compatibility, and show illustrative repair-versus-replace context with persistent boundaries.
      Acceptance: PRD Epics 4–7 pass and the canonical path reaches CL-PF-220 without free text or hazardous instruction.
      Verify: Run component integration tests and manually complete the under-two-minute path.

- [x] **6. Add agent activity, tool inspector, and manual judge mode**
      Spec ref: spec.md > Manual judge adapter, ActivityDrawer, and Tool Contracts
      What to build: Render source-labeled events, tool purposes and schemas, sample arguments, manual Run controls, WebMCP status, reset, and visible rejection outcomes.
      Acceptance: PRD Epic 9 and unsupported-browser acceptance criteria pass; manual invocations yield the same snapshots as agent invocations.
      Verify: Run adapter equality tests and execute every mutating tool once through manual mode.

- [x] **7. Harden safety, accessibility, responsiveness, and reduced motion**
      Spec ref: spec.md > Safety Architecture, Responsive Behavior, and Motion
      What to build: Add live-region announcements, focus handling, 44px controls, non-color highlighting, narrow-layout reordering, zoom resilience, error boundary, stop states, contrast fixes, and reduced-motion rules.
      Acceptance: All accessibility and recovery criteria in PRD Epics 3, 4, and 10 pass; no critical functionality is hidden on mobile.
      Verify: Run keyboard, reduced-motion, 200% zoom, responsive, console, and automated accessibility checks available in the environment.

- [x] **8. Complete deterministic tests and WebMCP evaluation fixtures**
      Spec ref: spec.md > Testing Strategy
      What to build: Finish unit, integration, and Playwright coverage; add eval prompts with expected tools, arguments, visible outcomes, safety refusals, and manual-mode equivalents.
      Acceptance: Canonical and hazard paths are reproducible; rejected inputs prove no unsafe or contradictory state mutation.
      Verify: Run typecheck, lint, unit tests, coverage if configured, Playwright tests, and production build.

- [x] **9. Add open-source and contributor documentation**
      Spec ref: spec.md > File Structure and Demo And Submission Flow
      What to build: Add MIT LICENSE, judge-first README, architecture and safety notes, repair-pack extension schema, testing steps, browser enablement, AI usage distinction, and fictional-data disclaimers.
      Acceptance: A judge can run and understand Clunk without credentials; the repository visibly satisfies the official license and literal-registration requirements.
      Verify: Follow README instructions from a clean install and inspect repository root contents.

- [x] **10. Deploy and verify the production WebMCP experience**
      Spec ref: spec.md > Deployed WebMCP
      What to build: Publish Clunk on Lovable, ensure the top-level URL is public, and test the canonical agent path in ChatGPT’s in-app browser and Chrome 149+ with the WebMCP testing flag.
      Acceptance: The live app loads without credentials, exposes all tools in supported browsers, retains manual mode elsewhere, and has no runtime service dependency.
      Verify: Record the live URL, browser versions, tool inventory, canonical eval result, mobile screenshot, and console/network findings.

- [x] **11. Prepare Devpost handoff**
      Spec ref: prd.md > Submission Proof Points
      What to build: Gather the project story, screenshots, public repo link, live URL, testing instructions, tool inventory, safety proof, video beat sheet, and implementation notes required for submission prep.
      Acceptance: The participant has enough verified material to run prepare-submission and record a narrated demo under three minutes.
      Verify: Review the official requirements against the handoff materials and confirm the next command is prepare-submission.

## Real-model expansion

- [x] **12. Replace the fictional singleton with an extensible source-backed catalog**
      Spec ref: spec.md > Real-model expansion addendum
      What to build: Add nineteen real model-family entries, source provenance, verification tiers, topology identifiers, exact-model aliases, and schema invariants. Keep runtime data static and original.
      Acceptance: Six brands are represented; every entry has an official model/support source and verification date; exact-part claims require evidence and the required product-code specificity.
      Verify: Catalog validation tests cover uniqueness, sources, safety, model matching, and part-evidence requirements.

- [x] **13. Generalize the diagnosis engine and shared state**
      Spec ref: spec.md > Real-model expansion addendum
      What to build: Support catalog search, model selection, pack-specific safe checks, source-backed snapshots, unavailable-filter branches, and compatibility refusal without duplicating state logic.
      Acceptance: Human, manual, and agent actions still reach the same synchronous transition layer across every pack.
      Verify: Parameterized tests run canonical, no-public-filter, exact-part, unknown-model, and hazard paths.

- [x] **14. Bake out the state-dependent WebMCP surface**
      Spec ref: spec.md > Real-model expansion addendum
      What to build: Register the eight v2 tools with literal registerTool calls, current-state schemas/descriptions, dynamic availability, structured provenance, and visible accepted/rejected activity.
      Acceptance: Irrelevant tools are not registered; part lookup cannot appear before evidence; natural-language eval fixtures cover discovery, observation, compatibility, and refusal.
      Verify: Registry lifecycle tests assert tool sets at catalog, diagnosis, result, and terminal states.

- [x] **15. Redesign the bench around model discovery and evidence**
      Spec ref: prd.md > Real-model expansion addendum
      What to build: Add a five-second model finder, supported-family browser, selected-model identity, topology-aware original diagram, source ledger, compatibility status, and retained clean responsive repair flow.
      Acceptance: A judge can enter “WM3400CW,” understand what is verified, and begin in under fifteen seconds without credentials.
      Verify: Desktop/mobile, keyboard, reduced-motion, 200% zoom, and WCAG checks pass.

- [x] **16. Refresh open-source schema, evals, and contributor path**
      Spec ref: spec.md > Real-model expansion addendum
      What to build: Document repair-pack authoring, source policy, confidence vocabulary, contribution validation, unsupported-model behavior, tool lifecycle, and agent eval prompts.
      Acceptance: A contributor can add a fifteenth family without editing engine or component switch statements.
      Verify: README instructions, schema example, fixture validation, lint, tests, and build pass.

- [ ] **17. Deploy and prove the real agent collaboration**
      Spec ref: spec.md > Deployed WebMCP
      What to build: Publish through Lovable and run actual natural-language agent sessions in Chrome 149+ for an exact-part path, a no-part-needed path, and an unsupported-model refusal.
      Acceptance: Tool discovery and state lifecycle work on the top-level production URL; every call is visible in Clunk.
      Verify: Record prompt, discovered tool sequence, visible final state, browser version, console/network findings, and screenshots.

- [ ] **18. Refresh the competition handoff**
      Spec ref: prd.md > Submission Proof Points
      What to build: Rewrite the README opening, Devpost draft, demo beat sheet, screenshots, and proof checklist around source-backed breadth and the human-senses/agent-structure collaboration.
      Acceptance: The public story makes the WebMCP advantage clear in under three minutes and avoids universal-diagnosis or compatibility claims.
      Verify: Re-run the official submission checklist before making the repository public.

- [x] **19. Add purchase handoff and washer-format visuals**
      Spec ref: prd.md > Seller handoff and topology addendum
      What to build: Surface an exact seller product listing with dated price and availability evidence, preserve external human-controlled checkout, add two source-backed top-load families, and select a mechanically constrained front-load or top-load topology orientation from the repair pack.
      Acceptance: The LG exact-part path shows a working seller destination; top-load models show the correct topology orientation and omit unsupported filter checks; WebMCP and human actions reveal the same state.
      Verify: Unit and UI tests cover seller metadata, outbound link, top-load pack shape, and asset switching; production build and visual browser checks pass.
