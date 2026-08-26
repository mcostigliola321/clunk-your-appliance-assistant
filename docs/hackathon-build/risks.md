# Risk Register

## R1 — WebMCP API changes

- Probability: Medium
- Impact: High
- Risk: The draft API is moving quickly; outdated navigator.modelContext or unregisterTool patterns could fail in Chrome 149 or ChatGPT.
- Mitigation: Use document.modelContext, literal imperative registerTool calls, AbortController-owned registration, minimal local types, and feature detection. Avoid obsolete provideContext and clearContext APIs.
- Verification: Run the registry tests, inspect eight discovered tools in both target browsers, and compare against current Chrome and Community Group primary documentation.

## R2 — Lovable preview hides tools

- Probability: High
- Impact: Medium
- Risk: The editor preview is embedded and may not delegate the tools permission.
- Mitigation: Treat the published lovable.app top-level URL as the test surface. Do not debug protocol behavior exclusively in the editor iframe.
- Verification: Open the production URL directly and confirm document.modelContext plus tool discovery.

## R3 — GitHub is not connected early

- Probability: Medium
- Impact: High
- Risk: Local implementation could diverge from Lovable because Lovable cannot import an existing repository.
- Mitigation: Create the Lovable project before application code, connect GitHub immediately, then attach this workspace to the generated remote. Make the repository canonical after connection.
- Verification: Confirm remote URL, default branch, pushed planning docs, and Lovable reflecting repository commits.

## R4 — Tool result races React rendering

- Probability: Medium
- Impact: High
- Risk: A WebMCP callback could return stale state immediately after dispatch.
- Mitigation: Execute pure transitions synchronously against a state ref, then dispatch the accepted next state to React. Serialize the same next state for the tool response.
- Verification: Tests assert that returned state equals the next rendered state.

## R5 — Manual mode diverges from WebMCP

- Probability: Medium
- Impact: High
- Risk: Judges could see two implementations with subtly different behavior.
- Mitigation: Manual controls call invokeTool directly and never dispatch domain events on their own.
- Verification: Parameterized tests execute canonical paths through human, manual, and WebMCP adapters and compare state snapshots.

## R6 — Unsafe appliance guidance

- Probability: Low
- Impact: Critical
- Risk: Generated content or pack data could expose hazardous instructions.
- Mitigation: No generated runtime content. Deny-list hazardous capability tags, validate pack invariants, gate filter access on disconnected power, escalate hazard observations, and omit internal repair instructions.
- Verification: Safety tests cover every forbidden tag and hazard result; copy review checks stop conditions.

## R7 — Fictional data appears real

- Probability: Medium
- Impact: High
- Risk: A user could treat the demo SKU or diagnosis as real compatibility guidance.
- Mitigation: Persistent fictional-model badge, disclaimer in every part result and tool result, original model naming, no purchase links, and no real brand references.
- Verification: Text assertions and manual review at all breakpoints.

## R8 — Eight tools feel redundant

- Probability: Medium
- Impact: Medium
- Risk: Judges may see tool sprawl rather than a clear action surface.
- Mitigation: Give each tool one responsibility, bound every schema, use read-only get_repair_state, and explain the demo sequence in the inspector.
- Verification: Eval fixtures map each prompt to one expected tool or a short unambiguous sequence.

## R9 — Five-second promise is lost in dashboard density

- Probability: Medium
- Impact: High
- Risk: Diagram, causes, progress, parts, safety, and logs could compete at once.
- Mitigation: Start state shows only promise, model, symptom, diagram, and one action. Progressive disclosure reveals causes and parts. Next safe check remains the strongest action surface.
- Verification: Screenshot review at 1440px and 390px; ask whether purpose and next action are apparent without scrolling.

## R10 — Accessibility regressions in SVG and status changes

- Probability: Medium
- Impact: High
- Risk: Custom diagram interaction and agent-driven changes may be invisible to keyboard and screen-reader users.
- Mitigation: Real buttons or focusable groups with names, persistent text labels, non-color emphasis, live-region announcements, focus management, and reduced-motion styles.
- Verification: Keyboard smoke path, automated accessibility scan if available, contrast checks, zoom to 200%, and screen-reader-friendly DOM inspection.

## R11 — Deployment requires credentials or network services

- Probability: Low
- Impact: Critical
- Risk: Judges cannot use the app or runtime costs appear.
- Mitigation: Static build, local repair pack, no API calls, no database, no auth, and no environment variables.
- Verification: Incognito load, network inspection, and build output audit.

## R12 — Submission assets lag behind the build

- Probability: Medium
- Impact: High
- Risk: A working project could miss the public repo, visible license, live link, description, or video deadline.
- Mitigation: Keep submission proof points in the build checklist, capture screenshots during verification, draft the video beat sheet early, and target September 2.
- Verification: Final checklist against live Devpost requirements; freeze after the official deadline.
