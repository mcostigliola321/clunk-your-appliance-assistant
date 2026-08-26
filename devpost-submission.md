# Title

Clunk

## One-line Summary

Tell it what’s broken. Clunk shows a person and a browser agent what to check together, updates an exploded appliance diagram in real time, and finds the exact fictional part.

## Problem

Household appliance troubleshooting is a poor fit for a conventional chatbot. The useful evidence lives partly in software and partly in the physical world: an agent can compare structured symptoms and parts, but only the person standing beside the appliance can safely report whether a hose is kinked, a filter is blocked, or a hazard is present.

Today that collaboration is fragmented across search results, service manuals, videos, chat messages, and mental notes. Advice can jump ahead of the evidence, lose track of what the person already checked, or cross a safety boundary.

## Solution

Clunk turns one intentionally small scenario—a fictional Clunk WM-01 washer that will not drain—into a shared visual repair bench. A browser agent can read the current repair state, focus components on an original exploded diagram, request one safe observation at a time, rank likely causes, reveal a fictional compatible part, or stop and escalate.

The person remains responsible for physical observations. Every human click and WebMCP call goes through the same deterministic action layer and updates the same progress rail, diagram, causes, part result, and visible activity log. The site enforces sequencing and safety even if an agent calls a tool incorrectly.

The shipped app is static and credential-free. It does not call an LLM; WebMCP lets the browser agent bring the reasoning while the page provides authoritative tools and state.

## Why This Matters

Clunk demonstrates a broader WebMCP pattern for work that crosses digital and physical environments. Instead of giving an agent opaque access to an app or asking it to interpret arbitrary page text, the page exposes narrow capabilities with visible consequences and deterministic guardrails.

For appliance troubleshooting, that means:

- the agent handles structured reasoning and state tracking;
- the person contributes observations only they can make;
- the interface gives both sides a shared visual reference;
- the site can refuse unsafe or out-of-order actions;
- the result is inspectable instead of disappearing into a chat transcript.

The same pattern could extend to equipment inspection, guided setup, accessibility assistance, field service, and other collaborative workflows where a human must stay in the loop.

## How We Used AI

AI is present at the browser-agent layer, not inside Clunk. A compatible agent can discover and invoke eight WebMCP tools registered by the page. It can read state, select the fictional appliance and symptom, highlight components, show a current safe check, record only observations explicitly supplied by the human, look up the supported fictional part, and escalate.

Clunk does not send prompts to a model, choose a model provider, or require an API key. Its state transitions, cause rankings, compatible-part result, and safety stops are deterministic site logic. This separation makes the agent useful without making it the safety authority.

## How We Used Codex

Codex helped turn the product brief into a scoped PRD and technical specification, then implemented the static React application in small verified commits. It built the deterministic repair engine and safety policy, the eight literal WebMCP registrations, the original exploded SVG interface, the visible tool inspector, evaluation fixtures, and the automated test suite.

Codex also tested the live Lovable deployment in ChatGPT’s in-app browser and a connected Chrome profile, diagnosed a hosting-pipeline mismatch, verified accessibility and responsive behavior, and prepared the open-source and judge-facing documentation. Lovable was used to create the hosting project, maintain GitHub sync, and publish the static site.

The deployed product contains no Codex runtime dependency.

## Key Features

- Five-second product story with one fictional washer and one no-drain symptom
- Original, interactive exploded Clunk WM-01 SVG
- Eight small, enum-bounded WebMCP tools with literal imperative registration
- One shared state and action layer for human, manual, and agent calls
- One-question-at-a-time diagnostic progress
- Evidence-based likely-cause ranking
- Exact fictional part match with repair-versus-replace context
- Source-labeled, accepted/rejected agent activity log
- Visible judge Tool inspector and full manual fallback
- Deterministic hazard and professional-service stop states
- Keyboard navigation, 44px touch targets, responsive layout, reduced motion, and WCAG A/AA checks
- Static hosting with no credentials, backend, runtime API, or app-side model
- Public repair-pack schema, WebMCP eval fixtures, and MIT license

## Architecture

```text
Human control ─┐
               ├─> shared action layer ─> deterministic engine ─> repair state ─> UI
WebMCP call ───┘                                │
                                                └─> accepted/rejected activity event
```

The repair pack is original fictional JSON. Pure TypeScript domain code validates the pack, enforces safety, executes transitions, ranks causes, and derives serializable state. A React provider owns current state and exposes one synchronous action layer. The WebMCP adapter registers eight tools against that layer with bounded JSON Schemas and an AbortController-owned lifecycle. The React interface renders only derived state.

Production output is static HTML, CSS, JavaScript, JSON, SVG, and local font files.

## Testing Instructions

### Fast judge path

1. Open https://clunk-appliance-assistant.lovable.app.
2. Select **Diagnose this washer**.
3. Choose **Power is disconnected**.
4. Choose **The visible hose looks clear**.
5. Choose **The filter is blocked by debris**.
6. Select **Find the matching part**.
7. Confirm the highlighted pump filter, top-ranked blocked-filter cause, activity log, 100% progress, and fictional part `CL-PF-220`.

To test the safety boundary, reset, start again, and choose **There is a burning smell or smoke**. The flow must stop without exposing another repair step.

