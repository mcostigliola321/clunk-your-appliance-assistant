## PURPOSE

Clunk is a deterministic, safety-bounded WebMCP appliance troubleshooting app. It lets a homeowner and browser agent share one visible diagnostic state for washers, dishwashers, electric dryers, and refrigerators. Model identity, symptom applicability, part compatibility, Shopify catalog presence, and checkout are separate claims.

As of commit c72bf54 (2026-08-28), the active U.S. catalog contains 163 source-backed models: 56 washers, 33 dishwashers, 33 electric dryers, and 41 refrigerators across 11 brands. Capability totals are 25 purchase-ready and 138 guided-checks-only.

## STACK

Static Vite + React + TypeScript application. The domain engine is deterministic and shared by manual UI actions, example fixtures, and eight state-dependent WebMCP tools. Catalog expansion is JSON-backed and validated at runtime and in tests. Shopify Global Catalog is queried over credential-free UCP only after Clunk has an exact SKU.

Primary data and evidence files:
- src/data/catalogExpansion.json: model rows, aliases, complete-code boundaries, official identity URLs, profile mapping, and per-model exact parts where proven.
- src/data/catalogExpansion.ts: official-host, alias, revision, exact-part, and exact-SKU validation plus runtime catalog construction.
- docs/model-source-ledger.md: human-readable identity, symptom-source, cohort, revision, part, and Shopify evidence ledger.
- docs/research/clunk-evidence-recon-2026-08-28/: machine-readable evidence matrix, cohorts, counts, URL audit, Shopify audit, generator, and activation report.
- docs/source-url-audit.md: reachability/access audit; protected or timed-out status is never treated as evidence.

## ARCHITECTURE

Catalog expansion models reference reusable profiles that are constrained to the same brand, appliance category, and topology. Each model owns its official identity URL, aliases, complete-code requirement, verified product codes, and optional exact part. Shared profiles carry only symptom-applicable manufacturer troubleshooting sources and conservative homeowner checks.

Supported symptom by category remains deliberately narrow:
- Washers: will-not-drain.
- Dishwashers: will-not-drain.
- Electric dryers: door-will-not-close.
- Refrigerators: slow-water-flow.

Guided-checks activation requires two independent evidence layers:
1. Official manufacturer model identity.
2. Manufacturer troubleshooting guidance applicable to the same brand/category/topology cohort.

Purchase-ready requires all of:
1. Exact complete appliance code.
2. Exact compatible part SKU from manufacturer or authorized-parts evidence.
3. Exact SKU present in Shopify Global Catalog.
Shopify and storefront WebMCP never establish fit. Shopify seller discovery and agentic checkout become available only after the exact SKU is independently proven.

The 2026-08-28 goal added 32 guided models overall from the 131-model baseline. The final broad cohort added 24 models, six per category. A new Amana top-load washer profile uses Amana's own not-draining guidance rather than transferring Whirlpool or Maytag evidence.

## PATTERNS

- Never infer symptom coverage from a model page.
- Never transfer evidence across brands, incompatible topologies, or unbounded model families.
- Keep LG dotted suffixes, Samsung slash codes, Bosch E-Nr revisions, GE engineering codes, and Whirlpool-family final digits explicit.
- A family-only model may receive guided checks but cannot receive an exact part.
- Exact-part data lives on one model row; no sibling revision inherits it.
- Dishwashers default to visible sink/air-gap/disposer checks, then service, unless a user-removable path is explicitly proven.
- Dryer checks are visible door/strike/latch observations only; no panels or energized testing.
- Washer checks stop at documented hose or homeowner-accessible filter boundaries.
- Refrigerator filter location/mechanism remains model-guided.
- Stop immediately for smoke, burning smell, heat, active leak near power, unsafe access, or damaged user-access areas.
- Shopify requests use no-store semantics and reject neighboring SKUs even when available.

## TRADEOFFS

Coverage breadth is intentionally split from commerce depth. The 138 guided models are useful for safe checks but do not promise a purchasable part. The 25 purchase-ready revisions retain stricter complete-code evidence. The 24-model broad batch did not add any part or Shopify query because no exact revision-to-part evidence was established.

The 2026-08-28 URL sweep for the broad cohort returned 11 HTTP 200 responses, 11 protected HTTP 403 responses from manufacturer storefronts, and two Electrolux JavaScript timeouts. Browser/search review established identity; reachability status alone was not used as evidence.

The frozen original reconnaissance remains based on the 131-model baseline and is reproducible after later activations by excluding post-recon activation IDs.

## PHILOSOPHY

Clunk prefers honest guided coverage over fabricated purchase readiness. More models can be activated quickly when an existing brand/category/topology profile applies and an official identity source exists. Commerce can scale broadly through Shopify Global Catalog and storefront WebMCP, but only after Clunk has independently proven one exact SKU for one complete appliance revision.

Commit c72bf54 was pushed to origin/main. Verification at that commit passed TypeScript, ESLint, a production build, 59 unit/integration/UI tests, and 30 Playwright desktop/mobile tests. The unrelated local .impeccable/critique/ directory was deliberately excluded from the commit.