# Category expansion plan

Clunk’s tool layer is already appliance-neutral: an agent searches supported appliances, selects a repair pack, reads shared state, focuses a component, records a person-supplied observation, resolves a part outcome, or stops. The current implementation proves two visual and topology variants inside washers. Expanding beyond washers is primarily an evidence, safety, and content-model job—not a WebMCP rewrite.

## Honest effort

| Expansion                    | Credible submission slice                                                                  | Engineering effort | Main work                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Dishwashers                  | One symptom (`will-not-drain`), 4–6 common model families                                  | 2–3 focused days   | New cutaway and hotspots; filter, sump, and drain-hose checks; leak and hot-water boundaries; model/part research; tests            |
| Refrigerators                | One safe symptom such as `water-dispenser-slow` or `ice-maker-not-producing`, 4–6 families | 4–6 focused days   | New visual system; water-filter, inlet, and external-temperature observations; much stricter category safety; parts evidence; tests |
| Broad multi-symptom coverage | Several symptoms across all three categories                                               | 2–4 weeks          | Source curation, safety review, category-specific state paths, compatibility maintenance, and much larger evaluation coverage       |

Dishwashers are the natural next category because the no-drain reasoning pattern transfers: make safe, inspect the visible drain path, check only manufacturer-documented user-accessible filters, and stop before internal pumps or wiring.

Refrigerators are deliberately narrower. Clunk should not diagnose sealed-system cooling, refrigerant, compressor, start-device, control-board, or live electrical faults. A first refrigerator pack should focus on a safe consumer-maintenance job such as an exact water-filter match, dispenser flow, door-seal observation, or ice-maker setup, with immediate professional escalation for cooling-system symptoms.

## Architecture work before category two

1. Replace washer-specific TypeScript unions with namespaced string IDs validated by each repair pack.
2. Add `category`, `format`, `symptoms`, and a visual manifest containing an original asset plus component hotspot coordinates.
3. Move cause scoring from the washer-specific diagnosis module into per-symptom deterministic rules.
4. Add category safety profiles so refrigerator refrigerant and sealed-system bans, and dishwasher heat and leak boundaries, are structural.
5. Keep the current eight WebMCP tools. Their inputs become pack-derived enums; no new tool is needed merely because the appliance category changes.
6. Preserve the purchase object as an optional exact-part result with a dated seller snapshot and human-controlled checkout handoff.

## Recommended sequence

1. Ship and record the washer submission with front-load, top-load, no-part, exact-part purchase handoff, and safety-stop proof.
2. Generalize IDs and visual manifests without changing the visible washer behavior.
3. Add a small dishwasher no-drain catalog as the second category.
4. Add a refrigerator water-filter or ice-maker flow only after its safety profile and evidence ledger pass review.

This sequence reserves broad appliance optionality while keeping the hackathon demo understandable in under three minutes.
