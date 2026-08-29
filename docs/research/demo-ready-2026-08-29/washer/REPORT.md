# Washer demo-readiness evidence review

Verified: 2026-08-29

## Outcome

- Current catalog: **56 washer identities** and **209/280 supported model × symptom pairs**.
- Reviewed: **71 remaining gaps**.
- Promotable to guided checks: **65**.
- Still blocked: **6**.
- Current purchase-ready baseline: **15/56 identities**.
- Reviewed every non-purchase-ready identity: **41** (30 family-only; 11 complete-code).
- New exact one-SKU fit proofs: **0**. New Shopify searches: **0**, because no identity passed the exact-fit gate.

## Promotable symptom rows

| Symptom             | Gaps | Promotable | Blocked |
| ------------------- | ---: | ---------: | ------: |
| will-not-drain      |    0 |          0 |       0 |
| door-will-not-close |   20 |         17 |       3 |
| will-not-start      |   17 |         16 |       1 |
| will-not-spin       |   17 |         16 |       1 |
| is-leaking          |   17 |         16 |       1 |

Promotable by brand: Amana 10, Electrolux 16, Frigidaire 1, GE 9, Hotpoint 8, LG 1, Maytag 19, Whirlpool 1.

## Blocked symptom rows

- `ge-gtw585bsvws__door-will-not-close` — The current exact GE support page did not expose a manual or model-applicable closure instruction. The older GTW/HTW manual does not name this family.
- `frigidaire-fffw5000qw__door-will-not-close` — No current Frigidaire primary front-load closure article or exact-family manual was located. The top-load E3 article is inapplicable.
- `hotpoint-htw2065sbww__door-will-not-close` — The exact current support page did not expose a manual or model-applicable closure guidance, and the current HTW240/HTW265 manual does not name HTW2065SBWW.
- `hotpoint-htw2065sbww__will-not-start` — The exact current support page did not expose a manual or model-applicable start guidance, and the current HTW240/HTW265 manual does not name HTW2065SBWW.
- `hotpoint-htw2065sbww__will-not-spin` — The exact current support page did not expose a manual or model-applicable spin guidance, and the current HTW240/HTW265 manual does not name HTW2065SBWW.
- `hotpoint-htw2065sbww__is-leaking` — The exact current support page did not expose a manual or model-applicable leak guidance, and the current HTW240/HTW265 manual does not name HTW2065SBWW.

No blocked row borrows evidence from a neighboring model, revision, topology, or brand.

## Purchase review

The 30 family-only identities stop at the complete-code gate. The 11 complete-code identities were reviewed individually; all remain blocked because the current evidence either names multiple pump SKUs, is for a different suffix, or does not provide an exact one-SKU map. Therefore Shopify seller discovery was neither eligible nor run. The row ledger contains each exact outcome and rejected nearby-revision evidence.

## Safety boundary

The proposed guided checks retain only visible observations, ordinary control-panel actions, and load redistribution. They exclude cabinet/panel removal, energized tests, breaker resets, latch bypass, appliance movement/leveling, hose disconnection/tightening, internal diagnosis, and repair instructions. Water near any electrical source is an immediate stop condition. Internal latch, drive, pump, seal, and wiring work remains professional-only.

## Integration note

`src/data/demoReady/washerSymptomCoverage.json` contains the 65 category-isolated, integration-ready rows. It is intentionally not wired into the shared catalog in this stream.
