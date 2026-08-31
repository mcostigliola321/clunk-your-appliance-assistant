# Clunk depth critique — 2026-08-31

## Outcome

The first judge-polish release removed obvious presentation debt, but its score was too generous. A longer live walkthrough exposed five structural weaknesses that a skeptical judge or hurried homeowner could still encounter:

1. Clunk's WebMCP idea was hidden below the appliance field and described with the generic slogan “The page is the protocol.”
2. Symptom choices still repeated catalog counts, making a homeowner decision look like an evaluation dashboard.
3. The handoff card could call part lookup “locked” after a real completed diagnosis had already used it.
4. Sample summaries and commerce status used compressed, generated-sounding language such as arrows, “verified handoff,” and a vague **Live** pill.
5. Shopify could fill several of five result rows with variants from one merchant.

The depth candidate fixes those issues without changing the evidence catalog, exact-code boundary, safety rules, or WebMCP contract.

The final local gate passed deterministic coverage and purchase audits, strict TypeScript, ESLint, Prettier, all 111 unit/integration/WebMCP tests, the production build, all 54 desktop/mobile browser journeys, `git diff --check`, and `npm audit --audit-level=moderate` with zero vulnerabilities. The production bundle remains about 190 kB gzip and retains Vite's existing large-chunk advisory.

The implementation shipped from commit `a8b66121c4285c07f82cbfd962fc87d4d54350b9` after GitHub Verify run [33442958061](https://github.com/mcostigliola321/clunk-your-appliance-assistant/actions/runs/33442958061) passed. Lovable deployment `7069b1fa-8817-4943-878e-1a1d028d5adc` published to `https://clunk-appliance-assistant.lovable.app`. A fresh service-worker-blocked browser verified the first-viewport promise, badge absence, catalog and supported/unsupported routes, and exact equality between the deployed and local JavaScript asset; see [`live-deployment-verification.json`](live-deployment-verification.json).

## Honest score reset

The earlier 38/40 design-health score is withdrawn as a useful baseline. It rewarded surface cleanup without testing whether the novelty was visible, whether the dynamic proof stayed truthful after completion, or whether live commerce produced duplicate merchants.

| Heuristic                  | Previous candidate | Depth candidate | Evidence                                                                                                                                        |
| -------------------------- | -----------------: | --------------: | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| System status              |                3/4 |             4/4 | The commerce badge now reports checking, unavailable, none found, or the actual result count. Completed handoff state says the lookup was used. |
| Real-world language        |                3/4 |             4/4 | Removed arrow summaries, “protocol” headline, replay jargon, and “supplied live” language.                                                      |
| User control               |                4/4 |             4/4 | Back, undo, Start over, and now the Clunk home link all return to a predictable state.                                                          |
| Consistency                |                3/4 |             4/4 | Tool states now distinguish available, complete, and locked instead of using one ambiguous active state.                                        |
| Error prevention           |                4/4 |             4/4 | Exact model, serial rejection, hazard stops, and exact-SKU filtering remain intact.                                                             |
| Recognition over recall    |                4/4 |             4/4 | Appliance cutaways, visible problem descriptions, label guidance, and bounded observations remain visible in context.                           |
| Flexibility and efficiency |                3/4 |             3/4 | Full model text and physical observations remain deliberate requirements, not friction to remove.                                               |
| Minimalism                 |                3/4 |             4/4 | Removed symptom counts and replaced the icon-led WebMCP marketing stack with a plain division of responsibility.                                |
| Error recovery             |                2/4 |             3/4 | Serial and unsupported-model guidance no longer repeats the same explanation twice. Safety stops intentionally do not offer an unsafe shortcut. |
| Help and explanation       |                4/4 |             4/4 | The first viewport now explains the browser/person boundary in one sentence; detailed proof stays secondary.                                    |
| **Total**                  |          **33/40** |       **38/40** | The remaining two points are the honest cost of exact-code collection and safe terminal stops.                                                  |

## What changed

- Added the first-viewport promise: a browser agent can help with lookup, but only the person can report what is physically present.
- Replaced the generic WebMCP headline and three icon rows with a plain **Browser agent / Person / Clunk** division of responsibility.
- Put the live handoff state before the general explanation when a diagnosis exists.
- Modeled tool display state as **available**, **complete**, or **locked**. A completed diagnosis now shows **Part lookup used**.
- Clearly labels finished guides as previews with pre-filled answers, not agent observations.
- Removed per-symptom model counts from the homeowner choice rows. Catalog breadth remains available in **Browse all models** and release evidence.
- Removed duplicated error guidance beneath serial-number and unsupported-model messages.
- Rewrote every sample summary as a normal sentence.
- Replaced the static **Live** seller badge with truthful request state and result count.
- Shows one best exact-SKU result per seller, preventing duplicate variants from crowding out other merchants.
- Made the Clunk wordmark behave like its accessible name: it now returns an active journey home.

## Important non-change

The LG `WM3400CW.ABWEVUS × won't drain` route initially looked weaker than an older demonstration because it reports safe checks rather than an exact pump. Source and engine tracing confirmed that this is correct in the current catalog: exact-part capability belongs to the model × symptom evidence row, not to the brand, model family, or an old sample. The route was not promoted beyond its evidence.

That correction matters more than cosmetic confidence. A demo-ready product must be willing to keep a less exciting answer when the evidence does not support a stronger one.

## Remaining five-day priorities

1. **Prove one natural-language browser-agent run on video.** The interface can now explain and expose the handoff honestly; a real run is the strongest remaining submission proof.
2. **Rehearse judge recovery paths.** The presenter should show one happy path, one “browser must wait for the person” moment, and one hazard that removes the purchase path.
3. **Keep seller quality explicitly unverified.** Clunk validates exact SKU, availability response, URL safety, and placement attribution—not merchant legitimacy or OEM claims. Do not add a “best seller” rank without new evidence.
4. **Treat bundle splitting as secondary.** The catalog-heavy bundle remains about 190 kB gzip. Splitting it could delay WebMCP tool availability and needs measurement, not a last-minute rewrite.
5. **Do not add camera/OCR model capture for the submission.** It would introduce privacy, permission, recognition-error, and suffix-guessing risks at the product's most important evidence boundary.
