---
name: Clunk
description: Approachable Precision — a calm visual field guide that makes appliance diagnosis exact, legible, and safe for ordinary homeowners.
colors:
  paper: "#f2f6f3"
  paper-strong: "#e8efeb"
  white: "#ffffff"
  ink: "#14231d"
  muted: "#4d6057"
  line: "#b9c9c1"
  line-strong: "#7f958a"
  tide: "#0b5d4c"
  tide-dark: "#073f35"
  tide-pale: "#d4eae2"
  citron: "#dff46a"
  citron-dark: "#64730c"
  sky: "#dcebf3"
  amber: "#f2e4bc"
  peach: "#eed9cd"
  success: "#136c49"
  success-pale: "#dcefe5"
  stop: "#a3302a"
  stop-pale: "#f8e4e1"
typography:
  display:
    fontFamily: "Albert Sans Variable, Albert Sans, sans-serif"
    fontSize: "clamp(52px, 7.4vw, 94px)"
    fontWeight: 650
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Albert Sans Variable, Albert Sans, sans-serif"
    fontSize: "clamp(42px, 5vw, 72px)"
    fontWeight: 650
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Albert Sans Variable, Albert Sans, sans-serif"
    fontSize: "clamp(28px, 3vw, 44px)"
    fontWeight: 680
    lineHeight: 1.03
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Albert Sans Variable, Albert Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Albert Sans Variable, Albert Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 760
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  square: "0px"
  code: "6px"
  small: "8px"
  field: "9px"
  control: "10px"
  inset-control: "12px"
  surface: "14px"
  pill: "999px"
spacing:
  micro: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "28px"
  3xl: "36px"
  shell: "clamp(16px, 3vw, 48px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.tide}"
    textColor: "{colors.white}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  button-purchase:
    backgroundColor: "{colors.citron}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  button-purchase-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  input-search:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.surface}"
    padding: "0 18px"
    height: "70px"
  card-working:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "24px"
  card-result:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.surface}"
    padding: "24px"
  status-pill:
    backgroundColor: "{colors.paper-strong}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "36px"
  appliance-choice:
    backgroundColor: "{colors.tide-pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0 18px 20px"
    height: "365px"
---

# Design System: Clunk

## Overview

**Creative North Star: "Approachable Precision"**

Clunk is a premium visual field guide for ordinary homeowners: calm enough for a stressful repair moment, exact enough to earn trust, and direct enough to use without learning a repair vocabulary. The visual world combines cool field paper, graphite ink, precise ruled divisions, generous breathing room, and recognizable cutaway appliances. It feels edited and consumer-facing, never like a workshop prop or an enterprise control room.

The appliance is the interface. Each surface advances one visible journey—appliance → problem → model → location → observation → part, fix, or service—and the main decision always sits beside the relevant physical location. Citron marks the next meaningful action or active point; tide green carries trust, focus, and progression. Exact part and seller information moves into a deliberately dark result field with a clean commerce inset, separating an actionable answer from guidance and evidence.

This is the user-pinned, code-led Approachable Precision world established by seed `3ce3190a`. Protocol detail, source traces, and WebMCP activity remain available in secondary disclosures. They support the answer without becoming the customer experience.

**Key Characteristics:**

- Recognizable cutaway appliances lead the first viewport and every inspection step.
- Cool paper fields and graphite hairlines create calm structure without decorative chrome.
- Citron behaves as a scarce physical marker for active, selected, and purchase-ready moments.
- Large, tightly set headings pair with plain-language copy and compact evidence labels.
- Commerce and exact-fit proof share one high-contrast result field; proof-system detail stays secondary.

## Colors

The palette is a cool field-paper base with graphite structure, tide-green trust, a citron action marker, and quiet category washes that keep appliance choices distinct.

### Primary

- **Tide Green:** The main interactive and progress color for focus, selected filters, current-state labels, and hover transitions.
- **Deep Tide:** The technical-trust anchor used inside active location markers and line illustrations.
- **Pale Tide:** The calm selected surface for tabs, category plates, hover backgrounds, and model guidance.

