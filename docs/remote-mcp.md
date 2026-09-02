# Remote MCP deployment

Clunk has two MCP surfaces with different jobs:

- The eight in-page WebMCP tools operate the repair state a person can see in the browser.
- The five remote MCP tools provide stateless, read-only catalog and diagnosis access to clients that cannot operate that page-local session.

Both surfaces use the repository's source-backed catalog, repair packs, safety rules, and deterministic engine. The remote surface does not observe or mutate an open browser session.

## Public endpoint and tools

Lovable deploys the generated Supabase Edge Function at:

`https://myslkqzeftpnbdzgbjpz.supabase.co/functions/v1/mcp`

It exposes:

1. `search_appliances`
2. `get_appliance_coverage`
3. `get_repair_guide`
4. `run_diagnosis`
5. `find_model_number`

The intended sequence is search → coverage → guide → person-supplied observations → diagnosis. Model-label guidance remains a separate physical handoff. The server instructions explicitly prohibit inferring a model, nearby SKU, or observation.

## Safety and trust boundary

The endpoint is anonymous because all reachable data is already public and repository-owned. It has no database queries, storage, secrets, account access, payment action, Shopify request, or other open-world network call. Every tool is annotated read-only, idempotent, and closed-world. Inputs have length and collection limits. Successful structured outputs are validated against concrete Zod/JSON Schema contracts before they leave the protocol handler.

`run_diagnosis` creates fresh state for each request and replays observations in order. It rejects an unknown check/result, out-of-order input, unsafe continuation, and any observation supplied after a terminal result. Exact parts still require a complete verified product code. Hazard results stop without a part or commerce path.

## Generated artifacts

Source lives in `src/lib/mcp`. Two committed files are generated:

- `.lovable/mcp/manifest.json` registers the server and its JSON Schema catalog with Lovable.
- `supabase/functions/mcp/index.ts` is the deployable Deno edge bundle.

Run:

```bash
npm run generate:mcp
npm run build
npm run check:mcp-generated
```

Do not hand-edit the generated edge bundle. The complete `npm run verify` gate regenerates and checks both artifacts for drift.

## Deployment requirements

`supabase/config.toml` pins the connected project and disables Supabase's legacy JWT pre-check for this one anonymous function. The MCP handler itself declares `auth: none`. Lovable/GitHub history must remain linear and recoverable: merge or fast-forward new commits; never force-push or rewrite published commits.

After publication, verify all of the following against the endpoint:

- `initialize` returns server name `clunk-your-appliance-assistant` and protocol metadata;
- `tools/list` returns exactly five tools with output schemas and read-only/idempotent/closed-world annotations;
- an exact GE dryer journey returns SKU `WE01M10007` only for the complete `GTD42EASJ2WW` code and matching observations;
- a burning-smell observation returns a terminal escalation and no part;
- malformed, oversized, out-of-order, and post-terminal inputs are rejected.

The automated protocol tests exercise the same Web-Standard handler used by the generated Supabase function. Live verification is still required because deployment state is external to the repository.
