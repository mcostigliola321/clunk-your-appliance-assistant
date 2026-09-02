# Architecture

Clunk's customer experience is a static React application with no app-side model call. A compatible browser agent discovers tools registered by the page and invokes them locally against the same state as the visible controls. Lovable also deploys a stateless, read-only remote MCP adapter as a Supabase Edge Function; it reuses the same catalog and deterministic repair engine but does not share a browser session. Purchase-ready browser outcomes can make one optional request to Shopify Global Catalog for current exact-SKU offers; diagnosis and compatibility remain deterministic if that request fails. No private credential is stored or sent.

```text
Human control ─┐
               ├─> invokeTool(name, input, source) ─> deterministic engine ─> shared repair state ─> UI
WebMCP call ───┘                                      │
                                                      └─> accepted/rejected activity event

catalog entry ─> validated repair pack ─> checks, causes, sources, components, part boundary
                                                       │
                                                       └─> exact SKU ─> Shopify UCP live offers

Remote MCP client ─> generated Supabase MCP adapter ─> same catalog + deterministic engine
```

## Layers

- `src/data/applianceCatalog.ts` composes the bounded 163-model catalog: 50 milestone entries plus 113 schema-validated expansion entries. It keeps explicit capability tiers, official source references, category/profile metadata, exact part mappings, and dated Shopify UCP query descriptors. `src/data/catalogExpansion.ts` validates revision isolation and materializes the compact expansion data. `src/data/purchaseCoverageExpansion.ts` overlays 42 separately reviewed exact revisions, and `src/data/demoReadyPurchaseExpansion.ts` adds 17 later complete-revision paths. Both layers reject an unknown or sibling revision, an unapproved compatibility host, a checks profile outside the reviewed route, a wrong-category component, an unproved SKU, or a zero-offer commerce descriptor before repair-pack generation.
- `src/data/symptomCatalog.ts` defines the visible problem families and category scope. `src/data/symptomCoverageExpansion.json` records 91 exact door-closure rows, while `src/data/broadSymptomCoverage.json` records 303 exact rows for the 12 formerly thin routes. Each ledger keeps category, topology/load style, primary troubleshooting source IDs, model-page feature corroboration, applicability, feature exceptions, safe checks, professional boundaries, unresolved gaps, and verification date. Their TypeScript validators materialize coverage only after the exact row passes; model identity and symptom coverage remain separate claims.
- `src/data/modelNumberGuides.ts` contains manufacturer-backed common rating-label locations, identifier examples, and retrieval dates. The UI renders these as original Clunk diagrams rather than copied manufacturer artwork.
- `src/domain/modelSearch.ts` normalizes case and punctuation, ranks partial suggestions, exposes family/revision ambiguity, and rejects text explicitly labeled as a serial number. It never uses reverse containment to turn extra unsupported text into a match.
- `src/domain/repairPack.ts` resolves model × symptom coverage into schema-v6 repair packs and validates separate model/pack identities, symptom-specific capability tiers, source links, result transitions, part evidence, static/live commerce handoffs, component/cause references, and forbidden safety tags.
- `src/domain/shopifyCatalog.ts` calls Shopify Global Catalog's `search_catalog` tool over UCP and admits only available offers whose listing contains the exact normalized SKU. Without configuration it uses organic results. With a validated public saved-catalog identifier it requests the `affiliate` placement, parses placement metadata, and preserves a promoted variant's attributed `url` exactly. It never selects the SKU or changes the repair outcome.
- `src/domain/engine.ts` is the only transition engine. It handles catalog search, exact selection, checks, observations, part outcomes, refusals, and escalation.
- `src/domain/selectors.ts` derives the full visible snapshot, a compact current-task WebMCP output, and the tools that are valid for the current state.
- `src/state/RepairProvider.tsx` owns current state and exposes one synchronous action layer to both UI controls and WebMCP callbacks. Versioned persistence migrates the prior single-symptom shape, rejects malformed or oversized local state, validates phases, and bounds undo history.
- `src/webmcp/contracts.ts` is the bounded public tool catalog used by registration, tests, eval fixtures, and the visible inspector.
- `src/webmcp/registerTools.ts` contains eight literal imperative registrations, state-dependent registration, structured results, feature detection, and `AbortController` lifecycle cleanup.
- `src/lib/mcp` defines five stateless remote tools for catalog search, coverage, guide retrieval, diagnosis replay, and model-label guidance. Each has bounded Zod inputs, a concrete output schema, and read-only/idempotent/closed-world annotations.
- `@lovable.dev/mcp-js` generates `.lovable/mcp/manifest.json` and `supabase/functions/mcp/index.ts`. The manifest is the platform registration contract; the edge bundle is generated and must not be hand-edited. CI fails when either generated artifact drifts from its source.
- `src/components` renders category/model discovery, original appliance location guides, next checks, evidence, source links, activity, compatibility outcomes, and accessible live-offer states. Components do not contain diagnosis or fit rules.
- `evals/webmcp-evals.json` stores deterministic scenario fixtures with exact expected calls, visible results, and prohibited behavior. It does not record probabilistic agent-evaluation results.