### Secondary

- **Citron Marker:** A deliberately scarce signal for primary decisions, active hotspot rings, completed examples, and purchase action.
- **Deep Citron:** Supporting text contrast when citron needs a darker semantic companion.

### Tertiary

- **Sky Plate, Amber Plate, and Peach Plate:** Low-chroma category fields that distinguish appliance types without turning the interface into a generic multicolor dashboard.
- **Success Green and Success Wash:** Verified availability and ready states, always paired with words or an icon.
- **Stop Red and Stop Wash:** Safety boundaries, unsupported input, and professional-only outcomes, always expressed in plain language.

### Neutral

- **Cool Field Paper:** The page canvas and default quiet control surface.
- **Strong Field Paper:** Secondary bands, code samples, status backgrounds, and subdued grouping.
- **Clean White:** Raised working surfaces, appliance plates, fields, and the commerce inset.
- **Graphite Ink:** Primary text, dark actions, and the exact-result field.
- **Muted Graphite:** Explanations, supporting metadata, captions, and disclosure text.
- **Reed Hairline and Structural Reed:** Subtle and strong rules that organize the field without card chrome.

### Named Rules

**The Citron Is a Marker Rule.** Citron identifies the next meaningful action, current physical point, or verified commerce action; it never becomes a decorative background wash across the whole interface.

**The Category Color Serves the Appliance Rule.** Category washes belong behind appliance cutaways and category-specific guidance, not on unrelated content containers.

**The Semantic Color Rule.** Success and stop colors must always travel with explicit text or iconography; no safety or availability meaning may rely on color alone.

## Typography

**Display Font:** Albert Sans Variable (with Albert Sans and sans-serif fallback)  
**Body Font:** Albert Sans Variable (with Albert Sans and sans-serif fallback)  
**Label/Mono Font:** Albert Sans Variable for interface labels; `ui-monospace`, SFMono-Regular, Consolas, and monospace only for model examples and developer evidence.

**Character:** The single variable sans family keeps the product familiar and consumer-clear while its upper weights deliver technical confidence. Very large, tightly tracked questions provide editorial presence; compact, high-weight labels create exact wayfinding without shouting.

### Hierarchy

- **Display** (650, `clamp(52px, 7.4vw, 94px)`, 0.94): First-viewport questions only; keep the copy short enough to remain a decisive visual anchor.
- **Headline** (650, `clamp(42px, 5vw, 72px)`, 0.98): Journey-stage questions such as symptom and model identification.
- **Title** (680, `clamp(28px, 3vw, 44px)`, 1.03): Current inspection questions, answer titles, and major working-surface headings.
- **Body** (400, 16px, 1.5): Plain-language guidance. Long explanations should stay near 60–66 characters per line where the layout allows.
- **Label** (760, 12px, 1.4): Status, progress, location, capability, and evidence labels; use sentence case and concise phrasing.

### Named Rules

**The Question Leads Rule.** Each journey stage opens with one large plain-language question; explanatory copy supports it instead of competing at the same scale.

**The Sentence Case Rule.** Consumer-facing controls and labels stay in sentence case. Technical casing is reserved for model numbers, part numbers, and literal tool evidence.

## Layout

The application sits in a centered fluid shell capped at 1680px with responsive inline padding (`clamp(16px, 3vw, 48px)`). Desktop composition uses a 12-column field. The opening four appliance actions each span three columns, creating one continuous ruled plate rather than four floating cards. At 1100px they become a two-by-two field; at 620px they remain a compact two-column choice grid so the appliance world still fills the first mobile viewport.

Journey stages reveal progressively rather than accumulating dashboard panels. Problem selection uses a cutaway plate beside one decision column with no more than four peer choices: a compact two-by-two field on wide screens and one column on small screens. The diagnostic bench uses an approximately 1.15/0.85 split between the sticky appliance canvas and the current question or result, with a 28–64px responsive gap. At 820px the split becomes one column, the appliance is no longer sticky, and a completed result moves ahead of the illustration so the answer is immediate.

