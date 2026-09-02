# Contributing to Clunk

Clunk welcomes small, reviewable contributions that preserve its deterministic safety boundary and credential-free static architecture.

## Development

1. Use Node.js 22 or newer.
2. Run `npm ci`.
3. Run `npm run dev` for the local app.
4. Run `npm run verify` before opening a pull request.

Do not commit secrets or add a runtime API, model call, database, authentication flow, analytics requirement, or network dependency without first discussing an architectural change.

## Repair content

Real appliance coverage is welcome only when each claim meets Clunk's evidence boundary. Model identity needs an official manufacturer source; problem coverage needs reviewed manufacturer guidance for the exact row or explicit cohort; and an exact part needs a complete product code mapped to one SKU by manufacturer or authorized-parts evidence. A seller listing, nearby revision, family name, or similar product is never enough to prove fit.

Diagrams and explanatory artwork must be original and mechanically conservative. Do not copy manufacturer diagrams or describe a general location guide as an exact service diagram. Follow [`docs/repair-pack-schema.md`](./docs/repair-pack-schema.md), update the appropriate source ledger or audit, add deterministic positive and negative tests, and keep safety boundaries visible.

Contributions that add gas, mains or high-voltage, energized, refrigerant, sealed-compressor, protection-bypass, internal-wiring, panel-removal, or professional-only instructions will not be accepted.

## Commit style

Use a short conventional subject such as `feat: add a safe observation state` or `fix: preserve the professional stop boundary`. Keep generated Lovable history intact: do not force-push, rebase, amend, or squash commits already published to the connected main branch.
