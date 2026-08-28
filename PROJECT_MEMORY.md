# Clunk project memory

Last reconciled: **2026-08-28** after the integrated release was fast-forward merged into local `main` from base commit `a5d7624`.

This is the concise cross-task handoff. Verify moving branch, deployment, external-service, and deadline facts before acting.

## Product truth

Clunk is a consumer-first visual appliance diagnostic guide and WebMCP demo. A homeowner and browser agent share one deterministic repair state: the agent reasons over bounded, source-backed evidence while the person reports only physical observations. The product answers what may be wrong, where to look, what exact part is supported, and where it can be bought. Safety, compatibility evidence, and commerce are separate claims.

The design direction is **Approachable Precision**: calm, appliance-led, highly legible, and free of generic AI styling or dashboard density. Real diagnosis is primary. Completed fixtures sit behind one secondary **See how Clunk works** entry. The homepage shows four working appliance choices, then no more than four observable problem choices per category. A quiet text-only note says vacuums and robot vacuums are next to evaluate; it is not a control or shipping promise.

## Current main state

- Local `main` contains 163 source-backed U.S. model families: 56 washers, 33 dishwashers, 33 electric dryers, and 41 refrigerators across 11 brands.
- Model identity and symptom coverage are many-to-many. The catalog resolves to 175 model × symptom packs: 25 purchase-ready and 150 guided-check combinations.
- Every model keeps its established category symptom. Twelve additional guided paths are separately evidenced only on GE `GFW550SSNWW`, Whirlpool `WDT750SAKZ1`, GE `GTD42EASJ2WW`, and GE `GSS25GYPFS`. The 16 visible symptom families are four per category. Unsupported model × symptom pairs stop visibly and never borrow another tree.
- Search filters by the selected symptom. Versioned persistence migrates the earlier single-symptom state, malformed or oversized local state is discarded, and undo history is bounded.
- Existing result/commerce/safety separation, exact revision evidence, accessibility goals, 320px behavior, reduced motion, focus handling, eight public WebMCP tools, and deterministic examples are preserved.
- Shopify organic Global Catalog search remains credential-free. An optional validated public saved-catalog identifier can request Shopify's `affiliate` placement. Promoted offers are labeled, disclose possible commission near the action, and preserve Shopify's attributed variant URL exactly. Enrollment, saved-catalog approval, and payout setup remain manual external dependencies.
- Repository hardening includes corrected security claims, a private-vulnerability-reporting path through GitHub, stronger secret ignores and a public-only example configuration, bounded public-HTTPS URL validation, hardened local-state parsing, full-SHA Actions pins, and static-host security-header declarations. External GitHub and host settings remain in `docs/release-security-checklist.md`.

Commits `3b886c2` and `1eeb104` were fast-forward merged into `main` and included in the 2026-08-28 push to `origin/main`, together with the merge-state handoff update. The connected-branch push should sync into the Lovable editor, but production deployment and the live URL have not yet been verified. No GitHub settings, repository visibility, external account, or program enrollment was changed.

## Verification

The complete integrated gate passed on 2026-08-28: TypeScript, ESLint, 77 unit/integration/WebMCP tests, production build, and 36 Playwright cases across desktop and mobile. `npm audit` reported zero known vulnerabilities across production and development dependencies. A bounded visual pass inspected the homepage, symptom choice, unsupported model × symptom state, guided checks, 320px organic exact result, promoted-offer fixture, and mobile safety stop. The one-time Impeccable finish detector found no release-blocking defect; its output was limited to existing design-token advisories and a font-fallback false positive already declared in `DESIGN.md`.

## Evidence and security limitations

- Model recognition never implies coverage for an unlisted problem. The broader 2026-08-28 evidence reconnaissance contains candidates and gaps, not production permissions. Extend coverage only after source applicability, topology exceptions, and safety boundaries are documented.
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
