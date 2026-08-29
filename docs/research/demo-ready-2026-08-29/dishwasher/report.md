# Dishwasher demo-readiness research

Verified 2026-08-29. This is an isolated research and implementation-candidate bundle; it does not modify the live catalog, shared evidence registries, or repair-pack wiring.

## Result

- Dishwasher identities: **33**
- Baseline purchase-ready identities: **14**
- Baseline guided-only identities: **19**
- Supported model × symptom pairs before this pass: **116 / 165**
- Remaining pairs reviewed: **49**
- Guided-check rows supported by current primary manufacturer evidence: **49**
- Unsupported rows among the 49: **0**
- Supported pairs if the isolated rows are integrated: **165 / 165**
- Guided-only identities reviewed for purchase readiness: **19 / 19**
- Exact-revision compatibility candidates: **9 identities**, representing **7 exact SKUs**
- Blocked purchase identities: **10**
- Exact SKUs with an available Shopify Global Catalog result: **7 / 7**
- Purchase-ready count if all nine candidates are integrated: **23 / 33**

The 49 symptom additions remain guided checks. They do not create a part diagnosis or purchase recommendation. Each record is limited to external observations such as loading, visible obstruction, normal controls, an already-visible supply hose/valve, visible seal debris, oversudsing, and leak stop conditions. Panel removal, appliance movement, energized testing, internal diagnosis, and component replacement remain professional-only.

## Symptom closure

The baseline had all 33 drain routes, 21 cleaning routes, 21 fill routes, 21 leak routes, and 20 door-closure routes. The isolated proposal adds:

| Symptom          | Baseline | Added | If integrated |
| ---------------- | -------: | ----: | ------------: |
| Won't drain      |       33 |     0 |            33 |
| Not cleaning     |       21 |    12 |            33 |
| Won't fill       |       21 |    12 |            33 |
| Is leaking       |       21 |    12 |            33 |
| Door won't close |       20 |    13 |            33 |

Every one of the 49 rows has an explicit manufacturer symptom source, an identity-only model source, an applicability statement, and a named safety profile in `model-symptom-audit.json`. No row transfers evidence from a corporate sibling or neighboring model.

## Exact-revision purchase candidates

| Catalog identity      | Accepted complete code | Exact drain-pump SKU | Fit evidence                                                                      |
| --------------------- | ---------------------- | -------------------- | --------------------------------------------------------------------------------- |
| Bosch SHPM65Z55N/20   | `SHPM65Z55N/20`        | `00631200`           | Bosch exact E-Nr spare-parts page and Bosch part page                             |
| KitchenAid KDTM404KPS | `KDTM404KPS0`          | `W11412291`          | Whirlpool-authorized exact-model pump page                                        |
| Amana ADB1400AGW      | `ADB1400AGW0`          | `W10876537`          | Whirlpool-authorized exact-model pump page                                        |
| GE GDT550PYRFS        | `GDT550PYR0FS`         | `WD19X25461`         | GE exact-revision diagram, item 325                                               |
| Hotpoint HDF310PGRWW  | `HDF310PGR3WW`         | `WD19X25461`         | GE Appliances exact-revision diagram, item 325                                    |
| GE GDT225SSLSS        | `GDT225SSL0SS`         | `WD19X24651`         | GE exact-revision diagram, item 325                                               |
| Whirlpool WDF331PAMS  | `WDF331PAMS0`          | `W10724439`          | Whirlpool repair-parts list W11637950 Rev. A, item 8                              |
| Whirlpool WDT540HAMZ  | `WDT540HAMZ1`          | `W10876537`          | Whirlpool-authorized exact-model pump page; revision 0 is explicitly not promoted |
| Maytag MDB8959SKZ     | `MDB8959SKZ1`          | `W11497943`          | Whirlpool-authorized exact-model pump page                                        |

The WDF331PAMS0 result is intentionally `W10724439`, exactly as named by Whirlpool's revision-specific parts list. The candidate does not substitute `W10876537` from a neighboring or reseller-only result.

