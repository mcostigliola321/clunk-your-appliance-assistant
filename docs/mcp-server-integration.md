# Remote MCP server integration

Clunk has a second, stateless agent surface in addition to its in-page WebMCP tools. The remote MCP source lets an external MCP client search the public appliance catalog, inspect exact model/problem coverage, retrieve bounded repair checks, replay observations through Clunk's deterministic engine, and find a model-number label without loading the browser UI.

This integration is **present in source but not release-ready**. As of September 2, 2026:

| Check                      | Result                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool source                | Present in `src/lib/mcp/` with five tool definitions.                                                                                       |
| Generated manifest         | Present at `.lovable/mcp/manifest.json`; declares protocol path `/functions/v1/mcp` and no authentication.                                  |
| Edge Function bundle       | Present at `supabase/functions/mcp/index.ts`.                                                                                               |
| Public endpoint            | Not deployed; the configured Supabase project returned `404 Requested function was not found`.                                              |
| Repository gate            | Failing at TypeScript before tests because of generated MCP tool-definition variance errors and indexed environment-variable access errors. |
| Real MCP client evaluation | Not run.                                                                                                                                    |

Do not describe this surface as live until the build is green, the Edge Function is deployed, and a real MCP client has completed the verification sequence below.

## How it differs from WebMCP

| In-page WebMCP                                                              | Remote MCP server                                                                 |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Eight state-dependent `document.modelContext` tools.                        | Five stateless tools defined with `@lovable.dev/mcp-js`.                          |
| Shares the browser page's current repair state and visible activity log.    | Creates a fresh engine state inside `run_diagnosis`; no session is persisted.     |
| Can focus the visible diagram and mutate the same state as person controls. | Returns structured catalog, guide, transcript, and outcome data to an MCP client. |
| Progressive enhancement; manual mode remains available without it.          | Separate Supabase Edge Function deployment.                                       |
| Established automated browser coverage.                                     | Newly generated integration with release blockers still open.                     |

Both surfaces reuse the same source-backed catalog, repair packs, search behavior, deterministic engine, selectors, compatibility evidence, and safety rules. Neither may infer a physical observation, complete model suffix, nearby model, or neighboring SKU.

## Tool contract

The server is declared in [`src/lib/mcp/index.ts`](../src/lib/mcp/index.ts).

| Tool                     | Input                                                                                                 | Result                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `search_appliances`      | Optional query, category, brand, and problem ID.                                                      | Up to 25 ranked supported catalog results, verified codes, and capability summaries.                              |
| `get_appliance_coverage` | Catalog `applianceId`.                                                                                | Supported problems, capability labels, verified codes, and official model source.                                 |
| `get_repair_guide`       | `applianceId` and supported `symptomId`.                                                              | Ordered safe checks, allowed result IDs, components, product-code rule, and sources.                              |
| `run_diagnosis`          | `applianceId`, `symptomId`, optional complete product code, and ordered person-reported observations. | Engine transcript, next check or outcome, exact part when supported, escalation, causes, sources, and disclaimer. |
| `find_model_number`      | Category, optional washer load style, and optional brand.                                             | Common label locations, safety note, identifier examples, suffix hint, and sources.                               |

The manifest marks every tool read-only from the remote service's perspective. `run_diagnosis` invokes mutating domain transitions only inside a new in-memory state for that request; it does not write a database, create a user session, or change the browser app.

## Intended call sequence

```text
search_appliances
  → get_appliance_coverage
  → get_repair_guide
  → ask the person for each physical observation
  → run_diagnosis

find_model_number can be used before exact selection when the person cannot locate or distinguish the model code.
```

The client must use IDs returned by earlier tools, preserve observation order, and pass only what the person explicitly reports. An exact-part result still requires a complete verified product code. Seller discovery remains a separate commerce step; the remote tool may return the exact part's commerce descriptor but does not ask Shopify to prove fit.

## Source and generated files

- `src/lib/mcp/index.ts` — server metadata, instructions, and tool registration.
- `src/lib/mcp/tools/` — reviewable tool source; this is the behavioral source of truth.
- `.lovable/mcp/manifest.json` — generated public contract.
- `supabase/functions/mcp/index.ts` — generated deployable bundle; do not review it as though it were hand-maintained source.
- `supabase/config.toml` — Supabase project binding.
- `vite.config.ts` — activates the Lovable MCP build plugin.
- `src/integrations/supabase/` — generated browser client scaffolding. It is not currently imported by the Clunk UI or by the MCP tool source.

The browser-side Supabase publishable values are public configuration, not secret storage. No private token belongs in a `VITE_` variable or this repository.

## Release blockers

1. Fix the TypeScript incompatibilities without weakening `exactOptionalPropertyTypes` or widening tool inputs beyond the declared Zod schemas.
2. Keep the generated Supabase client compatible with indexed `ImportMetaEnv` access.
3. Run the complete existing gate and add direct tests for all five remote tools, including unknown IDs, unsupported pairs, invalid observation order, serial-number input, missing complete codes, hazard stops, and revision/SKU non-carryover.
4. Regenerate the manifest and Edge Function bundle from the reviewed source.
5. Deploy the `mcp` Edge Function to the configured project and verify the intended anonymous policy. If anonymous access is retained, confirm the surface remains read-only, bounded, rate-limited as appropriate, and free of non-public data.
6. Connect with a real MCP client; record initialization, `tools/list`, one successful bounded flow, one unsupported pair, one invalid-order rejection, and one hazard stop.
7. Confirm that no tool can mutate the browser session, persist a diagnosis, access a database, infer an observation, or turn Shopify data into compatibility evidence.
8. Only then add a public endpoint or client-installation snippet to the README.

The current failed GitHub run is [33665544064](https://github.com/mcostigliola321/clunk-your-appliance-assistant/actions/runs/33665544064). It is evidence of the open build blocker, not a failed appliance-domain test.