Spacing follows an 8px-centered rhythm with 12px, 16px, 20px, 24px, 28px, and 36px supporting steps. Major surfaces breathe; compact evidence rows use hairlines and smaller gaps instead of nested containers.

**The Appliance-First Rule.** Every diagnostic decision must remain visually tied to a recognizable appliance or highlighted location; do not replace that relationship with a search directory, chat transcript, or data table.

**The One Decision Column Rule.** A stage may present one primary question, one answer set, and one quieter back or evidence route. Secondary proof belongs below or behind disclosure.

## Elevation & Depth

Clunk is flat by default and lifted only where a homeowner is expected to inspect, decide, or act. Hairlines structure the opening field, navigation, progress, directories, and evidence. White working surfaces use a soft graphite-green ambient shadow; cutaway artwork uses restrained object drop shadows so the appliance reads as a physical reference rather than a decorative rendering.

### Shadow Vocabulary

- **Working Surface** (`0 22px 50px rgba(20, 35, 29, 0.11)`): Appliance canvases, current-check cards, model-label guidance, and result surfaces.
- **Decision Lift** (`0 18px 36px rgba(20, 35, 29, 0.10)`): The single supported-problem choice where it must read as the next decisive action.
- **Appliance Object** (`drop-shadow(0 24px 28px rgba(20, 35, 29, 0.14))`): Cutaway art inside a bounded plate; the first viewport uses a slightly tighter version of the same treatment.
- **Active Location** (`0 0 0 2px Deep Tide, 0 8px 18px rgba(20, 35, 29, 0.24)`): The selected physical hotspot only.

### Named Rules

**The Field First, Lift Second Rule.** Start with rules, spacing, and tonal fields. Add elevation only to the active working object or final answer—never to every container.

## Shapes

Major working surfaces use gently curved 14px corners. Fields and compact controls use 9–10px corners, with a 12px inset radius for the search action nested inside its 14px field. Status and capability indicators are true pills. Code samples and tiny labels use 6–8px rounding.

The opening appliance field is intentionally square and ruled edge-to-edge. This contrast makes rounded working surfaces feel purposeful rather than habitual. Active location markers use a 19px circular dot inside an invisible 44px touch target, with a citron ring and a text label so the current location is never color-only.

**The Geometry Has a Job Rule.** Square cells describe the broad catalog field, rounded surfaces describe a focused task, and pills describe compact status or filtering. Do not apply pill shapes to ordinary actions or round every nested region.

## Components

### Buttons

- **Shape:** Substantial controls use 10px corners and at least 44px touch height; primary actions are 48px tall.
- **Primary:** Graphite Ink with Clean White text and 16px horizontal padding. Hover shifts to Tide Green.
- **Secondary:** Cool Field Paper with a Structural Reed border. Hover fills with Pale Tide.
- **Purchase:** Citron Marker with Graphite Ink text, placed only inside the white commerce handoff. Hover inverts to Graphite Ink with Clean White text.
- **Focus:** All interactive controls use a two-stage visible ring—paper separation followed by Tide Green—rather than relying on browser-default outlines.

### Chips

- **Style:** Compact 36px status pills use Strong Field Paper or a semantic wash with 12px horizontal padding and high-weight 12px labeling.
- **State:** Capability filters are 44px-tall outlined pills at rest and become solid Tide Green when selected. Success and stop variants retain explicit text and icons.

### Cards / Containers

- **Corner Style:** Focused working cards use 14px corners; compact secondary containers use 9–10px corners.
- **Background:** White for inspection and input, Graphite Ink for a finished exact answer, and Strong Field Paper for secondary developer context.
- **Shadow Strategy:** Only current working surfaces and final answers receive the Working Surface shadow.
- **Border:** Structural Reed outlines the appliance canvas; lighter Reed Hairlines divide content internally.
- **Internal Padding:** 24px desktop and 20px mobile for primary working cards.

### Inputs / Fields

