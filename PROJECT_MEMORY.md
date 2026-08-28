# Clunk project memory

Last reconciled: **2026-08-28** against `main` at `e8607a2` and the active Codex tasks listed below.

This is the short cross-task handoff for Clunk. It records current truth and decisions, not full chat transcripts. Verify moving facts such as branches, deployments, external APIs, and deadlines before acting on them.

## Product in one paragraph

Clunk is a consumer-friendly visual appliance diagnostic guide and WebMCP demo. A homeowner and browser agent share one deterministic repair state: the agent can reason over structured, source-backed evidence, while the person reports only what they can physically observe. The product should answer, in order: what may be wrong, where to look, what part is supported by exact evidence, and where it can be bought. Safety and evidence boundaries are product truth, but protocol detail should stay secondary to the homeowner's answer.

## Durable product and UX decisions

- The visual direction is **Approachable Precision**: calm, premium, appliance-led, highly legible, and consumer-first. Avoid generic AI styling, dense dashboards, workshop clichés, gradients, and technical language on primary surfaces.
- The complete journey should be visual. Appliance imagery is a primary navigation control, and the original cutaway/location art should remain present and useful as the user moves through category, symptom, checks, and result.
- Real diagnosis is the primary path. Completed examples remain useful for judges, onboarding, and trust, but should be consolidated under one clearly secondary entry such as **See how Clunk works**. A small context-specific example link is acceptable; repeated equal-prominence example callouts are not.
- Clunk must grow from one problem per model to many model × symptom combinations. Model identity does not imply symptom coverage. Symptom choices describe observable behavior rather than guessed causes.
- Diagnostic trees may be reused only across explicitly compatible, source-backed cohorts. Do not transfer evidence across brands, incompatible topologies, model families, or engineering revisions without documented applicability.
- Guided checks and professional stopping points are valid outcomes. Purchase-ready status requires a complete appliance code mapped to one exact SKU by manufacturer or authorized-parts evidence. Shopify Global Catalog may find current exact-SKU offers but never proves fit.
- Preserve WCAG 2.2 AA goals, keyboard use, 44px targets, mobile layouts down to 320px, reduced motion, visible focus, screen-reader status, color-independent meaning, and plain-language safety stops.
- The user wants the demo to feel genuinely useful and commercially extensible, not merely like a hackathon proof. Long-term structure should support more appliance types, a much larger catalog, recurring evidence verification, and possible revenue without weakening trust.

## Current shipped branch

- Repository: `mcostigliola321/clunk-your-appliance-assistant`; connected Lovable project publishes at <https://clunk-appliance-assistant.lovable.app>.
- `origin/main` is currently `e8607a2` (`fix: separate result offers from safety guidance`). Do not rewrite pushed history: no force-push, rebase, amend, or squash of published commits.
- Main contains the appliance-led **Approachable Precision** redesign and a source-backed catalog of **163 U.S. model families** across 56 washers, 33 dishwashers, 33 electric dryers, and 41 refrigerators from 11 brands.
- Current capability totals on main are **25 purchase-ready** complete revisions and **138 guided-checks-only** entries.
- Main still has the original one-supported-symptom-per-model architecture. The multi-symptom refactor described below has not been merged or published.
- Pushing the connected branch syncs it to Lovable, but production publication and the live URL should still be explicitly checked after a release.

Primary references: [PRODUCT.md](./PRODUCT.md), [README.md](./README.md), [architecture](./docs/architecture.md), [source ledger](./docs/model-source-ledger.md), [safety model](./docs/safety.md), and [category expansion plan](./docs/category-expansion-plan.md).

## Work in progress

### Multi-symptom diagnostics

- Codex task: **Expand Clunk multi-symptom diagnosis**.
- Task ID: `01a045d5-f777-73e2-964d-b19441c3f33e`.
- Worktree: `/Users/Mark/.codex/worktrees/ccc9/WebMCP Challenge`.
- Branch: `codex/multi-symptom-diagnostics`, based on older main commit `0f4b37d`.
- State: implementation is complete in that worktree but remains **uncommitted, unpushed, unmerged, and unpublished**.
- It refactors toward model × symptom packs, exposes four observable symptom families per category, adds 12 distinct guided trees on one separately evidenced flagship per category, filters search by symptom coverage, consolidates examples under **See how Clunk works**, and adds persistence/undo/WebMCP coverage.
- Its reported verification passed lint, typecheck, production build, 69 unit/integration/WebMCP tests, and 38 desktop/mobile browser journeys. Independent review findings were corrected; the one-time Impeccable detector reported only existing design-token advisories.
- Important reconciliation risk: that worktree describes **131 models and 143 model × symptom packs**, while current main now contains **163 models** and later result-layout fixes. Do not merge it blindly. Port or reconcile it onto current main, preserve all 163 catalog entries, rerun the full gate, and visually recheck exact-result separation.

### Evidence expansion

- The architecture can support more symptom coverage, but the main limitation is now evidence rather than code.
- The proposed next task is a research-only evidence reconnaissance: map every existing model × desired symptom combination by manufacturer/compatible cohort, record primary sources and exceptions, and identify additional common U.S. models that can be added responsibly.
- That reconnaissance task has been discussed but **has not been created**. Keep evidence research separate from the subsequent implementation/import task.

## Hackathon and submission status

- Hackathon: **The WebMCP Challenge** on Devpost.
- Live Devpost data checked on 2026-08-28 showed the submission deadline as **2026-09-03 at 1:00 PM Pacific / 4:00 PM Eastern**. Recheck Devpost before relying on this deadline.
- Nothing has been submitted. The authenticated Devpost account had zero projects when checked, so there is not yet even a draft Devpost project.
- The local submission draft is [devpost-submission.md](./devpost-submission.md). Remaining external work includes a public YouTube demo under three minutes with audio, the real-agent evaluation/capture, participant form answers, refreshed final description, and final live/repository checks.
- The user explicitly chose to hold off because the product still needs work. Do not create, update, or submit a Devpost project without a new explicit request. Final submission requires an explicit confirmation after readiness is reviewed.

## Current priorities and known gaps

1. Reconcile the multi-symptom worktree with the 163-model current main instead of losing either body of work.
2. Build the auditable evidence matrix needed to extend useful symptoms across compatible cohorts and expand the model roster honestly.
3. Continue fresh-eyes consumer UX review across the full visual journey, especially symptom discovery, model filtering, real-versus-example hierarchy, handoffs, empty/unsupported states, and mobile pacing.
4. Keep the exact-result commercial handoff visually clear without mixing seller offers with safety or service guidance.
5. Run and record genuine natural-language WebMCP agent sessions; deterministic fixtures and manual/browser walkthroughs are not substitutes.
6. Produce the final public demo video and complete the Devpost readiness review before the deadline.
7. Reconcile documentation that still mentions older 131-model architecture/counts after implementation settles.

## Working rules that prevent regressions

- Inspect the current branch and worktree before assuming a task's changes are on main.
- Do not treat a successful branch test as proof that a later merge or Lovable deployment is healthy; verify the integrated branch and live release separately.
- Preserve unrelated dirty-worktree changes. At the time of this handoff, main has a modified `.devpost-hackathon-state.json` and untracked `.impeccable/critique/` material that must not be discarded.
- Prefer primary manufacturer or authorized-parts evidence for model, symptom, and compatibility claims. Record applicability and verification dates.
- Never infer an exact part from a family neighbor, partial code, seller result, or generic troubleshooting article.
- Keep the app static and credential-free unless the user explicitly approves a larger architectural change.
- Run the repository's complete verification command before calling an integrated release finished, then inspect representative desktop and mobile states visually.
