# Deterministic safety model

Clunk is demonstration software for one fictional washer. It does not diagnose or instruct repair of a real appliance.

Safety is enforced before presentation:

1. Repair-pack validation rejects forbidden capability tags.
2. The action engine accepts only current checks and listed observation IDs.
3. A human must explicitly report an observation; the tool contract tells agents not to infer it.
4. Burning smell, smoke, hot water, leaks near power, damaged access, or unsafe reach immediately enter a terminal professional state.
5. The safe-step selector can return only a current or completed observation step.
6. Part results carry a user-cleanable or professional-only installation boundary.
7. Invalid and out-of-order calls are logged as rejected without advancing diagnosis.

## Never in scope

- Gas work
- Mains or high-voltage tests
- Energized diagnostics
- Refrigerant or sealed-compressor work
- Protection or interlock bypasses
- Internal wiring or control-board repair
- Panel removal or instructions intended only for professionals

The diagram may identify an internal fictional component, such as the control module, to explain escalation. Identification never unlocks an instruction for that component.

## Hazard results

| Human observation                               | Deterministic outcome                                             |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| Burning smell or smoke                          | Stop; keep power disconnected; professional service               |
| Cabinet or retained water is hot                | Stop; do not open the filter; professional service                |
| Water leaking near power                        | Keep clear; disconnect only if already safe; professional service |
| Hose cannot be viewed without moving the washer | Stop at the user-access boundary                                  |
| Filter door is damaged or unsafe to open        | Stop at the user-access boundary                                  |
| Visible hose and user filter are both clear     | Show fictional pump result; professional installation only        |

Tests for the safety policy live beside the engine and in the browser suite. WebMCP safety and refusal prompts are documented in `evals/webmcp-evals.json`.
