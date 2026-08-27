# Architecture

Clunk is a static React application with no runtime service dependency and no app-side model call. A compatible browser agent discovers tools registered by the page and invokes them locally against the same state as the visible controls.

```text
Human control ─┐
               ├─> invokeTool(name, input, source) ─> deterministic engine ─> shared repair state ─> UI
WebMCP call ───┘                                      │
                                                      └─> accepted/rejected activity event

catalog entry ─> validated repair pack ─> checks, causes, sources, components, part boundary
```

## Layers

- `src/data/applianceCatalog.ts` contains the bounded 31-model catalog, official source references, category/profile metadata, and the small set of exact part mappings with supporting evidence.
- `src/domain/repairPack.ts` converts catalog entries into schema-v3 repair packs and validates IDs, source links, result transitions, part evidence, component/cause references, and forbidden safety tags.
- `src/domain/engine.ts` is the only transition engine. It handles catalog search, exact selection, checks, observations, part outcomes, refusals, and escalation.
- `src/domain/selectors.ts` derives the full visible snapshot, a compact current-task WebMCP output, and the tools that are valid for the current state.
- `src/state/RepairProvider.tsx` owns current state and exposes one synchronous action layer to both UI controls and WebMCP callbacks.
- `src/webmcp/contracts.ts` is the bounded public tool catalog used by registration, tests, eval fixtures, and the visible inspector.
- `src/webmcp/registerTools.ts` contains eight literal imperative registrations, state-dependent registration, structured results, feature detection, and `AbortController` lifecycle cleanup.
- `src/components` renders category/model discovery, original appliance location guides, next checks, evidence, source links, activity, and compatibility outcomes. Components do not contain diagnosis rules.
- `evals/webmcp-evals.json` stores deterministic scenario fixtures with exact expected calls, visible results, and prohibited behavior. It does not record probabilistic agent-evaluation results.

## State-dependent WebMCP

Clunk does not expose every mutation at every moment. At catalog state, an agent can read state, search, and select. After selection it can start the diagnosis. During a check it can read, focus a component, record an observation, or stop. A part lookup appears only after the visible evidence boundary is reached.

`RepairProvider` replaces the active registration group when that valid inventory changes and aborts the prior group. This makes the protocol surface itself communicate sequencing instead of relying only on tool descriptions. The main UI mirrors the transition from `record_observation` to `find_compatible_part` so the handoff is visible without opening the inspector.

## One engine, four control paths

Normal buttons, labeled one-click example fixtures, the visible manual inspector, and browser-agent calls all invoke `executeRepairTool`. Mutating actions return the next state and a visible activity event. `get_repair_state` is genuinely read-only and returns compact current-task structured content at the WebMCP boundary. Example fixtures are sequences of existing public actions, not pre-rendered outcomes. A rejected call is also logged but cannot advance progress.

The agent never receives a hidden repair database or privileged action. It can only operate the state the person can see.

## Evidence boundary

Catalog search can find a supported family; selection is always by its stable catalog ID. Product-code normalization removes punctuation only for exact comparison, never to choose a nearest model. Part results are separate states:

- no part needed after a cleanable blockage;
- exact only when a full verified code maps to source-backed part evidence;
- variant needed when a family lacks sufficient revision detail;
- professional only when the visible checks end without a safe consumer action.

## Progressive enhancement

When `document.modelContext` is present, Clunk registers the currently valid tools and reports ready, partial, or failed status. When it is absent, the app reports manual mode and remains fully usable. The judge inspector uses the same public action layer; it is not a mock diagnosis.

## No hidden backend

The production build is static HTML, CSS, JavaScript, and local font files. There is no database, authentication, server function, payment flow, model SDK, environment variable, secret, or runtime dependency on the source sites.
