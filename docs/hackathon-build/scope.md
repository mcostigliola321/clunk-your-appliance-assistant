# Project Scope

## Project Name

**Clunk**

## One-Line Summary

Clunk is a shared visual repair bench where a person reports physical observations and an AI uses WebMCP tools to select a source-backed washer repair pack, show the next safe check, and identify an exact part only when model-specific compatibility evidence is available.

## Five-Second Pitch

“Tell it what’s broken. It shows you what to check and finds the exact part.”

## Target User

A household appliance owner who is stressed by a non-working washer, does not know appliance terminology, and wants to understand what can be checked safely before deciding whether to repair, replace, or call a professional.

The hackathon judge is a second critical user: they need a credential-free path that demonstrates the person–agent collaboration and WebMCP implementation within seconds.

## Problem

Repair information is fragmented across generic search results, long videos, model-number tables, and expert forums. A person standing next to an appliance has information an AI cannot observe—the sound, smell, water level, hose position, or debris they can physically inspect. The AI has a complementary strength: it can maintain a structured diagnostic state, choose the next check, explain why it matters, and keep the visual model synchronized.

Clunk makes those roles explicit. It does not pretend the browser can inspect the real machine and does not ask the website to call an LLM. The browser exposes a small, structured repair surface through WebMCP; the browser agent reasons, while the human provides the physical evidence.

## Time Budget

- Build window: August 26–September 2, 2026.
- Internal submission-ready target: September 2 at 1:00 PM PT, one day before the official deadline.
- Exact participant hours are not specified; the implementation is scoped for an autonomous, static-first build with no backend dependencies.
- Freeze the submitted repository and live site after September 3 at 1:00 PM PT.

## Core Workflow

1. The page immediately explains the no-drain repair flow and exposes a searchable catalog of supported washer model families.
2. The user or agent selects the exact model family and starts the diagnosis.
3. Clunk shows the first safety preparation and the component relevant to the next check.
4. The person performs a safe physical observation and records the result.
5. The diagnostic state updates: progress, highlighted component, likely causes, next safe check, and agent activity all change together.
6. The agent can inspect state or invoke the same actions through WebMCP tools.
7. Once evidence is sufficient, Clunk shows the leading cause, source provenance, repair context, and either an evidence-backed exact part or an explicit model-variant verification requirement.
8. Any hazardous observation or unsupported repair path deterministically escalates to a professional.

## What We Are Building

- Twelve real front-load washer model families across LG, Samsung, GE, Whirlpool, Maytag, and Electrolux.
- One hero symptom: washer will not drain.
- Original topology-based SVGs with interactive, keyboard-accessible components; no manufacturer diagram is copied.
- A static, schema-validated repair-pack catalog with official manufacturer support sources, last-verified dates, and compatibility confidence.
- A deterministic diagnosis state machine with progress and evidence.
- Likely causes that update from recorded observations.
- Safe next checks with explicit preconditions and stop conditions.
- Exact real part results only for fully verified model/product-code matches; all other paths stop at a compatibility verification boundary.
- Repair context clearly labeled as educational and non-diagnostic.
- Eight literal document.modelContext.registerTool() tools:
  - search_supported_appliances
  - select_appliance
  - get_repair_state
  - start_diagnosis
  - show_component
  - record_observation
  - find_compatible_part
  - stop_and_escalate
- A manual judge mode that invokes the same application actions when WebMCP is unavailable.
- A visible activity log and tool inspector.
- Deterministic unit/integration tests and WebMCP evaluation fixtures.
- Responsive, keyboard-accessible, reduced-motion-aware UI.
- Public open-source repository, license, live Lovable URL, README, and demo/submission materials.

## What We Are Not Building

- Universal appliance coverage or unsupported-model inference.
- Additional appliance types or symptoms in the submission build.
- Image upload, OCR, computer vision, sound classification, or sensor integrations.
- A chatbot or any application-side LLM/API call.
- Accounts, authentication, database, server functions, analytics, payments, or commerce.
- Checkout, affiliate links, live pricing, or a claim that a part fits without the required complete model code.
- Crowdsourced repair records or user persistence beyond an optional local session reset.
- Instructions involving gas, mains/high voltage, refrigerant, sealed compressors, bypassing protections, wiring, internal control boards, or professional-only procedures.
- Internal panel removal or drain-pump replacement instructions; the MVP can identify a fictional pump as a likely part while escalating installation.
- Production guarantees, warranties, or claims that Clunk replaces a technician.

## Inspiration And References

- [OpenAI Developers Showcase](https://developers.openai.com/showcase?view=webmcp-apps): restrained black/white palette, generous spacing, direct hierarchy, and product screenshots that explain themselves.
- Margin Editor: a clean shared surface where an agent acts on the same artifact the person sees.
- Crossword Desk: a constrained visual model whose state is naturally collaborative.
- Sunday Table and WanderNote: visible, editable plans that make agent actions legible rather than hiding them in chat.

Clunk will borrow the clarity and restraint, not copy proprietary assets, layouts, or branding.

## Demo Path

1. Open Clunk; the model, symptom, and promise are visible immediately.
2. Ask the browser agent to diagnose why the washer will not drain.
3. Agent calls get_repair_state, identify_appliance, and start_diagnosis; the activity log and progress rail update.
4. Agent highlights the drain hose and asks the person whether it is kinked.
5. Person reports “hose is clear”; the agent records the result.
6. Agent highlights the pump filter and shows the safe check.
7. Person reports “filter is blocked”; the likely cause jumps to the top and the exact CL-PF-220 fictional filter appears.
8. Show the tool inspector and reset to manual demo mode to prove the same state transitions work without WebMCP.

## Submission Story

The wow moment is not a chatbot answer. It is the instant when the agent invokes a structured tool and the exact physical component lights up while the diagnostic rail, next check, likely causes, and activity log all move together. Clunk demonstrates why WebMCP matters: the agent gains a safe, domain-specific action surface, and the person remains the source of real-world observations.

## Success Criteria

- A first-time visitor can explain Clunk’s purpose within five seconds.
- The main demo reaches a fictional compatible part in under two minutes.
- Every WebMCP call visibly updates the shared UI or returns its current state.
- Manual and agent actions use the same reducer and yield identical states.
- Safety-blocked requests cannot reveal hazardous instructions.
- The live experience works without credentials and without any network request after initial static assets load.
