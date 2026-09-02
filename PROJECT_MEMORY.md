# Clunk project memory

Last reconciled: **2026-09-02** after final-submission polish implementation commit `6c75da2541133cb1acf67b340a7042d170b516fa` was fast-forwarded to `main` and published through Lovable as deployment `57b8a941-ab4f-476d-af5b-05ba6dd0dbc7`. The final UX audit, focused corrections, and release evidence are recorded in [`docs/research/final-submission-polish-2026-09-02/README.md`](docs/research/final-submission-polish-2026-09-02/README.md).

This is a concise cross-task handoff. Verify moving branch, deployment, external-service, and deadline facts before acting.

## Product truth

Clunk is a consumer-first visual appliance diagnostic guide and WebMCP demo. A homeowner and browser agent share one deterministic repair state: the agent reasons over bounded, source-backed evidence while the person reports only physical observations. Model identity, symptom guidance, exact-part compatibility, seller availability, and promoted placement are separate claims.

The design direction is **Approachable Precision**: calm, appliance-led, highly legible, and free of generic AI styling or dashboard density. Real diagnosis is primary. Finished examples sit behind one secondary **See a finished guide** entry. The homepage shows four working appliance choices and observable problems; one plain first-viewport sentence explains that a browser can help with lookup while physical observations stay with the person. Symptom selection is a restrained editorial index without per-symptom catalog counts.

Customer-facing capability language is **Exact part available**, **Safe checks available**, and **Exact part currently unavailable**. Internal evidence-tier language such as purchase-ready, guided-only, UCP, or outcome availability must stay out of the primary journey. Exact model matches collapse to one decisive choice, seller offers use compact **View offer** actions, and technical details sit behind plain-language disclosure.

WebMCP novelty is introduced as **One guide. Two ways to use it.** The secondary explanation assigns plain responsibilities to **Browser agent**, **Person**, and **Clunk**; live handoff proof appears before the general explanation when a diagnosis exists. Tool display state distinguishes available, complete, and locked, so a completed diagnosis says **Part lookup used** rather than falsely appearing locked. Raw tool and activity data remains available one disclosure deeper for judges and developers.

## Current release state

- The catalog preserves 163 source-backed U.S. identities: 56 washers, 33 dishwashers, 33 electric dryers, and 41 refrigerators across 11 brands. There are 106 exact-code identities and 57 family-only identities.
- All 782 model × symptom pairs are reproducibly classified. There are 766 supported pairs and 16 explicitly unsupported pairs: washer 274/280, dishwasher 165/165, dryer 132/132, and refrigerator 195/205.
- The 16 gaps are evidence boundaries, not silent implementation omissions. Six washer rows lack sufficiently exact topology-safe manufacturer support. Ten refrigerator rows are leak and no-ice routes for the five Bosch E-Nr identities; current Bosch US evidence did not justify the shared visible-check profiles.
- Purchase-ready coverage is 84 models: 15 washers, 23 dishwashers, 18 dryers, and 28 refrigerators. The release adds 17 complete-revision paths—nine dishwasher pumps, seven dryer door-side strikes, and Maytag `MFT2772HEZ00` → `EDR2RXD1`—to the prior 67.
- Purchase-ready requires one complete product revision, one exact manufacturer SKU, manufacturer or authorized compatibility evidence applying to that revision, and a separately observed exact-SKU seller offer. The release stops below the aspirational 145-model target because fit was not inferred from neighbors, family names, or seller results.
- The normalized evidence overlays are `src/data/demoReadyCoverage.json` and `src/data/demoReadyPurchaseExpansion.json`, with strict runtime validators and negative tests. Category research and blockers are under `docs/research/demo-ready-2026-08-29/`.
- `scripts/audit-demo-readiness.ts` emits the complete 163-identity/782-pair JSON and CSV audit. Every row includes its active evidence and capability or an explicit missing-evidence reason.
- Dryer drum guidance no longer asks the homeowner to rotate the drum by hand. It keeps hands clear, permits load removal only while unplugged and still, and stops at professional service when the visible load does not explain the failure.
- Existing safety, exact-code, commerce-attribution, accessibility, 320px, reduced-motion, persistence, public-URL, and eight-tool WebMCP boundaries remain in force.
- Shopify results show at most one exact-SKU offer per seller, retain paid-placement attribution, and report checking/error/result-count state instead of a generic **Live** badge. Seller quality and OEM claims remain unverified.

## Verification

The 2026-09-02 final-submission polish passed deterministic regeneration and both evidence audits, strict TypeScript, ESLint, Prettier, all 112 unit/integration/WebMCP tests, production build, all 54 desktop/mobile Playwright journeys, `git diff --check`, and `npm audit --audit-level=moderate` with zero vulnerabilities. Fresh desktop and 390px checks covered the first viewport, exact GE `GTD42EASJ2WW` selection, human/agent handoff, exact `WE01M10007` result, seller handoff, and terminal safety stop. The public Lovable check used a no-cache, service-worker-blocked context and confirmed visible counts, badge absence, supported/unsupported Bosch routes, and byte-for-byte equality between deployed and local JavaScript (`index-DL2LrkBQ.js`, 1,600,161 bytes, SHA-256 `10b907ccc8ab47d223a3ea212c6c7e89be5d62a8b07cacb67f915d562b66d6b2`).

