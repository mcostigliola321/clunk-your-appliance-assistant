# Clunk project memory

Last reconciled: **2026-08-29** after the broad-symptom expansion passed its full release gate, was pushed on `codex/expand-model-symptom-coverage`, and was fast-forward merged into `main`. Confirm the moving remote and deployment state before relying on this handoff; production publication has not been verified.

This is the concise cross-task handoff. Verify moving branch, deployment, external-service, and deadline facts before acting.

## Product truth

Clunk is a consumer-first visual appliance diagnostic guide and WebMCP demo. A homeowner and browser agent share one deterministic repair state: the agent reasons over bounded, source-backed evidence while the person reports only physical observations. The product answers what may be wrong, where to look, what exact part is supported, and where it can be bought. Safety, compatibility evidence, and commerce are separate claims.

The design direction is **Approachable Precision**: calm, appliance-led, highly legible, and free of generic AI styling or dashboard density. Real diagnosis is primary. Completed fixtures sit behind one secondary **See how Clunk works** entry. The homepage shows four working appliance choices, then at most four evidence-backed common problems. A fifth checked route uses neutral consumer wording—**More problems**—rather than pilot/beta/evidence-tier language. A quiet text-only note says vacuums and robot vacuums are next to evaluate; it is not a control or shipping promise.

## Current branch state

- `main` preserves all 163 source-backed U.S. model families: 56 washers, 33 dishwashers, 33 electric dryers, and 41 refrigerators across 11 brands.
- Model identity and symptom coverage remain many-to-many. The verified release resolves to 557 model × symptom packs: 25 purchase-ready and 532 guided-check combinations.
- The 91 newly activated guided combinations cover door/lid closure for exactly 36 washers, door closure for exactly 20 dishwashers, and door closure for exactly 35 refrigerators. Their checked source records live in `src/data/symptomCoverageExpansion.json` under `docs/symptom-coverage-expansion.schema.json`.
- The 12 formerly thin routes now have exact evidence rows at meaningful multi-brand breadth: washer start/spin/leak each 39 models across five brands; dishwasher cleaning/fill/leak each 21 across five brands; dryer start/heat/drum each 19 vented electric models across four brands; refrigerator cooling/leak/ice each 22 across four brands. The existing drain, closure, and water-flow counts remain 56/36, 33/20, 33, and 41/35. Unsupported model × symptom pairs stop visibly and never borrow another tree.
- The new 303-row guided-only ledger is `src/data/broadSymptomCoverage.json`, generated reproducibly by `scripts/generate-broad-symptom-coverage.ts` and validated against `docs/broad-symptom-coverage.schema.json` plus runtime/catalog/pack invariants. It uses 59 current primary manufacturer troubleshooting sources and keeps model-page identity/feature corroboration separate.
- Shared profiles use only cohort-wide exterior observations. Washer language is top/front aware; compact ventless dryers are excluded; refrigerator water/ice routes require an exact factory-feature gate. Filter/pump removal, leveling, installation adjustment, terminal blocks, panels, internal drives, reset/test sequences, refrigerant work, parts, and commerce are not generalized.
- New closure packs are conservative, external, no-disassembly guided checks. Washer language is topology-aware for doors versus lids. Feature-specific AutoRelease/open-dry, adjustable-rack, mullion/flap, and leveling/alignment branches are excluded unless an exact model manual proves them. None of the new packs claims a part or purchase-ready outcome.
- Search filters by the selected symptom. Versioned persistence migrates the earlier single-symptom state, malformed or oversized local state is discarded, and undo history is bounded.
- **Start over** now also resets the local appliance/problem journey rather than leaving the screen on a stale symptom choice.
- Existing result/commerce/safety separation, exact revision evidence, accessibility goals, 320px behavior, reduced motion, focus handling, eight public WebMCP tools, and deterministic examples are preserved.
- Shopify organic Global Catalog search remains credential-free. An optional validated public saved-catalog identifier can request Shopify's `affiliate` placement. Promoted offers are labeled, disclose possible commission near the action, and preserve Shopify's attributed variant URL exactly. Enrollment, saved-catalog approval, and payout setup remain manual external dependencies.
- Repository hardening includes corrected security claims, a private-vulnerability-reporting path through GitHub, stronger secret ignores and a public-only example configuration, bounded public-HTTPS URL validation, hardened local-state parsing, full-SHA Actions pins, and static-host security-header declarations. External GitHub and host settings remain in `docs/release-security-checklist.md`.

The earlier door-closure release was fast-forward merged and pushed to `main` on 2026-08-28. The broader 303-row symptom implementation (`c5c7cb3`) passed its full local release gate on 2026-08-29, was pushed to `codex/expand-model-symptom-coverage`, and was fast-forward pushed to `main`. The connected-branch push should sync into the Lovable editor, but production deployment and the live URL have not been verified. No GitHub settings, repository visibility, external account, program enrollment, or production publication was changed.

## Verification

The 2026-08-29 broad-symptom release gate passed: TypeScript, ESLint, all 90 unit/integration/WebMCP tests, production build, all 48 desktop/mobile Playwright cases, and `npm audit --audit-level=moderate` with zero vulnerabilities. A bounded visual review covered the homepage, symptom selection, guided diagnosis, unsupported model × symptom handling, exact-SKU commerce, promoted-result labeling, the professional safety stop, and 320px/mobile layouts. The production build retains Vite's existing advisory for a JavaScript chunk above 500 kB; the generated evidence ledger increased minified size, while the built JavaScript remains about 166 kB gzip.

## Evidence and security limitations

- Model recognition never implies coverage for an unlisted problem. The 91 activated rows reconcile the reconnaissance's 86 frozen door candidates plus five recommended models that are now in the catalog. The later 24-model catalog batch was not generalized because it was outside the frozen exact candidate matrix. Other reconnaissance candidates and gaps are not production permissions.
- The 26 cited manufacturer troubleshooting sources were rechecked on 2026-08-28. They support conservative common closure checks, not every model-specific feature branch. Source pages can move or change, so reverify them before a later expansion or release audit.
- The 12 broadened routes are not universal: current unsupported brands/models remain excluded until current primary manufacturer applicability proves the exact category/topology/feature boundary. A flagship tree, retailer listing, Shopify result, corporate brand relationship, or model identity is insufficient.
- The 59 broad-route sources were reviewed on 2026-08-29 for conservative common checks. Source pages can move or change; reverify them before a later expansion or release audit.
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
