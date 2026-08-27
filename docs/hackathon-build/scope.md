# Project scope

## Product

**Clunk** — “Tell it what’s broken. It shows you what to check and finds the exact part.”

Clunk is a shared visual repair bench where a person supplies physical observations and a browser agent operates eight bounded WebMCP tools against the same visible, deterministic state. The application itself never calls an LLM.

## Submission outcome

A judge should understand the product within five seconds and reach a real seller link in one click. That click runs a clearly labeled example fixture through the same actions as the real diagnosis; it does not fake a separate result.

## In scope

- 50 source-backed U.S. model families across washers, dishwashers, electric dryers, and refrigerators.
- Four purchase-ready flagships:
  - GE `GFW550SSN0WW` will not drain → `WH11X39237` drain pump/filter assembly.
  - Whirlpool `WDT750SAKZ1` will not drain → `W11412291` drain pump.
  - GE `GTD42EASJ2WW` door will not stay closed → `WE01M10007` visible strike.
  - GE `GSS25GYPFS` slow water flow → `XWFE` filter.
- Eight more purchase-ready exact codes and 38 guided-only models labeled by evidence depth before selection; unsupported part links are never implied.
- Original category-specific location guides with keyboard-accessible hotspots and persistent “not a service diagram” language.
- Safe, bounded checks with deterministic order, result effects, likely-cause ranking, stopping conditions, and escalation.
- Exact part name, SKU, compatible complete model code, location, source, Shopify UCP live offers, and external merchant cart when evidence permits.
- Eight literal, state-dependent `document.modelContext.registerTool` registrations.
- Manual/judge controls and one-click examples using the same public action layer.
- Visible collaboration milestones, tool-transition handoff, technical inspector, source panels, deterministic tests, and accurately labeled scenario fixtures.
- Static Lovable hosting, public GitHub repository, MIT license, README, submission copy, and sub-three-minute demo.
- Mobile responsiveness, keyboard access, reduced motion, plain language, and WCAG A/AA automated checks.

## Out of scope

- Universal model coverage, fuzzy model substitution, or guaranteed diagnosis.
- App-side LLM calls, OCR, image/audio diagnosis, sensor input, accounts, auth, databases, server functions, persistence, or analytics.
- In-app payment, automated checkout/cart mutation, affiliate claims, cached catalog results, or live source-page scraping.
- Gas, mains/high-voltage, energized tests, refrigerant, sealed compressors, protection bypasses, internal wiring, control boards, or professional-only instructions.
- Panel-removal or internal pump-installation guidance.
- Claims that the original illustrations exactly reproduce a named model.

## Person–agent workflow

1. The person names the category/model and reads the complete rating-label code.
2. The agent searches and selects only a returned catalog ID.
3. The site exposes only the tools valid for the current state.
4. Clunk highlights the next location and shows a bounded observation choice.
5. The person reports what they physically see; the agent records only that result.
6. The deterministic engine advances, ends with no part, requests a complete code, resolves a verified part, or stops at professional service.
7. Every accepted or rejected action updates the activity log and shared snapshot.

## Success criteria

- One click on any category flagship shows the highlighted location and exact part, then loads exact-SKU Shopify offers with working outbound links when available.
- A real observation path can end with no purchase when debris or an outside blockage explains the symptom.
- Guided-only models never receive a flagship part by similarity.
- Hazard and out-of-order calls cannot cross the safety boundary.
- All four categories execute through the same eight tools and static architecture.
- Desktop/mobile browser tests, keyboard/touch sizing, reduced motion, automated WCAG A/AA, unit/integration/eval tests, lint, typecheck, and production build pass.

## Schedule

- Submission-ready target: September 2, 2026 at 1:00 PM PT.
- Official deadline: September 3, 2026 at 1:00 PM PT.
- Freeze the submitted repository and site after the official deadline.
