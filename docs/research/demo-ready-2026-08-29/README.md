# Clunk demo-ready evidence release — 2026-08-29

## Release outcome

This release preserves all 163 catalog identities and classifies every one of the 782 model × symptom pairs. It activates 209 newly evidenced guided routes and 17 newly evidenced exact-purchase paths without allowing model identity, neighboring revisions, or seller results to substitute for compatibility evidence.

| Category       |  Models | Supported pairs | Total pairs | Purchase-ready models | Explicit unsupported pairs |
| -------------- | ------: | --------------: | ----------: | --------------------: | -------------------------: |
| Washer         |      56 |             274 |         280 |                    15 |                          6 |
| Dishwasher     |      33 |             165 |         165 |                    23 |                          0 |
| Electric dryer |      33 |             132 |         132 |                    18 |                          0 |
| Refrigerator   |      41 |             195 |         205 |                    28 |                         10 |
| **Total**      | **163** |         **766** |     **782** |                **84** |                     **16** |

The remaining unsupported routes are evidence decisions, not implementation omissions. Six washer rows lack sufficiently exact, topology-safe manufacturer support. Ten refrigerator rows are the leak and no-ice routes for five Bosch E-Nr identities; current Bosch US evidence did not support the shared visible-check profiles. Every unsupported row carries a reason in the catalog audit.

## Reproducible artifacts

- `catalog-audit.json` is the machine-readable release summary and contains all 163 identities and 782 pair decisions.
- `model-symptom-audit.csv` is the reviewer-friendly pair ledger, including evidence URLs, capability, exact-part chain, seller descriptor, and missing-evidence reason.
- `washer/`, `dishwasher/`, `dryer/`, and `refrigerator/` preserve the category research, source audits, promotion decisions, and blockers.
- `src/data/demoReadyCoverage.json` normalizes the 156 washer, dishwasher, and dryer guided rows supplied by the category reviews. Refrigerator additions use the existing broad and closure ledgers.
- `src/data/demoReadyPurchaseExpansion.json` normalizes the 17 newly accepted complete-revision → exact-SKU → observed-offer chains.

Regenerate and verify the release with:

```sh
npm run generate:demo-ready-coverage
npm run generate:demo-ready-purchase
npm run audit:coverage
npm run audit:purchase
```

The generators validate exact catalog identities, expected category counts, unique model × symptom decisions, source presence, exact revision-to-SKU applicability, and a separately recorded seller offer. Generated JSON is formatted deterministically, so regeneration is compatible with the repository formatting gate.

## Safety and commerce boundary

Guided coverage uses current primary manufacturer troubleshooting and only the common low-risk visible observations supported for each explicit model row. The dryer drum route now keeps hands clear of the drum, removes manual-rotation diagnosis, and stops at professional service when a normal load does not explain the failure.

Purchase-ready status requires all of the following: a complete product revision, one exact manufacturer SKU, primary or authorized compatibility evidence applying to that revision, and a separately observed exact-SKU seller offer. Shopify results prove only that an offer was observed; they never prove appliance fit. The 84 accepted purchase paths are intentionally below the aspirational 145-model target because no unsupported inference was used to close the gap.

## Verification

The local release gate passed on 2026-08-29: strict TypeScript, ESLint, Prettier, 110 unit/integration/WebMCP tests, production build, 54 desktop/mobile Playwright journeys, and `npm audit --audit-level=moderate` with zero vulnerabilities. A fresh-context verifier also passed against the local production preview, including visible counts, one supported Bosch cooling route, one explicitly unsupported Bosch leak route, and byte-for-byte equality between the served and local production JavaScript asset.

The public deployment result is recorded separately in `live-deployment-verification.json` only after the connected Lovable deployment serves the exact locally built asset.
