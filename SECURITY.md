# Security and safety reporting

Clunk is a static, open-source appliance diagnostic guide. It has no accounts, private API keys,
payment handling, application backend, or app-side model call. It does process local browser state,
register WebMCP tools when supported, and optionally queries Shopify Global Catalog for seller
offers, so security and unsafe-repair reports are welcome.

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
- script injection, unsafe external URL handling, dependency compromise, or deployment-header gaps;
- secrets or private operational data committed to the repository.

Ordinary model-coverage requests and documentation corrections can use public issues.
