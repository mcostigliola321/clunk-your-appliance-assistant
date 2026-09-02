# Security and safety reporting

Clunk's browser product is a static, open-source appliance diagnostic guide with no accounts,
private API keys, payment handling, required database, or app-side model call. It processes local
browser state, registers WebMCP tools when supported, and optionally queries Shopify Global Catalog
for seller offers. The repository also contains a draft unauthenticated remote MCP service packaged
as a Supabase Edge Function. That function is not currently deployed or build-green, but reports
about its source, generated bundle, future endpoint, or public-data boundary are in scope.

## Report a vulnerability privately

Use GitHub's **Report a vulnerability** form in this repository's Security tab. Repository owners
must enable **Settings → Security → Code security → Private vulnerability reporting** before that
private form is available. If it is not available, open a minimal public issue asking the owner to
enable private reporting; do not include exploit details, secrets, personal data, or a working
proof of concept in that issue.

Please include the affected URL or commit, impact, reproducible steps, and a safe description of the
expected behavior. Do not test against a real broken appliance, merchant account, or another
person's data.

## Appropriate reports

- unsafe instructions, protection bypasses, or a safety stop that can be skipped;
- an exact model, part-fit, seller, paid-placement, or commission disclosure claim that is wrong;
- malformed WebMCP input that advances state or reveals an unintended action;
- remote MCP input that bypasses ordering, safety, model/revision isolation, or the public-data-only
  boundary; unexpected persistence, database access, authentication behavior, or denial-of-service
  exposure in the Edge Function;
- script injection, unsafe external URL handling, dependency compromise, or deployment-header gaps;
- secrets or private operational data committed to the repository.

Ordinary model-coverage requests and documentation corrections can use public issues.