- **Style:** The model search is a 70px white field with a Structural Reed outline, 14px corners, an 18px input size, and a dark inset search action.
- **Focus:** Focus appears on the field group via the shared paper-and-tide focus ring; the input itself does not create a second ring.
- **Error / Disabled:** Stop Red provides error text with high weight. Placeholder copy remains clearly legible against white.

### Navigation

- **Style:** A 72px ruled top bar holds the Clunk wordmark, one quiet descriptive line, and compact model/session metadata. The wordmark is 28px with a Tide Green period.
- **Responsive:** At 820px the descriptive line leaves; at 620px the model badge leaves while the reset action remains available.
- **State:** Navigation and back actions are quiet text controls whose hover state uses underlining or color, not a new card.

### Appliance Choice Field

Each appliance is a substantial cutaway action inside a shared ruled field. The image occupies most of the action, followed by the appliance name, the count of broad problem guides, and a directional arrow. The appliance action always opens problem selection; no repeated example or limited pilot shares equal prominence with it.

### Symptom Choice Field

The symptom stage presents no more than four mature plain-language observations beside the category cutaway. Every primary choice includes a short behavior description and exact checked-model count, stays keyboard and screen-reader operable, and filters the next model view by actual model × symptom coverage. Routes with only one checked model belong in a clearly labeled **Limited pilots** disclosure with their count; they remain reachable but must not look like equal-strength peers. The UI must never present a category or model count as proof that a particular problem is covered.

### Completed Example Hub

One clearly secondary disclosure on the appliance landing stage opens a compact four-category chooser. Example mode is always labeled, uses prefilled observations, and remains visually subordinate to real diagnosis; each flagship exact result is still reachable in two actions.

### Quiet Roadmap Signal

A short text-only note may sit beneath the working appliance field to say which categories are next to evaluate. It must have no button treatment, hover state, arrow, category image, or availability language. It is a research-direction signal, not a shipping promise or a fifth appliance choice.

### Cutaway Location Hotspot

The hotspot is a 44px accessible button anchored to a physical location on the cutaway. Resting points are small Structural Reed dots; the current location expands to a Deep Tide core, Citron Marker ring, and adjacent Graphite Ink label. Hover deepens the dot to Tide Green.

### Exact Part & Commerce Handoff

The finished answer is a Graphite Ink surface with Clean White type, a Citron Marker icon, exact-fit proof, part name and SKU, fit/location facts, and a separate white commerce inset. The buy action is Citron Marker and the seller, price, availability, and verification language remain together. Supporting evidence follows in a ruled disclosure outside the commerce field.

## Do's and Don'ts

### Do:

- **Do** let a recognizable appliance or location carry the visual weight of every diagnostic stage.
- **Do** preserve the appliance → problem → model → location → observation → part, fix, or service journey and reveal one decision at a time.
- **Do** use ruled hairlines and generous space for most structure, reserving the Working Surface shadow for active inspection and result surfaces.
- **Do** keep Citron Marker scarce and functional: current location, decisive selection, completed example, or verified purchase action.
- **Do** separate exact-fit commerce inside the dark result field and keep evidence or developer detail secondary.
- **Do** label coverage and capability for the selected model × symptom pair, not for the model in general.
- **Do** maintain 44px minimum touch targets, the shared visible focus ring, reduced-motion behavior, and text/icon support for semantic color.

### Don't:

- **Don't** introduce workshop cosplay, grunge, faux tools, distressed materials, or blueprint clichés.
- **Don't** turn the experience into a generic AI dashboard, chat-first interface, repair directory, or repetitive grid of interchangeable cards.
- **Don't** add gradients, glass effects, neon agent styling, ambient glows, or decorative motion.
- **Don't** expose protocol language, tool traces, or evidence mechanics as the primary homeowner experience.
- **Don't** use Citron Marker as an all-over brand wash or semantic red/green without plain-language meaning.
- **Don't** blur guidance, part proof, commerce, and professional-stop outcomes into the same visual treatment.
- **Don't** imply that a supported model covers every visible problem or reuse one check tree under different symptom labels.
