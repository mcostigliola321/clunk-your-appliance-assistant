# Product Requirements Document

## Product Summary

Clunk is a single-page, static WebMCP product that helps a person and a browser agent work through one fictional “washer will not drain” diagnosis together. The UI is the shared source of truth. Human actions and agent tool calls must produce the same visible state transitions.

The product is educational demonstration software. It does not diagnose or claim compatibility with any real appliance.

## Target User

### Primary user

A person standing near a broken household appliance who wants a calm answer to three questions:

1. What should I check next?
2. What evidence makes one cause more likely?
3. If a part is implicated, which exact part fits this fictional model?

### Judge

A hackathon evaluator who needs to see a non-trivial, working WebMCP implementation without credentials, setup, or prior knowledge of appliance repair.

## Experience Principles

- Lead with the appliance and next action, not explanatory copy.
- Keep state visible: progress, highlighted component, observations, causes, and tool calls.
- Use plain language first and component terminology second.
- Explain uncertainty; never present a cause as confirmed without the required evidence.
- Put deterministic safety checks before all diagnostic instructions.
- Keep the fictional-demo boundary persistent, not buried in a footer.

## Core User Journey

### First load

The user sees:

- Clunk and the five-second pitch.
- Demo appliance · Clunk WM-01 and Fictional model labeling.
- A large original washing-machine diagram.
- The selected symptom, “Will not drain.”
- A single dominant action: Start diagnosis.
- A compact message explaining that a browser agent can operate the same bench through WebMCP and that manual demo mode is always available.

### Diagnosis

Starting the diagnosis moves the product into a guided sequence. The next safe check is prominent. The relevant component is highlighted on the diagram and announced to assistive technology. The user records one of the supported observations.

### Evidence and result

Each recorded result changes the diagnostic evidence. Likely causes re-rank with a short “because” explanation. Clunk advances only along valid transitions. Once a cause has sufficient evidence, Clunk reveals a compatible fictional part or an escalation.

### Reset and alternate path

The user can reset the demo at any time. Manual judge mode exposes the same tool names and sample arguments, allowing each tool to be invoked without an agent.

## Epics And User Stories

### Epic 1: Understand Clunk immediately

- As a first-time visitor, I want to understand the appliance, symptom, and product promise immediately so that I know what to do.

Acceptance criteria:

- At 1440px, 1024px, 768px, and 390px widths, the name, fictional model, symptom, appliance visual, and start action are visible without ambiguity.
- The page does not require a login, API key, modal, tutorial, or chat input.
- “Fictional demo model” appears in the primary workspace and all part results.
- The first dominant action is Start diagnosis.

### Epic 2: Share one repair state

- As a person working with an agent, I want every action to update the same repair state so that the UI never disagrees with the conversation.

Acceptance criteria:

- Human buttons and WebMCP tool callbacks dispatch through one public action layer.
- Progress, current step, highlighted component, observations, ranked causes, part result, and activity log derive from the same state.
- State queries return a serializable snapshot that matches what is visible.
- A reset returns the product to the exact documented initial state.

### Epic 3: Inspect the appliance visually

- As a non-expert, I want the relevant part highlighted on an exploded view so that unfamiliar terminology maps to something visible.

Acceptance criteria:

- The diagram includes at least the drum, sump, pump filter, drain pump, drain hose, and control module.
- Every component is keyboard focusable and has an accessible name and short explanation.
- The current component uses color, stroke, label, and motion-independent emphasis.
- Selecting a component manually records the same highlight action as highlight_component.
- Reduced-motion mode removes animated separation or pulsing while preserving emphasis.

### Epic 4: Record physical observations safely

- As the person near the washer, I want to report simple observations so that the agent can use evidence it cannot see.

Acceptance criteria:

- Supported checks use bounded result options; no free text is required for the main path.
- A safety preparation must be acknowledged before filter access is shown.
- Results that indicate heat, burning smell, electrical fault, active leak near power, or an unsupported internal procedure immediately escalate.
- Invalid, out-of-order, or contradictory results return a safe error and do not mutate diagnosis state.
- Safety copy uses imperative, plain language and includes a stop condition.

### Epic 5: See likely causes and what changed

- As a user, I want causes to re-rank after each observation so that I understand how the diagnosis is narrowing.

Acceptance criteria:

