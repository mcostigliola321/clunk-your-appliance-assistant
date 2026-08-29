# Clunk project memory

Last reconciled: **2026-08-29** after demo-ready release code commit `17af432eab4055b43396b6102a85c3778c8075c8` was fast-forwarded to `main`, passed GitHub Verify run [33263520337](https://github.com/mcostigliola321/clunk-your-appliance-assistant/actions/runs/33263520337), and was published to the public Lovable site. The canonical release report is [`docs/research/demo-ready-2026-08-29/README.md`](docs/research/demo-ready-2026-08-29/README.md).

This is a concise cross-task handoff. Verify moving branch, deployment, external-service, and deadline facts before acting.

## Product truth

Clunk is a consumer-first visual appliance diagnostic guide and WebMCP demo. A homeowner and browser agent share one deterministic repair state: the agent reasons over bounded, source-backed evidence while the person reports only physical observations. Model identity, symptom guidance, exact-part compatibility, seller availability, and promoted placement are separate claims.

The design direction is **Approachable Precision**: calm, appliance-led, highly legible, and free of generic AI styling or dashboard density. Real diagnosis is primary. Completed fixtures sit behind one secondary **See how Clunk works** entry. The homepage shows four working appliance choices and at most four common problems; a fifth checked route uses **More problems**. Vacuums and robot vacuums remain a quiet future research note, not a control or shipping promise.

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

## Verification

The 2026-08-29 local release gate passed: deterministic regeneration, strict TypeScript, ESLint, Prettier, all 110 unit/integration/WebMCP tests, production build, all 54 desktop/mobile Playwright journeys, and `npm audit --audit-level=moderate` with zero vulnerabilities. The production build retains Vite's existing advisory for a JavaScript chunk above 500 kB; the built JavaScript is about 190 kB gzip.

A fresh-context local production-preview verification passed visible catalog counts, refrigerator cooling/leak counts, Bosch `B36CT81ENS/07 × not cooling` as supported, Bosch `B36CT81ENS/07 × leak` as explicitly unsupported, and byte-for-byte equality between the served and local JavaScript asset. Desktop and 390px homepage screenshots were visually reviewed with no overflow or hierarchy regression observed.

The public Lovable deployment at `https://clunk-appliance-assistant.lovable.app` was freshly published and verified on 2026-08-29. `scripts/verify-live-deployment.ts` used service-worker-blocked, no-cache browser contexts and confirmed the visible release counts, supported/unsupported Bosch routes, production module basename, byte length, and SHA-256 digest against the local build. The result is recorded in `docs/research/demo-ready-2026-08-29/live-deployment-verification.json`.

## Evidence and release boundaries

- Unsupported model × symptom pairs stop visibly and never borrow another model's tree.
- Manufacturer model pages establish identity/topology/features only; they do not independently create troubleshooting coverage.
- Shared guided profiles contain only the low-risk exterior observations common to every explicit row. Panels, wiring, terminal blocks, internal drives, refrigerant work, appliance movement, installation adjustment, and unproven reset/test sequences remain excluded.
- Shopify Global Catalog and public storefront content can establish an observed offer only. They cannot prove fit, merchant authenticity, future stock, or commission eligibility.
- Protected or variable source-page HTTP behavior is an access limitation, not evidence. Reverify dated source and seller observations before a later release.
- `public/_headers` is host-specific; verify the production host actually serves equivalent security controls.
- Genuine natural-language WebMCP sessions, the public demo video, Devpost creation, and submission remain external work requiring explicit authorization where applicable.

## Working rules

- Do not force-push, rebase, amend, squash, delete, or otherwise rewrite published Lovable-connected history.
- Do not infer an exact part from a family neighbor, partial code, seller result, or generic troubleshooting article.
- Keep model, symptom, exact-part, offer, and promoted-placement evidence separate.
- Preserve WCAG 2.2 AA goals, keyboard access, 44px touch targets, 320px layouts, reduced motion, visible focus, screen-reader status, color-independent meaning, and plain-language safety stops.
- Run the complete verification gate and inspect representative desktop/mobile states after integration and again after publication.
