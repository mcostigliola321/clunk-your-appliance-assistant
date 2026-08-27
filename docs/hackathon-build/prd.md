# Product requirements document

## Product summary

Clunk is a static WebMCP application for visually diagnosing a bounded appliance problem with a person. The browser agent supplies structured reasoning and tool sequencing; the person beside the appliance supplies the model label and physical observations. Both operate one visible repair state.

The primary promise is concrete: **problem → physical location → exact part → seller link**. If the evidence does not support a part, Clunk must say so plainly.

## Users

- **Homeowner:** stressed, non-technical, beside a broken appliance, and looking for a useful next action rather than repair jargon.
- **Judge:** needs a credential-free proof of meaningful WebMCP leverage, coherent execution, impact, and ambition in under three minutes.
- **Browser agent:** needs a small, bounded action surface with explicit current state, enums, and safety stops.

## Experience principles

- Make the outcome understandable in five seconds.
- Use everyday language; put protocol detail behind **Agent activity**.
- Show the physical location and the answer together.
- Never present a general illustration as an exact service diagram.
- Never call likelihood a confirmed diagnosis.
- Make evidence depth visible before model selection: **Purchase-ready**, **Verified part unavailable**, or **Guided checks only**.
- Keep checkout human-controlled on the seller’s site.
- Make safety deterministic and independent of agent reasoning.

## Required journeys

### Instant example

1. User picks an appliance category.
2. The category shows one purchase-ready real flagship and the supported problem.
3. **See the full answer** replays select, start, observations, and part resolution through the shared action layer.
4. The result is explicitly labeled **Example answer** and lists the prefilled observation summary.
5. The page simultaneously shows the highlighted location, exact part/SKU, compatible full model, price/availability snapshot, seller, and **Buy this part** link.

Acceptance:

- Exactly one click from the home state reaches the seller link.
- Every replayed activity is visible and tagged `example`.
- The example never implies the participant personally supplied those observations.

### Diagnose mine

1. User selects category, searches a complete model number, and chooses an exact returned model.
2. Purchase-ready models require the complete verified code; guided-only models disclose their limit before checks begin.
3. Clunk shows one safety or observation step and one highlighted location at a time.
4. User chooses a bounded plain-language result.
5. Terminal outcomes are no part needed, exact part, complete code required, or professional service.

Acceptance:

- Invalid order, unknown IDs, extra schema properties, and unsupported model searches cannot advance state.
- Human, agent, manual-inspector, and example calls produce equivalent state transitions.
- A part is exact only after complete-code comparison against source-backed compatibility data.

### Safety stop

Smoke, burning smell, heat, active leak near power, unsafe reach, mismatched access, damaged filter housing, exposed sharp debris, protection bypass, or an unresolved internal check ends at professional service.

Acceptance:

- The terminal state removes observation and part-resolution tools.
- No gas, energized, high-voltage, refrigerant, sealed-system, protection-bypass, wiring, control-board, or panel-removal instruction can appear in a pack.

## Category requirements

| Category | Flagship symptom | Required visible checks | Exact outcome |
| --- | --- | --- | --- |
| Washer | Will not drain | Safe state, outside hose, documented lower filter | LG AHA75693425 pump; professional installation |
| Dishwasher | Will not drain | Cool/off, under-sink drain, user filter/sump | Whirlpool W11412291 pump; professional installation |
| Electric dryer | Door will not stay closed | Unplugged, visible door strike | GE WE01M10007 strike; user-replaceable boundary |
| Refrigerator | Slow dispenser flow | No active leak, filter age/status | GE XWFE filter; user-replaceable boundary |

## WebMCP requirements

The app contains these eight literal registrations and no redundant category-specific copies:

1. `search_supported_appliances`
2. `select_appliance`
3. `get_repair_state`
4. `start_diagnosis`
5. `show_component`
6. `record_observation`
7. `find_compatible_part`
8. `stop_and_escalate`

Tool schemas are pack-derived, bounded, and `additionalProperties: false`. Registration is feature-detected, state-dependent, and lifecycle-owned by an `AbortController`. Structured tool output mirrors the visible snapshot.

## Accessibility and responsive requirements

- Full keyboard path and obvious focus state.
- Minimum 44×44px visible button targets on mobile.
- Text/non-color component focus label.
- Reflow without horizontal overflow at 320px and 200% zoom.
- Reduced-motion mode removes meaningful translations/animation duration.
- Automated WCAG A/AA scan passes in the final result state.
- Accurate alt text identifies the generalized location guide, not the exact named model.

## Evidence and content requirements

- Each model has an official manufacturer page and verification date.
- Each check references one or more pack sources.
- Exact parts require a manufacturer or authorized-parts source plus complete compatible code.
- Seller handoffs use HTTPS and record seller, URL, dated price, dated availability, and last verification date.
- Customer copy calls price/stock a snapshot and requires final confirmation on the seller page.

## Submission proof

- Public GitHub repository and MIT license.
- Static live Lovable URL with no credentials.
- Literal registration source and visible tool inspector.
- Current README, source ledger, schema, safety policy, eval fixtures, and demo script.
- Under-three-minute video covering one instant answer, agent activity, a real human observation, and a safety boundary.
