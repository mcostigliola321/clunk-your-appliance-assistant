# Release security checklist

Repository-side hardening is present, but these controls require an owner to enable them in GitHub
or the production host. They were not changed by the 2026-08-28 release worktree.

## GitHub settings

- Enable **Secret scanning** and **Push protection** under Settings → Security → Code security.
- Enable **Dependabot alerts** and **Dependabot security updates**. Keep the lockfile committed and
  review automated updates through the complete verification workflow.
- Enable **Private vulnerability reporting** so SECURITY.md's private report path appears.
- Add a ruleset for `main` that blocks force pushes and branch deletion. Keep direct fast-forward
  pushes available to the connected Lovable workflow; do not require a pull request if that would
  block Lovable's direct synchronization.
- Review Actions permissions periodically. The workflow uses read-only repository contents and
  pins third-party actions to full commit SHAs.

## Static host

- Confirm the production host actually serves the headers in `public/_headers`. Lovable's handling
  of host-specific header files must be verified after publication.
- If it does not, configure the equivalent CSP, anti-framing, MIME-sniffing, referrer, and
  permissions headers in the hosting control plane. A document meta tag cannot enforce
  `frame-ancestors`, so host-level headers are required for reliable clickjacking protection.
- Recheck the live response headers and Shopify browser request after every host change.

## Shopify promoted placements

- Join the invite-led promoted-placements waitlist with the Shopify organization ID.
- After approval, accept the program agreement and configure Partner/Hyperwallet payout details.
- Create or review a saved catalog in the Dev Dashboard, enable **Earn commission**, and place its
  public catalog identifier in `VITE_SHOPIFY_CATALOG_ID` at build time.
- Never place an Admin API key, private Storefront token, Partner credential, or payout information
  in this repository or a `VITE_` variable.
- Reverify the developer-preview response shape, visible paid-placement label, commission disclosure,
  and exact preservation of Shopify's attributed variant URL before publishing.
