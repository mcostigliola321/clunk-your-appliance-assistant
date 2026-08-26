# Contributing to Clunk

Clunk welcomes small, reviewable contributions that preserve its deterministic safety boundary and credential-free static architecture.

## Development

1. Use Node.js 22 or newer.
2. Run `npm install`.
3. Run `npm run dev` for the local app.
4. Run `npm run verify` before opening a pull request.

Do not commit secrets or add a runtime API, model call, database, authentication flow, analytics requirement, or network dependency without first discussing an architectural change.

## Repair content

All appliance names, model numbers, diagrams, diagnostic data, compatibility data, and parts must be original and fictional. Follow [`docs/repair-pack-schema.md`](./docs/repair-pack-schema.md), add deterministic tests, and keep every safety disclaimer visible.

Contributions that add gas, high-voltage, energized, refrigerant, sealed-compressor, protection-bypass, internal-wiring, or professional-only instructions will not be accepted.

## Commit style

Use a short conventional subject such as `feat: add a safe observation state` or `fix: preserve the professional stop boundary`. Keep generated Lovable history intact: do not force-push, rebase, amend, or squash commits already published to the connected main branch.
