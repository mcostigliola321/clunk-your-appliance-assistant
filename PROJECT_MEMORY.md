# Clunk project memory

Last reconciled: **2026-08-28** on local branch `codex/expand-model-symptom-coverage`, based exactly on `origin/main` commit `63b3db6`. The verified implementation commit is `0b536fc`; it has not been pushed, merged, published, or synced to Lovable.

This is the concise cross-task handoff. Verify moving branch, deployment, external-service, and deadline facts before acting.

## Product truth

Clunk is a consumer-first visual appliance diagnostic guide and WebMCP demo. A homeowner and browser agent share one deterministic repair state: the agent reasons over bounded, source-backed evidence while the person reports only physical observations. The product answers what may be wrong, where to look, what exact part is supported, and where it can be bought. Safety, compatibility evidence, and commerce are separate claims.

The design direction is **Approachable Precision**: calm, appliance-led, highly legible, and free of generic AI styling or dashboard density. Real diagnosis is primary. Completed fixtures sit behind one secondary **See how Clunk works** entry. The homepage shows four working appliance choices, then only evidence-backed broad problem peers. One-model experiments remain available in a clearly secondary **Limited pilots** disclosure and must not look equivalent to mature coverage. A quiet text-only note says vacuums and robot vacuums are next to evaluate; it is not a control or shipping promise.

## Current branch state

- The branch preserves all 163 source-backed U.S. model families: 56 washers, 33 dishwashers, 33 electric dryers, and 41 refrigerators across 11 brands. Local and remote `main` remain at `63b3db6`.
- Model identity and symptom coverage remain many-to-many. The branch resolves to 266 model × symptom packs: 25 purchase-ready and 241 guided-check combinations.
- The 91 newly activated guided combinations cover door/lid closure for exactly 36 washers, door closure for exactly 20 dishwashers, and door closure for exactly 35 refrigerators. Their checked source records live in `src/data/symptomCoverageExpansion.json` under `docs/symptom-coverage-expansion.schema.json`.
- Mature visible routes are washer drain 56 and closure 36; dishwasher drain 33 and closure 20; dryer closure 33; refrigerator slow water 41 and closure 35. Each of the remaining 12 symptom routes still covers exactly one checked flagship model and now appears only under **Limited pilots**. Unsupported model × symptom pairs stop visibly and never borrow another tree.
- New closure packs are conservative, external, no-disassembly guided checks. Washer language is topology-aware for doors versus lids. Feature-specific AutoRelease/open-dry, adjustable-rack, mullion/flap, and leveling/alignment branches are excluded unless an exact model manual proves them. None of the new packs claims a part or purchase-ready outcome.
- Search filters by the selected symptom. Versioned persistence migrates the earlier single-symptom state, malformed or oversized local state is discarded, and undo history is bounded.
- **Start over** now also resets the local appliance/problem journey rather than leaving the screen on a stale symptom choice.
- Existing result/commerce/safety separation, exact revision evidence, accessibility goals, 320px behavior, reduced motion, focus handling, eight public WebMCP tools, and deterministic examples are preserved.
- Shopify organic Global Catalog search remains credential-free. An optional validated public saved-catalog identifier can request Shopify's `affiliate` placement. Promoted offers are labeled, disclose possible commission near the action, and preserve Shopify's attributed variant URL exactly. Enrollment, saved-catalog approval, and payout setup remain manual external dependencies.
- Repository hardening includes corrected security claims, a private-vulnerability-reporting path through GitHub, stronger secret ignores and a public-only example configuration, bounded public-HTTPS URL validation, hardened local-state parsing, full-SHA Actions pins, and static-host security-header declarations. External GitHub and host settings remain in `docs/release-security-checklist.md`.

Earlier commits `3b886c2` and `1eeb104` remain on `main` and `origin/main`. The coverage work is local-only in `0b536fc`. Production deployment and the live URL have not been verified. No GitHub settings, repository visibility, external account, program enrollment, or Lovable state was changed.

## Verification

The complete branch gate passed on 2026-08-28: TypeScript, ESLint, 84 unit/integration/WebMCP tests, production build, and all 40 Playwright cases across desktop and mobile. `npm audit --audit-level=moderate` reported zero known vulnerabilities. A bounded in-app visual pass inspected the homepage, mature and limited symptom choices, an LG top-load lid guide and professional stop, an organic Shopify exact result, a 320px exact-commerce result, the 320px homepage, and a 320px burning/smoke safety stop. The inspected 320px states had no horizontal overflow; focus and reduced-motion coverage also passed. The build still emits the existing chunk-size advisory: the main bundle is 652.58 kB minified and 140.42 kB gzip.

## Evidence and security limitations

- Model recognition never implies coverage for an unlisted problem. The 91 activated rows reconcile the reconnaissance's 86 frozen door candidates plus five recommended models that are now in the catalog. The later 24-model catalog batch was not generalized because it was outside the frozen exact candidate matrix. Other reconnaissance candidates and gaps are not production permissions.
- The 26 cited manufacturer troubleshooting sources were rechecked on 2026-08-28. They support conservative common closure checks, not every model-specific feature branch. Source pages can move or change, so reverify them before a later expansion or release audit.
- The 12 one-model routes remain evidence-limited pilots. Broadening them requires current primary manufacturer applicability for each exact model/cohort; a flagship tree, retailer listing, Shopify result, or model identity is insufficient.
- Purchase-ready status requires a complete appliance code mapped to one exact SKU by manufacturer or authorized-parts evidence. Shopify can discover offers but cannot prove fit.
- Shopify promoted placements were invite-led developer preview functionality when rechecked on 2026-08-28. The owner must join the waitlist, accept the Dev Dashboard agreement, enable an approved saved catalog, and configure Partner/Hyperwallet payout details before commissions can operate.
- `public/_headers` is host-specific. Verify the published host actually serves equivalent CSP, anti-framing, MIME-sniffing, referrer, permissions, and isolation headers.
- Enable GitHub secret scanning and push protection, Dependabot alerts and security updates, private vulnerability reporting, and a `main` ruleset that blocks force pushes and deletion while remaining compatible with Lovable direct pushes.
- Genuine natural-language WebMCP agent sessions, the public demo video, Devpost project creation, and submission are still external work and require explicit user authorization where applicable.

## Working rules

- Do not force-push, rebase, amend, squash, delete, or otherwise rewrite published Lovable-connected history.
- Do not infer an exact part from a family neighbor, partial code, seller result, or generic troubleshooting article.
- Keep model, symptom, exact-part, offer, and promoted-placement evidence separate.
- Preserve WCAG 2.2 AA goals, keyboard access, 44px touch targets, 320px layouts, reduced motion, visible focus, screen-reader status, color-independent meaning, and plain-language safety stops.
- Run the complete verification gate and inspect representative desktop/mobile states after integration and again after any merge or publication.