Open **Tool inspector** to view and manually run the same eight bounded actions registered for an agent.

### WebMCP browser

In the Chrome 149 testing build, enable `chrome://flags/#enable-webmcp-testing` and relaunch. The Clunk header should report **Agent tools ready** and **Eight WebMCP tools registered**. Unsupported browsers report **Manual mode ready** and retain the complete human/judge flow.

### Local verification

```bash
npm ci
npx playwright install --with-deps chromium
npm run verify
```

This runs typechecking, lint, 29 deterministic unit/integration/eval tests, a production build, and 16 desktop/mobile browser checks covering canonical and hazard paths, GE top-load topology, keyboard and touch behavior, responsive overflow, reduced motion, and automated WCAG A/AA scans.

## Public Demo Link

https://clunk-appliance-assistant.lovable.app

No credentials are required.

## Public Repository Link

https://github.com/mcostigliola321/clunk-your-appliance-assistant

**Readiness note:** the repository contains the complete source and MIT license but must be switched from private to public before the Devpost entry is finalized.

## Demo Video

**Public YouTube URL:** TODO — record, upload publicly, and paste the URL here.

### Under-three-minute recording outline

- **0:00–0:12 — Hook:** “Tell it what’s broken. It shows you what to check and finds the exact part.” Show the full shared repair bench.
- **0:12–0:30 — Why WebMCP:** Explain that the agent handles structured reasoning while the person supplies physical observations.
- **0:30–1:20 — Canonical flow:** Read state/start diagnosis, report power disconnected, hose clear, and filter blocked. Show synchronized progress, diagram highlight, cause ranking, and source-labeled activity.
- **1:20–1:38 — Exact result:** Run part lookup and reveal fictional `CL-PF-220` plus repair-versus-replace context.
- **1:38–2:02 — Safety proof:** Reset, report burning smell, and show the terminal professional stop with no further repair instruction.
- **2:02–2:28 — WebMCP proof:** Open Tool inspector, name the eight tools, and briefly show literal `document.modelContext.registerTool({` source.
- **2:28–2:45 — Close:** Static, open source, no login/API key/app-side model; manual fallback and deterministic evals included.

Record with clear narration and keep the uploaded public YouTube video under three minutes.

## Screenshot Shot List

1. **Shared repair bench, desktop** — captured at `docs/hackathon-build/screenshots/clunk-desktop.png`.
2. **Responsive mobile bench** — captured at `docs/hackathon-build/screenshots/clunk-mobile.png`.
3. **Canonical result** — capture the highlighted pump filter, blocked-filter ranking, 100% progress, and `CL-PF-220`.
4. **Safety stop** — capture the burning-smell professional boundary and absent next-step controls.
5. **Tool inspector** — capture all eight tool names beside the visible agent activity log.

## Submission Readiness Notes

Ready:

- Working credential-free Lovable production URL
- Complete static source and original assets
- Visible MIT license
- Eight literal WebMCP registrations
- Manual judge mode and inspector
- Deterministic tests and eval fixtures
- Desktop and mobile screenshots
- Judge-first README, architecture, safety, schema, contribution, and security documentation

Still required before the final Devpost action:

- Make the GitHub repository public and confirm GitHub detects the MIT license
- Record and upload the public narrated YouTube demo under three minutes
- Add the video URL to this draft and the README
- Capture the result, safety, and inspector gallery frames
- Confirm the participant-specific official form answers below

## Known Limitations

- The MVP supports only one fictional washer, one symptom, and three visible checks.
- It makes no real diagnosis, compatibility, price, purchase, or certification claim.
- It intentionally excludes image diagnosis, OCR, free-form symptom ingestion, persistence, accounts, commerce, and real parts catalogs.
- WebMCP is an evolving browser API, so unsupported environments use the complete manual fallback.
- An agent must not infer a physical observation; the human remains responsible for reporting it.

## TODO Official Form Fields

Official requirements fetched August 26, 2026:

- **28249 — Submitter Type:** TODO — confirm Individual, Team of Individuals, or Organization.
- **28250 — Country of residence:** TODO — confirm the participant’s country.
- **28251 — Organization name:** N/A unless submitting for an organization.
- **28252 — App Status:** New.
- **28253 — Existing-project update:** N/A; Clunk was created during the submission period.
- **28254 — Live URL:** https://clunk-appliance-assistant.lovable.app
- **28255 — Private judge testing instructions:** Use the Fast judge path above; no credentials.
- **28256 — Public code repository:** https://github.com/mcostigliola321/clunk-your-appliance-assistant (make public first).
- **28257 — Agents/clients tested:** Connected Chrome profile with WebMCP enabled (all eight registrations ready); ChatGPT in-app browser manual fallback; deterministic modelContext registry harness and Playwright.
- **28258 — AI tools used during the build:** OpenAI Codex for planning, implementation, debugging, browser verification, tests, and documentation; Lovable for initial project creation, GitHub sync, and static hosting. No AI model is called by the shipped app.
- **28259 — Level of learning:** TODO — confirm None, Moderate, or Significant.
- **28260 — Reusable career AI value:** TODO — confirm Yes or No.

Official judging criteria addressed: WebMCP Leverage, Execution, Potential Impact, and Creativity & Ambition.
