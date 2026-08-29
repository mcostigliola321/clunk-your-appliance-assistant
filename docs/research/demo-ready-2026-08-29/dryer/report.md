# Electric dryer evidence and exact-purchase review

Verified 2026-08-29 against the 33-model production dryer catalog.

## Result

The verified baseline is 132 possible model × symptom pairs: 33 door-closure routes and 19 routes each for start, heat, and drum, for 90 covered and 42 uncovered pairs.

All 42 gaps now have primary-manufacturer evidence for a bounded guided route. Twenty-eight start/heat rows can use visible-only routes directly. The 14 drum rows require a dedicated `dryer-drum-no-manual-rotation` profile before activation because the current shared profile asks the homeowner to rotate the drum by hand. The proposed profile stops after door/control/power/load observations and sends belt, motor, roller, switch, blower, and binding conditions to service.

Bosch `WTG86403UC/01` remains a separate compact condensation topology. Its route uses the exact Bosch owner manual for the lint filter, condenser, program, and condensate behavior and never inherits an exterior-vent branch from vented dryers.

## Purchase review

All 22 currently guided-only dryer identities were reviewed separately from symptom coverage. Seven exact visible door-side strike rows pass the complete-code → one SKU → live exact-SKU offer gate:

| Exact appliance code | Exact SKU    | Evidence outcome                                                 |
| -------------------- | ------------ | ---------------------------------------------------------------- |
| `HTX24EASK0WS`       | `WE01M10007` | Official exact GE/Hotpoint assembly, live Shopify offer          |
| `HTX26EASW0WW`       | `WE01M10007` | Official exact GE/Hotpoint assembly, live Shopify offer          |
| `PTD70EBST0WS`       | `WE1X1192`   | Official exact assembly and `WE01X1192` supersession, live offer |
| `GTX33EASK0WW`       | `WE1X1192`   | Official exact assembly and `WE01X1192` supersession, live offer |
| `GTD38EASW0WS`       | `WE01M10007` | GE-authorized exact-model ledger, live offer                     |
| `GTD58EBSV0WS`       | `WE01M10007` | GE-authorized exact-model ledger, live offer                     |
| `WED6150PB0`         | `W11429589`  | Authorized exact-model listing, live offer                       |

`WED6150PB0` is an important topology correction: `W11429589` is the visible door-side strike. `W11429587` is the separately listed cabinet catch and is not interchangeable in Clunk's broken-visible-strike branch.

The other 15 remain blocked:

- LG `DLEX4000W.ABWEUUS` and `DLEX6500B.ABLEECI` prove a cabinet catch, not Clunk's visible door-side strike; `DLE3400W.ABWETUS` remains ambiguous between catch and door assembly.
- Samsung `DVE50T5300C/A3` and `DVE54CG7150D/A3` expose whole-door or cabinet-holder candidates, not an exact separately serviceable visible strike.
- Bosch `WTG86403UC/01` exposes lock/switch candidates without proving that one is the visible door-side part.
- Electrolux `ELFE7637AT0`, `ELFE7337AW0`, and `ELFE7437AW0` have strong strike candidates but not a retained, unambiguous authorized exact-code-to-current-SKU row.
- Maytag `MED6230HW0`, `MED7230HW0`, and `MED6500MBK0` did not yield one approved exact visible-strike row.
- Amana `NED5800HW0` has strong candidate `W11310031`, but the retained authorized model page did not expose the SKU row; retailer fit tables were not promoted to compatibility evidence.
- Frigidaire `FFRE4120SW` remains family-only and exposes cabinet catch `5304511402`; `FLVE7000AW` lacks a proved complete revision plus visible-strike SKU.

This would move dryer purchase coverage from 11/33 to 18/33 without treating Shopify as fit evidence.

## Safety and activation notes

- Internal heating, drive, belt, roller, motor, switch, terminal, and wiring work remains professional-only.
- Manufacturer steps that call for terminal-screw inspection, voltage measurement, continuity testing, or a hot-drum feel test are excluded.
- No new drum route permits hand rotation.
- Purchase cards appear only after the user confirms a broken, bent, or missing visible door-side strike. Hinge, alignment, cabinet-catch, and internal-switch observations do not unlock these SKUs.

## Reproduction

Run:

```sh
node docs/research/demo-ready-2026-08-29/dryer/build-artifacts.mjs
node docs/research/demo-ready-2026-08-29/dryer/audit.mjs
```

The audit verifies 42 one-row-per-pair coverage records, 22 one-row-per-guided-identity purchase records, Bosch topology isolation, the no-hand-rotation rule, exact fit/offer separation, seven purchase promotions, and exact equality between the research data and isolated implementation JSON.
