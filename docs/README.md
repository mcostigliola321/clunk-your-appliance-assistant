# Clunk documentation

This directory contains Clunk's current technical, safety, evidence, commerce, evaluation, and historical documentation. Use the tables below to distinguish current product truth from dated research and build history.

## Current product documentation

| Document                                                     | What it covers                                                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| [`../README.md`](../README.md)                               | Public product overview, current scope, demo, setup, and contributor entry point.                   |
| [`../PRODUCT.md`](../PRODUCT.md)                             | Durable customer promise, language, accessibility, and product principles.                          |
| [`../DESIGN.md`](../DESIGN.md)                               | “Approachable Precision” visual system and interaction rules.                                       |
| [`architecture.md`](./architecture.md)                       | Static application layers, shared engine, state-dependent WebMCP registration, and Shopify handoff. |
| [`safety.md`](./safety.md)                                   | Deterministic stops, prohibited capabilities, and tested outcome boundaries.                        |
| [`repair-pack-schema.md`](./repair-pack-schema.md)           | Schema-v6 repair packs, model/problem coverage, and exact-part evidence requirements.               |
| [`model-source-ledger.md`](./model-source-ledger.md)         | The 163-identity source ledger and exact-part status.                                               |
| [`category-expansion-plan.md`](./category-expansion-plan.md) | Catalog structure, coverage totals, and the evidence required for expansion.                        |

## Integrations, evaluation, and release

| Document                                                           | What it covers                                                                                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| [`shopify-ucp-integration.md`](./shopify-ucp-integration.md)       | Global Catalog offer discovery, exact-SKU filtering, paid placement, and checkout boundaries. |
| [`webmcp-agent-evaluation.md`](./webmcp-agent-evaluation.md)       | Repeatable natural-language agent cases and the distinction from deterministic fixtures.      |
| [`source-url-audit.md`](./source-url-audit.md)                     | Dated source availability, applicability, and access limitations.                             |
| [`release-security-checklist.md`](./release-security-checklist.md) | Repository and host controls that require owner or deployment configuration.                  |
| [`../SECURITY.md`](../SECURITY.md)                                 | How to report security, unsafe-repair, or evidence issues.                                    |

Machine-readable schemas sit beside their human explanations:

- [`repair-pack.schema.json`](./repair-pack.schema.json)
- [`catalog-expansion.schema.json`](./catalog-expansion.schema.json)
- [`purchase-coverage-expansion.schema.json`](./purchase-coverage-expansion.schema.json)
- [`symptom-coverage-expansion.schema.json`](./symptom-coverage-expansion.schema.json)
- [`broad-symptom-coverage.schema.json`](./broad-symptom-coverage.schema.json)

## Research evidence

`research/` contains dated evidence reviews, generated audit artifacts, accepted rows, rejected candidates, and public-deployment verification. The current release baseline is documented in:

- [`research/demo-ready-2026-08-29/README.md`](./research/demo-ready-2026-08-29/README.md)
- [`research/judge-polish-2026-08-31/README.md`](./research/judge-polish-2026-08-31/README.md)
- [`research/judge-depth-2026-08-31/README.md`](./research/judge-depth-2026-08-31/README.md)
- [`research/final-submission-polish-2026-09-02/README.md`](./research/final-submission-polish-2026-09-02/README.md)

Dated source checks are evidence snapshots, not guarantees that a third-party page, seller, price, or stock level is unchanged.

## Historical build archive

`hackathon-build/` preserves the project's evolution from an early fictional, single-washer proof of concept into the current four-category release. Those files are useful as decision history but are not the source of truth for current scope, counts, UI language, or release status.

For current facts, prefer the root README, `PRODUCT.md`, this index, and the current technical documents above. When prose and generated catalog audits disagree, re-run the audits and reconcile the prose rather than assuming an older milestone is still active.