## State-dependent WebMCP

Clunk does not expose every mutation at every moment. At catalog state, an agent can read state, search, and select. After selection it can start the diagnosis. During a check it can read, focus a component, record an observation, or stop. A part lookup appears only after the visible evidence boundary is reached.

`RepairProvider` replaces the active registration group when that valid inventory changes and aborts the prior group. This makes the protocol surface itself communicate sequencing instead of relying only on tool descriptions. The main UI mirrors the transition from `record_observation` to `find_compatible_part` so the handoff is visible without opening the inspector.

Catalog-state structured output also carries the truthful category/tier counts, query status, suffix ambiguity, capability labels, and a concise `modelNumberHandoff`. The agent can ask the person to inspect the same common label locations shown on screen, but only the person supplies the text. The existing eight-tool surface is sufficient; model discovery did not add a ninth tool.

The catalog currently contains 163 identities and classifies all 782 possible model × symptom pairs: 766 are supported and 16 stop explicitly. Eighty-four pairs are purchase-ready and 682 provide guided checks. The 84 identities with at least one purchase-ready route are 15 washers, 23 dishwashers, 18 dryers, and 28 refrigerators. The homepage shows at most four common problems and places a fifth checked route under **More problems**; this layout never grants coverage to an unlisted model × symptom pair.

An exact part outcome also carries a narrow `commerceHandoff`: Shopify's endpoint, protocol, query, exact SKU, agent profile, and the rule forbidding nearby-SKU substitution. This lets a browser agent explain the same Clunk-verifies-fit/person-reviews-seller baton pass visible on the page without adding a redundant ninth tool.

## One engine, four control paths

Normal buttons, labeled one-click example fixtures, the visible manual inspector, and browser-agent calls all invoke `executeRepairTool`. Mutating actions return the next state and a visible activity event. `get_repair_state` is genuinely read-only and returns compact current-task structured content at the WebMCP boundary. Example fixtures are sequences of existing public actions, not pre-rendered outcomes. A rejected call is also logged but cannot advance progress.

The agent never receives a hidden repair database or privileged action. It can only operate the state the person can see.

## Evidence boundary

Catalog search normalizes case and punctuation to rank exact codes, families, prefixes, and contained partials; it never performs reverse containment or nearest-neighbor guessing. Selection is always by a stable catalog ID, while exact compatibility still requires a complete verified code. Part results are separate states:

- no part needed after a cleanable blockage;
- exact only when a full verified code maps to source-backed part evidence;
- variant needed when a family lacks sufficient revision detail;
- professional only when the visible checks end without a safe consumer action.

For the exact state, compatibility and commerce are deliberately separated. Manufacturer or authorized-parts evidence maps the full appliance code to an exact SKU. Shopify Global Catalog then searches current cross-merchant listings for that SKU. Clunk strips every unavailable, malformed, non-HTTPS, duplicate, or nearby-SKU result before rendering at most five seller rows. Merchant “OEM” and “compatible” text is disclosed as a listing claim, not upgraded into Clunk evidence.

## Progressive enhancement

When `document.modelContext` is present, Clunk registers the currently valid tools and reports ready, partial, or failed status. When it is absent, the app reports manual mode and remains fully usable. The judge inspector uses the same public action layer; it is not a mock diagnosis.

## Static customer app, narrow remote adapter

The browser build is static HTML, CSS, JavaScript, JSON, and local font files. It has no database, authentication, payment handling, model SDK, or secret. Its only live request is the optional keyless Shopify catalog lookup on an exact outcome. Results use `no-store`, are not persisted, and degrade to an honest retry/no-offer state without weakening the source-backed compatibility result.

The remote MCP Edge Function is deliberately narrower than the browser experience: it is anonymous because it reads only public, repository-owned data; it has no database calls, external network calls, persistence, commerce lookup, or mutation; and it reconstructs diagnosis state inside each request. Supabase's legacy JWT gate is disabled specifically for this anonymous MCP function. See [`remote-mcp.md`](./remote-mcp.md) and [`shopify-ucp-integration.md`](./shopify-ucp-integration.md).
