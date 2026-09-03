# Homepage demo release

Published **2026-09-03, before the 20:00 UTC submission deadline** (September 2 local).

## Scope

The approved `9eQbt7B8rQs` video is now available through **Watch the 2:30 demo** inside **One guide. Two ways to use it.** The appliance-first homepage remains unchanged. YouTube loads only after an explicit click; autoplay is disabled; the direct YouTube fallback is available; closing the player or parent explanation unmounts the iframe. The player fits small screens without cropping the corrected thumbnail.

No Devpost field, YouTube asset/metadata, repair rule, catalog entry, WebMCP contract, dependency, or unpublished deferred-focus correction was changed.

## Source and publication

- Implementation: `3377033517fe19d8f2088a2da9d5d94ac9b4e8f9`.
- [PR #4](https://github.com/mcostigliola321/clunk-your-appliance-assistant/pull/4), merged without rewriting history as `b2da7a8ec1a089b8ebfa3efb25052f56fdb66569` at 02:42:05 UTC.
- Lovable project: `4d536d43-a124-405a-b657-8f125b15b695`.
- Deployment: `c1a042c3-180a-4e69-be29-d2d726966cdf`, public at https://clunk.repair.
- The following documentation/test-only handoff changes no production asset and does not require a second application deployment.

## Verification

- Full local gate: TypeScript, lint, **119 unit/integration/WebMCP tests**, build, **60 desktop/mobile browser cases**, and generated MCP drift passed. Both deterministic evidence audits, formatting, whitespace checks, and the zero-vulnerability dependency audit passed.
- [PR CI](https://github.com/mcostigliola321/clunk-your-appliance-assistant/actions/runs/33708315322) and [main CI](https://github.com/mcostigliola321/clunk-your-appliance-assistant/actions/runs/33708615621) passed.
- A post-publication parallel run exposed a pre-existing test-helper race: `isVisible()` sampled **Start the checks** before React rendered it, then waited for a safety heading without clicking Start. The failure snapshot showed the app correctly awaiting Start. The unchanged test passed in isolation; the helper now explicitly awaits Start or the safety heading. All 60 cases and the complete gate passed after this test-only correction. No product logic was changed or test assertion removed.
- New cases cover zero iframe requests before explicit opening, correct video ID, no autoplay, keyboard focus, the direct fallback with a blocked player, nested-inspector independence, outer-close cleanup, accessibility, 44px controls, and 320px overflow/minimum player height.
- Actual YouTube playback was checked separately from the automated fixture: local playback advanced beyond 15 seconds; live playback advanced beyond 4 seconds with `readyState=4`, `paused=false`, no media error, and English captions available/on.
- Local desktop/320px and live desktop/390px visuals were reviewed. The inset thumbnail wording fits. The live parent-close check left zero iframe elements, and the viewport override was reset.
- A fresh, no-cache/service-worker-blocked live check at **02:43:26 UTC** confirmed unchanged catalog counts, supported Bosch cooling, explicit unsupported Bosch leaking, and no Lovable badge. The ignored local detailed result is `release.local/homepage-demo-live.json`.
- HTTP 200 and `x-deployment-id` confirmed the new deployment. Live JS and CSS match the local production build:

| Asset                                 | SHA-256                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| `index-T9IE_pGT.js` (1,610,975 bytes) | `2e439b91197762ae1793d19b5da10070bd84a041523e6bab009f4e9b732c9e2f` |
| `index-Bu_JmTmy.css`                  | `01316492473d1c7bd7f4c4896240489cd5b7ebd5e808981593f1112753c49865` |

## Remaining boundaries

The existing large-chunk advisory remains (~192.90 kB gzip JS); no new dependency was added. The host serves HSTS, referrer, and MIME-sniffing protection but did not return the repository's declared CSP. The new source-level frame allowance is narrow, but host CSP enforcement is not claimed.

The submitted video and Devpost entry are unchanged. Do not edit the submitted repository, site, or video after **September 3, 2026 at 1 PM Pacific**; keep the site available through **September 21 at 5 PM Pacific**.
