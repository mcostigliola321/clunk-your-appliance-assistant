# Deterministic safety model

Clunk is a bounded troubleshooting aid for explicitly listed washer, dishwasher, electric-dryer, and refrigerator model × symptom combinations. A supported model does not imply support for every problem. Clunk does not confirm a diagnosis, replace the manufacturer manual, or certify that a repair is safe for a particular home or person.

Safety is enforced before presentation:

1. Every repair pack requires an official model source, dated HTTPS sources, valid component references, and known check results.
2. Pack validation rejects forbidden capability tags before the app can render the content.
3. The engine accepts only the current check and its listed result IDs.
4. A person must explicitly supply every physical observation; the agent must not infer one from prior likelihoods.
5. Smoke, a burning smell, hot water, a leak near power, damaged access, mismatched access, or unsafe reach immediately enters a terminal professional state.
6. A suggested part is not a confirmed diagnosis. Exact matches require a complete verified product code and manufacturer or authorized-parts evidence.
7. Internal parts always retain a professional-only installation boundary. Only explicitly visible consumer parts, such as the dryer door strike and refrigerator water filter, may be labeled user-replaceable. A shared filter identity still requires an exact revision-specific manufacturer or authorized evidence row before a purchase action appears.
8. Invalid and out-of-order calls are visibly logged as rejected without advancing the diagnosis.

## Never in scope

- Gas work
- Mains or high-voltage tests
- Energized diagnostics
- Refrigerant or sealed-compressor work
- Protection or interlock bypasses
- Internal wiring or control-board repair
- Panel removal
- Pump removal or installation instructions
- Instructions intended only for professionals

The original diagram may identify an internal component to explain why service is recommended. Identification never unlocks an instruction for that component.

## Deterministic outcomes

| Person-supplied observation                                           | Outcome                                                                                        |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Burning smell or smoke                                                | Stop; keep power disconnected; professional service                                            |
| Retained water is hot                                                 | Stop; do not open the filter; professional service                                             |
| Water leaking near power                                              | Keep clear; disconnect only if already safe; professional service                              |
| Hose cannot be viewed without moving the washer                       | Stop at the visible-access boundary                                                            |
| Filter access does not match the selected pack                        | Stop; do not borrow another model’s instructions                                               |
| Accessible filter contains debris                                     | No-part-needed outcome; clean only within the manufacturer’s documented user-access procedure  |
| Visible hose and documented filter are clear                          | Show the sourced part result when an exact product-code match exists; no internal repair steps |
| Manufacturer guidance exposes no consumer filter step                 | Check only the visible hose, then stop at service                                              |
| Dishwasher filter area contains loose safe debris                     | No-part-needed outcome; never reach into the pump opening                                      |
| Dryer’s visible door strike is cracked or missing                     | Show an exact strike only after the complete model match; no front-panel removal               |
| Refrigerator filter is old or shows Replace                           | Show an exact user-replaceable filter after the complete model match                           |
| Refrigerator filter is recent or its housing leaks                    | Stop at service; no valve, refrigerant, compressor, or sealed-system instructions              |
| Washer door/lid is visibly obstructed                                 | Remove only loose clothing/debris, wipe the visible contact, close once without force          |
| Washer door/lid is locked, damaged, or still will not close           | Stop; no lock bypass, hinge/strike adjustment, wiring, or internal access                      |
| Dishwasher rack/loading blocks the door                               | Correct only visible loading and rack position, then close once without force                  |
| Dishwasher door contacts cabinetry or still will not close            | Stop; no leveling, mounting-hardware, hinge, spring, latch, or open-dry adjustment             |
| Refrigerator food/bin/shelf blocks closure or gasket is visibly dirty | Clear the path or use mild soapy water on the visible gasket; monitor food safety              |
| Refrigerator door, gasket, hinge, flap, or alignment is damaged       | Stop; do not move or level the refrigerator or infer a replacement part                        |

## Customer-facing language

Clunk uses plain language and never says that a component is definitively faulty. It may provide a dated authorized-seller link, price, and stock snapshot only after an exact product-code match. It does not provide installation instructions, a repair-success estimate, or any claim of universal model coverage.

Safety tests live beside the engine, in the integration suite, in browser coverage, and in `evals/webmcp-evals.json`. The door-closure profiles deliberately omit brand- or feature-specific actions that are not common to every activated cohort: no lock bypass, alignment, leveling, hinge work, dishwasher AutoRelease/open-dry manipulation, or French-door mullion instruction. The 12 broadened symptom profiles use the same intersection rule: no washer filter or leveling generalization, dishwasher filter/panel/installation work, dryer terminal or internal-drive access, refrigerator reset sequence, refrigerant work, or feature-specific control sequence. Top-load and front-load washer nouns/actions are selected separately, ventless dryers are excluded from the heat cohort, and refrigerator water/ice routes require an exact factory-feature gate. Any new model or symptom must add its own happy-path, invalid-order, mismatch, hazard, and professional-boundary coverage.

The 2026-08-29 LG purchase cohort does not expand the action boundary. `AHA75673404` is an internal washer pump and remains professional-only after the external hose check. `4026EL3007C` is shown only after the person reports damage to the visible door-side hook on one of two exact revisions; an intact hook, cabinet catch, hinge, alignment issue, hot door, or damaged panel still stops at professional service. Authorized part evidence changes the purchase handoff, never the safety instructions.
