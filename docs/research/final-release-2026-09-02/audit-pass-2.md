# Final release audit — pass 2

Date: 2026-09-02  
Scope: final local release candidate on `codex/final-release`  
Design context: ordinary homeowners under repair pressure and judges evaluating person/browser-agent collaboration; **Approachable Precision**; appliance-led, calm, exact, restrained, and highly legible.

## Anti-pattern verdict

**Pass.** The interface remains a distinctive appliance field guide rather than a generic AI dashboard. Recognizable cutaways, an editorial rule system, one decisive question at a time, and the restrained paper/tide/citron palette remain intact. There are no gradients, glass panels, neon agent styling, hero metrics, decorative charts, bounce motion, or interchangeable card grids.

## Audit health score

| #         | Dimension         |     Score | Key finding                                                                                                                 |
| --------- | ----------------- | --------: | --------------------------------------------------------------------------------------------------------------------------- |
| 1         | Accessibility     |       4/4 | WCAG A/AA automation, semantic controls, visible focus, status announcements, reduced motion, and tested 44px targets pass. |
| 2         | Performance       |       3/4 | Images are dimensioned and deferred appropriately, but the initial JS chunk remains 1,609.66 kB minified / 192.41 kB gzip.  |
| 3         | Responsive design |       4/4 | Desktop/mobile suites plus focused 320px, 390px, touch, overflow, safety, and result-viewport checks pass.                  |
| 4         | Theming           |       4/4 | The repeated placeholder and dark-surface neutrals now use named design tokens without changing rendered values.            |
| 5         | Anti-patterns     |       4/4 | The appliance-first composition retains its own visual language and avoids the listed generic AI patterns.                  |
| **Total** |                   | **19/20** | **Excellent — no release-blocking interface issue.**                                                                        |

## Executive summary

- Audit Health Score: **19/20 (Excellent)**, up from 18/20 in pass 1.
- Findings: **0 P0, 0 P1, 1 P2, 0 P3**.
- Release threshold: met; no P0/P1 interface finding.
- Material fix: repeated literal placeholder and dark-surface colors were replaced by named Clunk tokens with identical values.
- Verification: strict TypeScript, ESLint, 118 unit/integration/WebMCP/remote-MCP checks, production build, 56 desktop/mobile Playwright journeys, generated MCP drift check, and ten focused responsive/accessibility/safety journeys all passed.

## Detailed finding

### [P2] Large single JavaScript chunk

- **Location:** production output from `vite.config.ts`; `dist/assets/index-Bx-bKBAZ.js`
- **Category:** Performance
- **Impact:** The 1.61 MB minified chunk increases parse/evaluation work on slower mobile hardware even though compression reduces transfer to 192.41 kB.
- **Standard:** performance quality; Vite's 500 kB chunk advisory.
- **Recommendation:** after the submission freeze, profile startup on representative mobile hardware and split catalog/repair data only if measurement proves a gain. Do not suppress the advisory or restructure the guarded engine immediately before the deadline.
- **Suggested command:** `/optimize`

## Patterns and systemic issues

No systemic accessibility, responsive, motion, theming, or generic-design issue remains. The only open item is a build-level performance opportunity that needs measurement and carries unnecessary pre-deadline regression risk.

## Positive findings

- All eight WebMCP tools remain discoverable while `nextTools` and the engine independently guard execution.
- The current question receives programmatic focus after state changes; result alignment avoids animated layout properties.
- Controls use semantic buttons, fieldsets, legends, pressed/current state, explicit labels, live regions, and color-independent text/icons.
- Images have alt text and intrinsic dimensions; full cutaways are not eagerly loaded on the first journey.
- The mobile result places the answer before the illustration, preserving the customer's immediate outcome.
- Reduced-motion CSS disables animation and smooth scrolling.
- Smoke/burning-smell paths end without undo, part, or commerce affordances.

## Recommended actions

1. **[P2] `/optimize` after judging** — profile a data split; accept it only with a measured startup improvement and a full regression pass.
2. **`/polish` after judging** — visually recheck representative diagnosis, result, and safety states after any post-freeze performance work.

The final audit clears the interface release threshold. Remaining submission blockers are external publication and entry actions, not product-interface defects.
