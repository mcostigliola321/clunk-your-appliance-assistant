# Final demo capture package

Target length: **2:20–2:35**. Hard limit: **under 3:00**.

Primary proof: a real compatible browser agent discovers/calls Clunk’s live WebMCP tools while the visible page changes.

Capture URL: `https://clunk.repair` in a fresh session at desktop width, with one short mobile proof near the close.

The current public 2:28 video is public, has audio, and visibly changes between the exact result, safety step, activity/inspector, and terminal-stop states. However, its narration incorrectly says tools are registered only when valid, and it does not clearly frame a real client discovering and calling the stable eight-tool inventory. Replace it before final submission if possible; do not edit or replace the YouTube upload without Mark’s explicit approval.

## Capture setup

1. Use a browser/client with WebMCP testing enabled. Do not use the connected Chrome profile unless the tool inventory is visibly confirmed in that exact session.
2. Open a fresh conversation and fresh `https://clunk.repair` session. Keep the agent panel and page visible together whenever a tool is called.
3. Warm the home screen once so the four appliance thumbnails are loaded, then reset both the page and agent conversation.
4. Record 1440×900 or larger, 30 fps, with cursor emphasis off. Keep page zoom at 100% and notifications hidden.
5. Capture clean system audio/voiceover. Do not claim a physical observation until Mark speaks or types the scripted reply.

## Exact agent prompt and human replies

Agent prompt:

> My electric dryer is GE GTD42EASJ2WW and the door will not stay closed. Use Clunk to select that exact model, show me where to inspect, and ask me for every physical observation. Do not infer what I see or offer a part until Clunk allows part lookup.

Reply only when asked:

1. “The dryer is unplugged, the drum is still, and there is no smoke, burning smell, heat, leak, or damaged cord.”
2. “The visible door strike is cracked and missing a corner.”

Safety prompt in a new/reset session:

> I smell burning and see smoke at the same dryer. Stop safely. Do not look up or recommend a part.

## Time-coded shot list and voiceover

| Time      | Picture / required proof                                                                                                                                 | Voiceover                                                                                                                                                                             |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:10 | Open on the live exact result: highlighted door strike, `WE01M10007`, exact-model fit, and Shopify seller rows.                                          | “This is Clunk’s answer for one exact dryer: the visible location, the source-backed part that fits, and current seller links—without letting the store decide compatibility.”        |
| 0:10–0:22 | Reset to the four-appliance home. Keep the first-viewport WebMCP/person sentence visible.                                                                | “Appliance troubleshooting crosses a physical boundary. Software can organize evidence; only the person beside the machine can report what is actually there.”                        |
| 0:22–0:38 | Show the agent’s discovered inventory with all eight names visible in the client. Then show the page inspector’s current valid-action count.             | “All eight WebMCP tools are discoverable from page load. Each response returns `nextTools`, while Clunk’s engine rejects actions that are not valid for the current state.”           |
| 0:38–0:56 | Paste the exact prompt. Capture `search_supported_appliances`, `select_appliance`, `start_diagnosis`, and the page changing to the GE dryer safety step. | “The agent searches the bounded catalog, selects the returned identity, and starts the door-closure guide. The same calls update the page the homeowner sees.”                        |
| 0:56–1:13 | Hold on **Your turn** / safety question. Type reply 1 only after the agent asks. Capture `record_observation` with the exact current IDs.                | “Now the browser has to stop. It cannot know whether the dryer is unplugged or whether smoke, heat, or a leak is present. I supply that observation.”                                 |
| 1:13–1:31 | Capture `show_component`, highlighted door strike, the second question, reply 2, and the second `record_observation`.                                    | “Clunk points both of us to the same visible strike. I report the damage; the agent does not invent it.”                                                                              |
| 1:31–1:48 | Show `nextTools` changing from observation to part lookup, then `find_compatible_part` and the exact result.                                             | “Only after the report does part lookup become valid. Clunk resolves GE `WE01M10007`; Shopify only answers where that exact SKU is currently listed.”                                 |
| 1:48–2:05 | Reset; paste the safety prompt; show terminal stop, locked progression, and absence of offers.                                                           | “The same system knows when not to sell. Smoke or a burning smell ends the guide, removes the buying path, and refuses further diagnosis.”                                            |
| 2:05–2:20 | Quick mobile view, repository/verification frame, then Clunk wordmark.                                                                                   | “Clunk covers 163 source-backed identities and 782 model-problem pairs, works manually without WebMCP, and ships as a credential-free open-source app. One guide, operated together.” |

## Editing and truth checklist

- Show the client’s literal discovered inventory; do not substitute the page inspector for client discovery.
- Keep the agent panel visible for every claimed agent call.
- Show at least one visible page change caused by a WebMCP call.
- Use the two human replies only after the agent asks. Do not prefill or silently script them in the primary proof.
- Say **all eight tools are discoverable** and **`nextTools` identifies valid actions**. Never say the registration set changes.
- Do not call Shopify evidence of fit, promise stock/price, call the result a confirmed diagnosis, or call the artwork a service diagram.
- Do not count the current connected Chrome profile as tested unless its WebMCP inventory is visibly present during this recording.
- End at 2:35 or earlier and verify audio, captions, 1080p playback, public visibility, and a fresh incognito watch before replacing the current URL.
