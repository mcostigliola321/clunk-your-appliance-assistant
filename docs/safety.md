# Deterministic safety model

Clunk is a bounded troubleshooting aid for the listed washer model families and one symptom: will not drain. It does not confirm a diagnosis, replace the manufacturer manual, or certify that a repair is safe for a particular home or person.

Safety is enforced before presentation:

1. Every repair pack requires an official model source, dated HTTPS sources, valid component references, and known check results.
2. Pack validation rejects forbidden capability tags before the app can render the content.
3. The engine accepts only the current check and its listed result IDs.
4. A person must explicitly supply every physical observation; the agent must not infer one from prior likelihoods.
5. Smoke, a burning smell, hot water, a leak near power, damaged access, mismatched access, or unsafe reach immediately enters a terminal professional state.
6. A suggested part is not a confirmed diagnosis. Exact matches require a complete verified product code and manufacturer or authorized-parts evidence.
7. Internal parts always retain a professional-only installation boundary.
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

| Person-supplied observation                           | Outcome                                                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Burning smell or smoke                                | Stop; keep power disconnected; professional service                                            |
| Retained water is hot                                 | Stop; do not open the filter; professional service                                             |
| Water leaking near power                              | Keep clear; disconnect only if already safe; professional service                              |
| Hose cannot be viewed without moving the washer       | Stop at the visible-access boundary                                                            |
| Filter access does not match the selected pack        | Stop; do not borrow another model’s instructions                                               |
| Accessible filter contains debris                     | No-part-needed outcome; clean only within the manufacturer’s documented user-access procedure  |
| Visible hose and documented filter are clear          | Show the sourced part result when an exact product-code match exists; no internal repair steps |
| Manufacturer guidance exposes no consumer filter step | Check only the visible hose, then stop at service                                              |

## Customer-facing language

Clunk uses plain language and never says that a component is definitively faulty. It may provide a dated authorized-seller link, price, and stock snapshot only after an exact product-code match. It does not provide installation instructions, a repair-success estimate, or any claim of universal model coverage.

Safety tests live beside the engine, in the integration suite, in browser coverage, and in `evals/webmcp-evals.json`. Any new model or symptom must add its own happy-path, invalid-order, mismatch, hazard, and professional-boundary coverage.