The 2026-08-31 judge-depth release passed both deterministic evidence audits, strict TypeScript, ESLint, Prettier, all 111 unit/integration/WebMCP tests, production build, all 54 desktop/mobile Playwright journeys, `git diff --check`, and `npm audit --audit-level=moderate` with zero vulnerabilities. GitHub Verify run [33442958061](https://github.com/mcostigliola321/clunk-your-appliance-assistant/actions/runs/33442958061) passed the exact implementation commit. Fresh public verification confirmed the first-viewport browser/person promise, badge absence, all catalog counts and supported/unsupported Bosch routes, and byte-for-byte equality between deployed and local JavaScript (`index-CzLdmU5i.js`, 1,600,109 bytes, SHA-256 `32dc0ba9f1cf6bd4c3017750ab33c40ecc8f9d245195531b54eaf500695cc7c2`).

The 2026-08-31 judge-polish candidate passed deterministic regeneration and both evidence audits, strict TypeScript, ESLint, Prettier, all 110 unit/integration/WebMCP tests, production build, all 54 desktop/mobile Playwright journeys, `git diff --check`, and `npm audit --audit-level=moderate` with zero vulnerabilities. Representative homepage, symptom, exact-model, result, and WebMCP-story states were visually reviewed on desktop and at 390px. The production build retains Vite's existing advisory for a JavaScript chunk above 500 kB; the built JavaScript is about 190 kB gzip.

The 2026-08-29 local release gate passed: deterministic regeneration, strict TypeScript, ESLint, Prettier, all 110 unit/integration/WebMCP tests, production build, all 54 desktop/mobile Playwright journeys, and `npm audit --audit-level=moderate` with zero vulnerabilities. The production build retains Vite's existing advisory for a JavaScript chunk above 500 kB; the built JavaScript is about 190 kB gzip.

A fresh-context local production-preview verification passed visible catalog counts, refrigerator cooling/leak counts, Bosch `B36CT81ENS/07 × not cooling` as supported, Bosch `B36CT81ENS/07 × leak` as explicitly unsupported, and byte-for-byte equality between the served and local JavaScript asset. Desktop and 390px homepage screenshots were visually reviewed with no overflow or hierarchy regression observed.

The public Lovable deployment at `https://clunk-appliance-assistant.lovable.app` was freshly published and verified on 2026-08-29. `scripts/verify-live-deployment.ts` used service-worker-blocked, no-cache browser contexts and confirmed the visible release counts, supported/unsupported Bosch routes, production module basename, byte length, and SHA-256 digest against the local build. The result is recorded in `docs/research/demo-ready-2026-08-29/live-deployment-verification.json`.

The judge-polish release was freshly published and verified again on 2026-08-31. A no-cache, service-worker-blocked context confirmed Lovable's injected badge is absent; all 163 visible models; refrigerator cooling/leak counts of 41/36; Bosch `B36CT81ENS/07 × not cooling` as supported; Bosch `B36CT81ENS/07 × leak` as explicitly unsupported; and exact equality between the served and local JavaScript asset (`index-Doriv2Mi.js`, 1,599,558 bytes, SHA-256 `d73b00c8aaba412a8abbc51e1c0b986309d6c9aad66231a18e54ee62d2e0ffda`). Desktop and mobile public screenshots were also reviewed. The result is recorded in `docs/research/judge-polish-2026-08-31/live-deployment-verification.json`.

## Evidence and release boundaries

- Unsupported model × symptom pairs stop visibly and never borrow another model's tree.
- Manufacturer model pages establish identity/topology/features only; they do not independently create troubleshooting coverage.
- Shared guided profiles contain only the low-risk exterior observations common to every explicit row. Panels, wiring, terminal blocks, internal drives, refrigerant work, appliance movement, installation adjustment, and unproven reset/test sequences remain excluded.
- Shopify Global Catalog and public storefront content can establish an observed offer only. They cannot prove fit, merchant authenticity, future stock, or commission eligibility.
- Protected or variable source-page HTTP behavior is an access limitation, not evidence. Reverify dated source and seller observations before a later release.
- `public/_headers` is host-specific; verify the production host actually serves equivalent security controls.
- Genuine natural-language WebMCP sessions, the public demo video, Devpost creation, and submission remain external work requiring explicit authorization where applicable.
- Lovable's public **Edit with Lovable** badge is an external project setting, not repository UI. It was disabled with explicit user confirmation, persisted after a settings reload, republished, and verified absent in a fresh public browser context on 2026-08-31.

## Working rules

- Do not force-push, rebase, amend, squash, delete, or otherwise rewrite published Lovable-connected history.
- Do not infer an exact part from a family neighbor, partial code, seller result, or generic troubleshooting article.
- Keep model, symptom, exact-part, offer, and promoted-placement evidence separate.
- Preserve WCAG 2.2 AA goals, keyboard access, 44px touch targets, 320px layouts, reduced motion, visible focus, screen-reader status, color-independent meaning, and plain-language safety stops.
- Run the complete verification gate and inspect representative desktop/mobile states after integration and again after publication.