## Purchase blockers

| Identity                | Exact revision reviewed | Blocker                                                                                                                   |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| GE GDF670SYVFS          | `GDF670SYV0FS`          | No retrievable primary manufacturer exact-revision drain-pump row was observed; third-party corroboration was rejected.   |
| LG LDFN4542S            | `LDFN4542S.ASSESNA`     | Exact identity is known, but manufacturer/authorized results do not isolate one unambiguous drain-pump SKU.               |
| Frigidaire FDPH4316AS   | —                       | No complete PNC/revision is verified.                                                                                     |
| LG LDFN3432T            | `LDFN3432T.ASTEEUS`     | Exact identity is known, but manufacturer/authorized results do not isolate one unambiguous drain-pump SKU.               |
| LG LDTH7972S            | `LDTH7972S.ASSESNA`     | Generic pump results do not resolve the drain role and conflict with the observed drain route.                            |
| Frigidaire FDPC4314AS   | —                       | No complete PNC/revision is verified.                                                                                     |
| Electrolux EDSH4944AS   | —                       | No complete PNC/revision is verified.                                                                                     |
| Samsung DW80CG5450SR/AA | `DW80CG5450SR/AA`       | Exact identity is known, but manufacturer/authorized evidence does not resolve one drain-pump SKU without role ambiguity. |
| GE GDP670SGVWW          | `GDP670SGV0WW`          | No retrievable primary manufacturer exact-revision drain-pump row was observed; neighboring GDP models were rejected.     |
| LG LDPS6762S            | `LDPS6762S.ASSESNA`     | Exact identity is known, but manufacturer/authorized results do not isolate one unambiguous drain-pump SKU.               |

No Shopify search was performed for a blocked identity. Commerce was queried only for the seven SKUs that first passed exact compatibility review.

## Live commerce audit

The Shopify UCP audit used `search_catalog` with `available=true`, US shipping, US currency, a limit of 20, and exact normalized SKU matching. It retained counts and identifiers only; no seller, price, product, or checkout payload was cached.

| Exact SKU    | Exact variants | Exact available variants | Rejected neighbor variants |
| ------------ | -------------: | -----------------------: | -------------------------: |
| `00631200`   |             20 |                       19 |                          0 |
| `W10724439`  |             11 |                       11 |                          9 |
| `W10876537`  |             20 |                       20 |                          0 |
| `W11412291`  |              7 |                        7 |                         13 |
| `W11497943`  |              8 |                        8 |                         12 |
| `WD19X24651` |              3 |                        3 |                         17 |
| `WD19X25461` |             20 |                       20 |                          0 |

Catalog presence is commerce evidence only. It never establishes model compatibility, and it does not relax the professional-only replacement boundary.

## Reproduction

Run the scoped validator from the repository root:

```sh
npx tsx docs/research/demo-ready-2026-08-29/dishwasher/audit-dishwasher.ts
```

Add `--urls` to refresh symptom-source reachability or `--shopify` to refresh the exact-SKU aggregate audit. The script fails if the current catalog no longer has exactly 33 dishwasher identities, 116 baseline pairs, 49 gaps, or 19 guided-only identities, or if the explicit record sets drift from those baselines.

## Files

- `model-symptom-audit.json` — complete 49-row structured evidence proposal
- `model-symptom-audit.csv` — compact 49-row review table
- `purchase-readiness-audit.json` — all 19 guided-only identities and exact-revision outcomes
- `shopify-offer-audit.json` — live exact-SKU aggregate results
- `source-url-audit.json` and `source-audit.md` — primary symptom-source audit
- `audit-dishwasher.ts` — scoped generator and validator
- `src/data/demoReady/dishwasherSymptomCoverage.json` — isolated implementation candidate
- `src/data/demoReady/dishwasherPurchaseCandidates.json` — isolated nine-row purchase candidate set
