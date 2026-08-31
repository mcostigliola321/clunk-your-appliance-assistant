# Clunk judge and homeowner critique — 2026-08-31

## Outcome

The live release already had a distinctive core: the appliance cutaway becomes the interface, the person reports only physical observations, and the current screen controls what a browser agent can do next. The weakest layer was the language and scaffolding around that core. Repeated capability cards, internal evidence terms, a raw developer panel, exact-match filters, and oversized seller actions made a defensible product feel generated and competition-built.

This release keeps the catalog, model × symptom evidence, safety stops, exact-code rules, Shopify attribution, and eight-tool WebMCP contract unchanged. It changes how those truths are presented.

It shipped to the public Lovable site from commit `8c7f1ff0339e3f954d55c11b3551fddda7167006` after GitHub Verify run [33435463790](https://github.com/mcostigliola321/clunk-your-appliance-assistant/actions/runs/33435463790) passed. Fresh public verification confirmed the expected supported and unsupported routes and exact equality between the deployed and local JavaScript asset; see [`live-deployment-verification.json`](live-deployment-verification.json).

## Critical baseline

### Audit score

| Dimension           | Live baseline | Candidate | Evidence                                                                                                                                                                                              |
| ------------------- | ------------: | --------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accessibility       |           4/4 |       4/4 | Semantic journey, visible focus, keyboard flow, 44px controls, reduced motion, and axe journeys remain covered. Programmatically focused headings no longer receive a distracting control-style ring. |
| Performance         |           3/4 |       3/4 | Responsive images and stable layouts remain; the existing application bundle is about 190 kB gzip and still triggers Vite's large-chunk advisory.                                                     |
| Theme system        |           4/4 |       4/4 | The Approachable Precision tokens, type, color, and structural rules remain coherent across all revised surfaces.                                                                                     |
| Anti-patterns       |           2/4 |       4/4 | Removed the repeated symptom-card grid, hero metric pill, capability filters, raw developer-first disclosure, and full-width seller-button stack.                                                     |
| **Technical total** |     **13/16** | **15/16** | Full local gate: 110 unit/integration/WebMCP tests, 54 desktop/mobile journeys, and zero moderate-or-higher dependency vulnerabilities.                                                               |

### Design-health score

| Heuristic                  | Live baseline | Candidate |
| -------------------------- | ------------: | --------: |
| System status              |           4/4 |       4/4 |
| Real-world language        |           2/4 |       4/4 |
| User control               |           4/4 |       4/4 |
| Consistency                |           3/4 |       4/4 |
| Error prevention           |           4/4 |       4/4 |
| Recognition over recall    |           4/4 |       4/4 |
| Flexibility and efficiency |           2/4 |       3/4 |
| Minimalism                 |           2/4 |       4/4 |
| Error recovery             |           3/4 |       3/4 |
| Help and explanation       |           3/4 |       4/4 |
| **Total**                  |     **31/40** | **38/40** |

The remaining recovery limitation is intentional: Clunk does not provide an unsafe shortcut after a hazard or evidence stop. The remaining efficiency limitation is the cost of collecting a full model number and real physical observations before making a part claim.

### Cognitive-load check

The live build failed three of six checks: the symptom grid repeated status and count language; an exact model match still exposed browsing and capability filters; and five seller rows each used an oversized primary action. The candidate passes all six: one clear stage at a time, plain language, one decisive exact match, compact seller rows, progressive disclosure, and no repeated card stack.

## Persona review

- **First-time homeowner:** “Exact part available” and “Safe checks available” now explain the consequence without exposing the internal tier name. Model-label copy explains why the ending matters in one sentence.
- **Mobile homeowner:** the four appliance cutaways still fit the first 390px viewport; symptoms become a ruled vertical index; the exact result and first seller action remain reachable in the 320px result viewport.
- **Skeptical judge:** **One guide. Two ways to use it.** now explains the novelty before exposing raw tools: the person and browser agent share the same guarded repair state, and physical observations unlock later actions.
- **Keyboard and assistive-technology user:** focus moves with the journey, headings remain focusable without looking like input controls, and the revised nested inspector remains keyboard reachable and axe-clean.

## Changes made

- Replaced capability and evaluation language such as “purchase-ready,” “checks only,” “supported now,” “UCP catalog search,” and “AI connected” in customer-facing surfaces.
- Replaced the symmetric symptom-card grid with one ruled observation index beside the appliance cutaway.
- Removed the homepage metric pill, research-roadmap copy, and repetitive “four broad problem guides” labels.
- Added a single exact-model confirmation that preserves the complete code and hides browsing/filter controls when they are no longer useful.
- Recast the WebMCP disclosure around the product idea, then nested the raw activity and tool inspector one level deeper.
- Reworked Shopify results into compact seller rows with honest **View offer** links and a nearby terms disclosure.
- Removed the model-family demo-code shortcut; sample outcomes remain clearly labeled in the separate finished-guide hub.
- Updated durable product and design guidance so future work does not reintroduce internal evidence terminology into the homeowner journey.

## Remaining high-value work

1. Disable Lovable's injected **Edit with Lovable** badge in the paid project setting. It is not part of the repository and remains the clearest external builder tell.
2. Record one real natural-language browser-agent session for the submission video. The interface now tells the story clearly; an authentic run would prove it.
3. Treat merchant quality as unverified. Clunk can verify the exact SKU returned, not seller legitimacy or whether a seller's OEM claim is true.
4. Consider bundle splitting after the submission if load performance becomes a product priority; it is not a current correctness or mobile-layout failure.