- Likely causes always show a label, confidence band (possible, likely, or strong match), and evidence explanation.
- No percentage implies calibrated real-world probability.
- A clear hose result reduces the kinked-hose cause.
- A blocked-filter result promotes the blocked-filter cause to the strongest match.
- A clear hose and clear filter promote drain-pump failure while requiring professional service for replacement.

### Epic 6: Find the exact fictional part

- As a user, I want a precise part result for the demo model so that the value of structured compatibility is obvious.

Acceptance criteria:

- Part lookup requires the identified fictional model and implicated component.
- The result shows part name, fictional SKU, compatible model, illustrative effort and cost band, and install boundary.
- The blocked-filter path returns CL-PF-220.
- A pump result returns CL-DP-420 and labels installation professional-only.
- Every result says it is fictional demonstration data and cannot be used for a real purchase.

### Epic 7: Understand repair versus replace context

- As a user, I want concise context around effort and escalation so that the result is more useful than a part number.

Acceptance criteria:

- The final view compares low-effort user-cleanable issues, professional part replacement, and replacement context using illustrative ranges.
- No real currency, savings promise, environmental claim, or appliance-lifespan claim is presented as factual.
- Hazardous or unsupported paths favor professional escalation.

### Epic 8: Let a browser agent operate Clunk

- As a browser agent, I want a small set of unambiguous WebMCP tools so that I can reason with the user and manipulate the shared repair state reliably.

Acceptance criteria:

- Source code contains literal document.modelContext.registerTool({ registrations.
- Tools have unique names, explicit descriptions, bounded JSON Schemas, required fields, and additionalProperties set to false.
- Registration is feature-detected and owned by an AbortController.
- Tool callbacks return structured and text results and use the same action layer as manual UI controls.
- The app functions fully when document.modelContext does not exist.
- Tool availability status is visible.

### Epic 9: Inspect and demo the protocol

- As a judge, I want to see tools and calls in the product so that I can verify the WebMCP work quickly.

Acceptance criteria:

- The activity log distinguishes agent, human, manual demo, and system events.
- Each event includes time, tool or action name, concise arguments, and outcome.
- A tool inspector lists every registered tool with its purpose and sample input.
- Manual demo mode can invoke each mutating tool through the same public action layer.
- The inspector does not expose internal reasoning or hidden data.

### Epic 10: Recover from unsupported states

- As a user, I want clear recovery when an action is unavailable so that the demo never dead-ends.

Acceptance criteria:

- Unsupported browsers show “WebMCP unavailable · Manual demo ready.”
- Invalid agent calls return a helpful result and add a non-alarming rejected event to the log.
- Reset is always available and keyboard accessible.
- A top-level error boundary provides a reload or reset action without losing the safety disclaimer.

## Edge Cases

- WebMCP is undefined, registration rejects, or only some tools register.
- The agent invokes a tool before the appliance is identified or diagnosis started.
- The agent sends an unknown enum value or an extra property.
- The user clicks a later check before acknowledging preparation.
- The user records a new result for an already-completed check.
- The user changes a result after downstream evidence exists; downstream state must be recomputed or explicitly reset.
- The user selects a component unrelated to the current step; highlighting changes but diagnostic progress does not.
- The viewport is narrow or zoomed to 200%.
- Reduced motion and high-contrast preferences are active.
- Local date or time formatting is unavailable; activity order remains readable.
- A tool is invoked while another action is processing; actions are synchronous and serialized.

## What We Are Building

The MVP includes all ten epics for a single deterministic scenario and no persistent backend.

## What We Would Add With More Time

- Additional fictional models and symptom packs loaded through the documented extension schema.
- Authoring and validation tools for community-contributed repair packs.
- Local-only session persistence and shareable diagnostic summaries.
- Localization and reading-level variants.
- More sophisticated deterministic evidence explanations.
- Additional WebMCP declarative-form experiments after the imperative API is stable.

## Submission Proof Points

- Literal WebMCP registration visible in source.
- Eight tools, each mapped to one user-visible product behavior.
- One state reducer shared by agent and human actions.
- No LLM or API credential in the app.
- A safety policy that blocks hazardous instructions in code and tests.
- Manual judge mode proving the experience without WebMCP.
- Original diagram, fictional model, fictional parts, and explicit extension schema.
- Deterministic test suite and eval fixtures.
- Live Lovable URL, public GitHub repository, visible license, and sub-three-minute narrated demo.
