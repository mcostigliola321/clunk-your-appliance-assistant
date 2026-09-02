# Clunk — final Devpost copy

## One-line summary

Tell Clunk what broke. A person and browser agent check the same visual appliance together, then Clunk shows the exact part and seller link when the evidence supports one.

## Final project description

Appliance troubleshooting crosses a physical boundary. A browser agent can organize model data, sources, and next steps, but it cannot read the rating label in a laundry room or see a cracked door catch, blocked filter, leak, smoke, or unsafe access. People are left translating between search results, manuals, videos, parts stores, and chat messages—often while compatibility and safety claims blur together.

Clunk is an open-source visual repair guide for washers, dishwashers, electric dryers, and refrigerators. It gives the person beside the appliance and a compatible browser agent one shared, visible repair state. The agent handles structured lookup and navigation. The person supplies every physical observation. Clunk’s deterministic engine enforces sequence, model/problem coverage, exact-fit evidence, and terminal safety stops.

The experience begins with four recognizable appliance choices and plain descriptions of what is happening. Clunk then helps the person find the complete model number, including common rating-label locations and the difference between Model/Model No./E-Nr and Serial/S/N. Search is punctuation- and case-insensitive, preserves ambiguous suffixes, and refuses to turn a partial family code or nearby model into an exact compatibility claim.

Once a supported model and problem are selected, Clunk highlights one physical location at a time and asks one bounded question. The possible outcomes are intentionally honest: no part is needed; more model detail is required; the observations support an exact source-backed part; or the visible checks are over and a qualified professional should continue. Smoke, a burning smell, heat, an active leak near power, damaged access, or unsafe reach removes the purchase path and ends the flow.

WebMCP is the collaboration layer. All eight in-page tools are discoverable from page load: catalog search, exact selection, state reading, diagnosis start, component focus, person-supplied observation recording, part resolution, and safe escalation. Each result includes `nextTools`, the authoritative list of actions that are valid for the current phase. The shared engine independently rejects invented IDs, unsupported model/problem pairs, out-of-order observations, premature part lookup, and post-terminal advancement. The visible page mirrors every accepted or rejected action, so the agent’s work is inspectable instead of hidden in a separate chat transcript.

The key handoff is concrete. For GE dryer `GTD42EASJ2WW`, the agent can search and select the exact model, start the door-closure guide, and focus the visible door strike. It must then wait for the person to confirm that the unplugged dryer is safe and report what the strike looks like. Only after the person reports the damaged strike does `find_compatible_part` become valid, resolving to GE part `WE01M10007`. If the person reports smoke or a burning smell instead, Clunk enters a terminal stop and exposes no part or seller route.

Compatibility and commerce remain separate. Manufacturer or authorized-parts evidence maps one complete appliance code to one exact SKU. Only then does Clunk ask Shopify Global Catalog over UCP for current listings containing that exact part number. Nearby SKUs and unavailable results are rejected, seller “OEM” or “compatible” language remains a seller claim, and checkout stays on the merchant’s site. A catalog failure cannot weaken or rewrite Clunk’s fit decision.

The release catalog contains 163 source-backed U.S. appliance identities across 11 brands: 56 washers, 33 dishwashers, 33 electric dryers, and 41 refrigerators. All 782 possible model × problem pairs are classified. There are 766 supported pairs and 16 explicit stops where the current evidence does not justify a guide. Eighty-four complete model revisions have at least one exact-part route. The illustrations are original location guides, not model-specific service diagrams.

Clunk is static React, TypeScript, CSS, JSON, local fonts, and original visuals. It needs no account, database, private key, payment handling, or app-side model call. Browsers without WebMCP retain the complete manual journey, and a separate stateless remote MCP endpoint offers five bounded read-only catalog and diagnosis tools for clients that cannot operate the visible page session.

Judges can replay every outcome without credentials. **See a finished guide** runs clearly labeled observations through the same public action layer, while the live inspector shows the source-labeled activity trail and currently valid actions. Deterministic fixtures and browser tests cover the contracts, responsive layouts, keyboard and touch access, reduced motion, exact-code handling, nearby-SKU rejection, no-part answers, and safety stops. Those fixtures verify the product’s rules; they are not presented as autonomous-agent scores.

The larger pattern extends beyond appliances: agents are good at structured evidence and process state; people remain essential where software cannot observe the physical world. WebMCP lets both collaborate through the real product interface while the site keeps its own rules in force.

## Testing instructions

1. Open https://clunk.repair and choose **Electric dryer → Door won’t close**.
2. Enter `GTD42EASJ2WW`, select the exact result, and confirm the page stops at the person-only safety observation.
3. For the fastest complete proof, return home, open **See a finished guide**, and choose the dryer example. Confirm `WE01M10007`, the exact-model boundary, current exact-SKU Shopify listings, and the external **View offer** links.
4. Open **One guide. Two ways to use it.** and the live WebMCP inspector. Confirm the page shows the current valid actions and an accepted/rejected activity trail while all eight literal tools remain discoverable to a compatible client.
5. Start the real dryer flow again and report **Smoke or burning smell** to confirm the terminal stop has no part or purchase path.

With WebMCP testing enabled in a compatible browser, use:

> My electric dryer is GE GTD42EASJ2WW and the door will not stay closed. Select that exact model, show me where to inspect, and ask me for every physical observation. Do not infer what I see or offer a part until Clunk allows part lookup.

## Eligibility note

Clunk was created during the submission period on August 26, 2026. The public repository was created that day. An imported framework scaffold retains an August 20 template commit timestamp; all Clunk product, WebMCP, catalog, design, evidence, and testing work was completed during the submission period.

## Agent/client testing statement

On September 2, 2026, Codex’s in-app browser discovered all eight live in-page WebMCP tools at `https://clunk.repair` and directly executed `get_repair_state`, `search_supported_appliances`, `select_appliance`, and `start_diagnosis`. The visible page advanced to the GE dryer safety step with `record_observation` in `nextTools`. This was a client/tool integration check, not a completed autonomous natural-language-agent evaluation. A connected Chrome profile without WebMCP testing enabled is not counted as a passing client.

## Links

- Live app: https://clunk.repair
- Public repository: https://github.com/mcostigliola321/clunk-your-appliance-assistant
- Current public video: https://youtu.be/hUHGxR0iRR8
- License: MIT
