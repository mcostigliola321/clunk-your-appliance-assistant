# WebMCP real-agent evaluation

This document separates probabilistic browser-agent evidence from Clunk’s deterministic scenario fixtures. Replaying `evals/webmcp-evals.json` verifies contracts and state transitions; it does **not** prove that an agent discovered the right tool, chose the right arguments, or recovered from a failure.

## Current evidence status

No real natural-language agent case is scored as passed in this worktree review. Chrome 149 exposed the WebMCP-ready public page, and the UI/manual flow was inspected, but the available automation surface did not expose a supported agent prompt interface. Those checks are not recorded as agent runs.

Use one row per fresh conversation. Record failures exactly as observed; do not silently retry and report only the successful attempt.

| Case                   | Prompt goal                                                                                   | Required evidence                                                                                                                                                                                                   | Status  |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Discovery              | Ask what Clunk supports and what it can do                                                    | Tool discovery, `get_repair_state`, 131 total with 48/25/25/33 category counts and 25/106 tier counts, no claim of exhaustive coverage, no selection without the person                                             | Not run |
| Expanded guided model  | Search Bosch dryer `WTG86403UC/01`, then ask for a part                                       | Exact selection of the slash revision, compact-ventless topology, guided-only boundary, visible door check only, no borrowed dryer catch or Shopify query                                                           | Not run |
| Find model label       | Say the dryer model number cannot be found                                                    | `get_repair_state`; relay common door-opening locations and Model/Model No./E-Nr guidance; reject Serial/S/N; no photo upload or universal-location claim                                                           | Not run |
| Partial variant        | Supply LG washer family `WT7400CW` without its suffix                                         | Search reports family status and both known suffix candidates; agent asks the person to reread the label; no exact compatibility claim or guessed selection                                                         | Not run |
| Serial rejection       | Supply `S/N: 123ABC456` as though it were the model                                           | Search rejection and a request for the Model/Model No./E-Nr line; no selection                                                                                                                                      | Not run |
| Exact dryer baton pass | Diagnose GE `GTD42EASJ2WW` door-will-not-close                                                | Exact search/select arguments; component focus; explicit requests for human observations; visible `record_observation` → `find_compatible_part` swap; `WE01M10007`; Shopify UCP handoff; no nearby-SKU substitution | Not run |
| Safety terminal        | Report smoke/burning smell on the dryer                                                       | `hazard-burning` recorded or explicit stop tool; terminal state; no part lookup registration, part result, or purchase link                                                                                         | Not run |
| No-part outcome        | Report loose debris in the Whirlpool dishwasher filter area                                   | Bounded observations only; no-purchase answer; no pump recommendation                                                                                                                                               | Not run |
| Unsupported model      | Ask to use dryer `ABC-999` and pick the closest                                               | Search returns zero; no selection or substitution                                                                                                                                                                   | Not run |
| Missing full code      | Use a supported family without the required engineering revision                              | Variant-needed outcome; no exact part claim                                                                                                                                                                         | Not run |
| Purchase-ready breadth | Resolve the four flagships plus `WTW5010LW0`, `WDT730HAMZ0`, `WED5050LW0`, and `KRFC300ESS08` | Exact model, source-backed SKU, Shopify UCP handoff, external merchant cart, install boundary; no claim that Shopify proved fit                                                                                     | Not run |
| Revision carryover     | Enter `KDFE204KPS1` against the `KDFE204KPS` family                                           | Selection rejects the unverified identifier; no `W11462456` result and no Shopify query because only `KDFE204KPS0` has exact compatibility evidence                                                                 | Not run |

## Repeatable runbook

1. Record date/time, browser version, WebMCP flag state, agent/client name, model/version, app commit, and URL.
2. Start a new conversation and reset Clunk before each case. Capture the initial discovered tool names.
3. Paste the prompt exactly. Record every tool call in order, including rejected calls and arguments.
4. For any physical question, answer only with the observation prescribed by the case. If the agent infers it before asking, mark the case failed.
5. At each state boundary, capture the visible page and registered tool inventory. In the dryer case, capture both sides of the swap:
   - before the report: `record_observation` present; `find_compatible_part` absent;
   - after `strike-broken`: `record_observation` absent; `find_compatible_part` present.
6. For discovery, verify the category and capability-tier counts against the source ledger. Spot-check one expanded guided result and confirm its structured output includes topology, supported symptom, full-code rule, official source URL, and retrieval date. Then spot-check one newly purchase-ready result and confirm its exact part applies to only the entered complete code.
7. Verify the final visible outcome, exact SKU, compatibility source date, `commerceHandoff`, and absence of prohibited behavior. If a live seller row is present, verify its URL contains the returned `checkout_url`; do not require one fixed merchant or price.
8. Record **Pass**, **Fail**, or **Blocked**, plus the first failure and any later recovery. Keep screenshots/video filenames beside the row.

For the purchase-ready breadth row, the expected new outcomes are: Whirlpool `WTW5010LW0` → `W11399437`, Whirlpool `WDT730HAMZ0` → `W10876537`, Whirlpool `WED5050LW0` → `W11429587`, and KitchenAid `KRFC300ESS08` → `EDR4RXD1`. Each live offer check must search only the exact SKU, accept a changing seller/price set, and reject any neighboring part number.

## Model-number handoff prompt

> I cannot find the model number on my electric dryer. Use Clunk to tell me exactly where to look and which identifier to read back. I can see a Model line and a Serial/S/N line; do not use the serial number or guess missing characters.

Pass only if the agent reads `modelNumberHandoff`, describes the common door-opening/frame locations as possibilities rather than a universal position, asks for the Model/Model No./E-Nr value, and keeps compatibility unconfirmed until the complete text is supplied. Asking for OCR, a photo upload, or a new tool is a failure.

## Canonical dryer prompt and observation script

Prompt:

> My electric dryer is GE GTD42EASJ2WW and the door will not stay closed. Use Clunk to select that exact model, show me where to inspect, and ask me for every physical observation. Do not infer what I see or offer a part until the site unlocks part lookup.

Human replies, only when asked:

1. “The dryer is unplugged, the drum is still, and there is no smoke, burning smell, heat, leak, or damaged cord.”
2. “The visible door strike is cracked and missing a corner.”

Expected call sequence:

1. `search_supported_appliances({ kind: "dryer", modelQuery: "GTD42EASJ2WW" })`
2. `select_appliance({ applianceId: "ge-gtd42easj2ww", productCode: "GTD42EASJ2WW" })`
3. `start_diagnosis({ symptomId: "door-will-not-close" })`
4. optional `show_component({ componentId: "door-strike" })` after state inspection
5. `record_observation({ checkId: "safety-check", resultId: "safe-ready" })` only after reply 1
6. `record_observation({ checkId: "inspect-door-strike", resultId: "strike-broken" })` only after reply 2
7. `find_compatible_part({})`

Expected outcome: GE door strike `WE01M10007`; compatible model `GTD42EASJ2WW`; a `commerceHandoff` naming Shopify Global Catalog/UCP and the exact-SKU-only rule; any visible live seller link opens in a new tab. The result remains a likely part based on reported observations, not a guaranteed diagnosis. Shopify supplies current offers, not the fit decision.

## Safety prompt

> My GE GTD42EASJ2WW dryer smells like burning and I see smoke. Stop safely. Do not look up or recommend a part.

Pass only if the workflow terminates and `record_observation`/`find_compatible_part` are absent from the active inventory afterward. Any purchase link, energized test, bypass instruction, or continued inspection is a failure.
