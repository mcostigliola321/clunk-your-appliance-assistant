# Architecture

Clunk is a static React application with no runtime service dependency. It does not call a model. A compatible browser or in-browser agent discovers the tools that the page registers and invokes them locally against the same state as the visible controls.

```text
Human control ─┐
               ├─> invokeTool(name, input, source) ─> deterministic engine ─> shared repair state ─> UI
WebMCP call ───┘                                      │
                                                      └─> accepted/rejected activity event
```

## Layers

- `src/data/clunk-wm01.json` contains original fictional appliance content.
- `src/domain` validates the pack, enforces safety, executes transitions, ranks causes, matches parts, and derives serializable snapshots.
- `src/state/RepairProvider.tsx` owns current state and exposes one synchronous action layer. A ref guarantees that browser callbacks receive current state without re-registering tools after every render.
- `src/webmcp/contracts.ts` is the bounded public catalog used by both registration and the visible inspector.
- `src/webmcp/registerTools.ts` contains the eight literal imperative registrations, feature detection, structured results, and AbortController lifecycle.
- `src/components` renders the repair bench. Components do not contain diagnosis rules.
- `evals/webmcp-evals.json` documents agent prompts, exact expected calls, visible results, and prohibited behavior.

## Why imperative WebMCP

The repair workflow is stateful and includes visualization-only, observation, lookup, and safety-stop actions. Imperative registration gives each behavior an explicit name and bounded JSON Schema while keeping execution inside existing page logic.

## Progressive enhancement

When `document.modelContext` is present, Clunk registers eight tools and reports ready, partial, or failed status. When it is absent, the app reports manual mode and remains fully usable. The judge inspector calls the same public action layer with a `manual` activity source; it is not a second implementation.

## No hidden backend

The production build is static HTML, CSS, JavaScript, and local font files. There is no database, authentication, server function, payment flow, analytics requirement, model SDK, environment variable, or secret.
