# Release freeze manifest

Status date: **2026-09-02**  
Submission deadline: **2026-09-03 at 1:00 PM Pacific Time**  
Release branch: `codex/final-release` (local isolated worktree; not pushed or published)

## Frozen release identity

- Candidate source commit: `f70662b` (`fix: prepare final WebMCP submission`).
- Verified upstream base: `deb1862` (`origin/main` at the start of this pass).
- Live app: `https://clunk.repair`
- Live production JavaScript: `index-BfaTsAx5.js`, 1,609,661 bytes, SHA-256 `5ac78a2deeb20a50d3da21226ba015cf8692505321d5715c7b4fcfcab05ed966`.
- Candidate JavaScript: `index-Bx-bKBAZ.js`, 1,609,661 bytes, with the same SHA-256 and byte-for-byte content as production. The candidate CSS asset differs because the release replaces repeated literal colors with same-value design tokens; its rendered values do not change, but publishing still requires a normal deployment verification.
- Live deployment observed during this pass: `f66685b8-7dde-439e-9e48-3a4801f9827b`
- Public repository: `https://github.com/mcostigliola321/clunk-your-appliance-assistant`
- Repository visibility/license: public / MIT, verified through the GitHub API on 2026-09-02.
- Current public video: `https://youtu.be/hUHGxR0iRR8`, public and 2:28 with audio.
- Devpost project/submission: the current browser session is logged out and shows **Join hackathon**; no Clunk project is visible or verified in that session. Project verification or creation and submission require Mark's login and approval.

## Verified evidence to preserve

- Catalog: 163 identities, 782 model × problem pairs, 766 supported, 16 explicit stops, 84 models with at least one exact-part route.
- Browser WebMCP: eight tools discoverable together; authoritative `nextTools` and the deterministic engine guard execution.
- Codex in-app browser client: discovered all eight live tools and directly ran state, search, select, and start; the visible page advanced to the GE dryer safety step.
- Remote MCP: five read-only tools; live exact GE dryer replay returned `WE01M10007`; burning-smell replay returned a terminal escalation and no part.
- Security headers currently served by the host: HSTS, strict-origin-when-cross-origin referrer policy, and `nosniff`.
- Security headers not observed on the live app: CSP, X-Frame-Options, Permissions-Policy, and COOP.

## Do not change through judging without a new full gate

- `src/data/**`, the generated MCP manifest/edge bundle, repair-pack schemas, safety transitions, WebMCP contracts, Shopify exact-SKU filtering, or the eight literal page registrations.
- The public app URL, repository visibility, MIT license, public video visibility, or the external seller disclosure.
- Hosting security rules, GitHub security/ruleset settings, or any saved Shopify catalog configuration.
- The video URL after it has been entered in Devpost; if the upload is replaced in place, verify public visibility, audio, captions, length, and incognito playback again.

## Exact external actions for Mark

1. Approve pushing `codex/final-release`, integrate it into `main` with a normal merge or fast-forward (no rebase, amend, squash, or force-push), wait for Verify, publish through Lovable, and recheck the public asset digests, remote MCP, and headers.
2. Approve and record the replacement demo using [`hackathon-build/demo/final-demo-package.md`](./hackathon-build/demo/final-demo-package.md), then approve uploading/replacing the YouTube video. The current upload is dynamic but contains stale registration wording and does not clearly show client discovery/calls.
3. Log in to Devpost, join the hackathon, and approve creating the Clunk project; paste the final copy from [`../devpost-submission.md`](../devpost-submission.md), then add the live URL, public repository, final video URL, and testing statement.
4. Select participant-specific fields: submitter type, country of residence, app status, learning level, and reusable-career-value answer.
5. Review the eligibility note and every public link in preview, then approve final submission before **September 3, 2026 at 1:00 PM Pacific Time**.
6. Separately approve any post-submission hardening: GitHub Dependabot alerts/updates, secret scanning/push protection, private vulnerability reporting, a non-destructive `main` ruleset, and host-level CSP/anti-framing/Permissions-Policy/COOP. These settings were verified disabled or absent and were not changed in this worktree.

## Final gate record

- `npm run verify`: passed strict TypeScript, ESLint, 118 Vitest checks across 18 files, production build, all 56 Playwright desktop/mobile journeys, and generated MCP drift detection.
- Focused browser rerun: 10/10 passed for the first journey, 390px first viewport, mobile result, hazard/no-commerce, keyboard, touch, reduced motion, and WCAG A/AA coverage.
- Deterministic evidence: `npm run audit:coverage` and `npm run audit:purchase` passed with 163 models, 782 model × problem pairs, 766 supported pairs, 16 explicit stops, and 84 exact-part models.
- Repository hygiene: Prettier, `git diff --check`, nine-cue SRT structure, and `npm audit --audit-level=low` passed; dependency vulnerabilities: zero.
- Scored interface audits: 18/20 before normalization, 19/20 after; **0 P0, 0 P1, 1 deferred P2** (the measured 192.41 kB gzip JavaScript chunk advisory), and 0 P3.
- Live WebMCP: eight tools discovered; state, search, selection, and diagnosis-start calls advanced the visible page; the client refused to invent a person-only physical observation.
- Live remote MCP: five read-only tools; the exact GE replay returned `WE01M10007`, and the burning-smell replay returned terminal escalation with no part.
- Production: HTTP 200; JavaScript is byte-for-byte identical to the candidate; the candidate's same-value CSS token refactor is not yet published.
- Upstream: `origin/main` remained `deb1862` through the final pre-commit fetch, and its GitHub Verify run `33676501339` completed successfully.
- Current public video: public, 2:28, audio and captions present, and visually dynamic; replacement remains required for accurate architecture wording and clear client-call proof.
- External-write boundary: no push, merge, deploy, GitHub setting change, YouTube change, Devpost registration, project creation, or submission was performed.
