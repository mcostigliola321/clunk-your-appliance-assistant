# Visual assets

## Accuracy boundary

Clunk uses original topology orientations, not model-specific service diagrams. They show how a real front-load or conventional U.S. top-load washer is normally organized, while the interface states plainly that exact component placement varies by model and engineering revision.

The mechanical review used manufacturer evidence rather than the previous generated images alone:

- LG documents the user-accessible drain-pump filter behind the lower-front access panel on its front-load architecture: https://www.lg.com/ca_en/laundry/washers/wm3400cw/lgsubscribe/
- GE's official parts catalog separates the top-load tub, basket, agitator, suspension, pump, and drive assemblies: https://www.geapplianceparts.com/store/parts/ModelSectionParts/GTWN4250D1WS/4/0/0/0/SUSPENSION%2C_PUMP_%26_DRIVE_COMPONENTS
- GE's official front-load parts catalog identifies a suspended outer tub, tub-to-pump hose, single drain pump, and drain hose: https://www.geapplianceparts.com/store/parts/ModelSectionParts/GFQ14ESSN0WW/3/0/0/0/TUB

The HTML hotspots are explanatory overlays. They never claim that a generated pixel is a verified service location.

## Front-load topology v3

- File: `public/assets/clunk-washer-front-load-topology-v3.png`
- Mode: built-in image generation with the retired v2 asset as a style-only reference, followed by background extraction
- Generated: 2026-08-26
- Background: genuine alpha transparency, verified after generation
- Mechanical constraints: one horizontal basket inside one outer tub; upper springs and lower dampers; one connected sump-to-pump-to-drain path; filter cap integrated with the low-front pump housing; enclosed upper control module

### Base generation prompt

> Use case: scientific-educational
> Asset type: interactive appliance topology illustration for the Clunk repair-bench web app
> Input image: Image 1 is a visual style and framing reference only; replace its mechanically implausible plumbing and floating components.
> Primary request: Generate an original, unbranded, technically conservative cutaway of a modern front-load washing machine. It must look like a plausible real appliance while remaining a generalized topology diagram, not a manufacturer-specific service drawing.
> Required mechanical architecture:
>
> - one horizontal perforated stainless-steel inner basket nested inside one molded polymer outer tub
> - front door and bellows gasket aligned to the tub opening
> - outer tub suspended by upper springs and stabilized by two lower dampers
> - a single sump outlet at the bottom of the outer tub feeding one short corrugated sump hose
> - one compact drain-pump housing mounted low behind the front lower service area
> - the user-accessible pump-filter cap is physically part of that same pump housing, directly behind a small lower-front access flap
> - one outlet hose leaves the pump and routes upward toward the rear drain-hose exit
> - one control module enclosed behind the upper front fascia, not a floating exposed circuit board
> - a rear direct-drive motor may be mostly hidden behind the tub
>   Scene/backdrop: isolated appliance with genuinely transparent background
>   Style/medium: clean semi-realistic 3D educational cutaway, slightly diagrammatic rather than photoreal; believable painted steel, molded polymer, rubber hoses, stainless basket
>   Composition/framing: centered three-quarter front view, complete appliance visible with comfortable square padding; lower filter/pump path clearly visible for UI hotspots
>   Lighting/mood: soft neutral studio lighting, calm and precise
>   Color palette: warm white cabinet, graphite internals, stainless basket, very restrained amber service accents
>   Constraints: no text, no labels, no arrows, no logos, no watermark, no people, no tools; one pump only; all hoses must visibly connect; no detached, duplicated, floating, or impossible components; no claim of exact model fidelity
>   Avoid: exploded-parts cloud, exposed high-voltage wiring, colorful wire clutter, dramatic shadows, blueprint grid, dark background

### Background extraction prompt

> Remove only the light gray and white checkerboard background and replace it with genuine transparency. Preserve the front-load washer cutaway exactly. Output must have a real alpha channel with fully transparent pixels outside the appliance; no checkerboard pixels, solid backdrop, halos, detached shadows, text, logos, or component changes.

## Top-load topology v2

- File: `public/assets/clunk-washer-top-load-topology-v2.png`
- Mode: built-in image generation with the retired v1 asset as a style-only reference, followed by two plumbing corrections and background replacement
- Generated: 2026-08-26
- Background: baked checkerboard output was rejected; the shipped image uses a quiet solid warm canvas matching the application surface
- Mechanical constraints: rear control console; vertical basket and outer tub; center agitator; four suspension rods; vertical gearcase plus belt and offset motor; one low drain pump with exactly one inlet and one rear-rising outlet

### Base generation prompt

> Use case: scientific-educational
> Asset type: interactive appliance topology illustration for the Clunk repair-bench web app
> Input image: Image 1 is a visual style and framing reference only; replace its implausible front-mounted controls and display-like plumbing.
> Primary request: Generate an original, unbranded, technically conservative cutaway of a conventional U.S. top-load washing machine with a center agitator. It must look like a plausible real GE/Whirlpool/Maytag/Samsung-style architecture while remaining a generalized topology diagram, not a manufacturer-specific service drawing.
> Required mechanical architecture:
>
> - hinged top lid open above a vertical perforated stainless-steel wash basket
> - one nontransparent molded outer tub surrounding the basket
> - center agitator fixed to a vertical drive shaft
> - four suspension rods descending from the upper cabinet corners to support the outer tub
> - a vertical gearcase below the tub, with a plausible pulley/belt and offset drive motor mounted low beneath the tub
> - one separate compact drain pump mounted low near the base, connected by one short tub-to-pump hose
> - one pump outlet hose routes upward along the rear-right cabinet wall to a rear drain-hose exit
> - control module enclosed inside a conventional rear control console across the back edge of the top panel; show only a subtle cutaway window, never a floating bare circuit board
> - front and one side of the steel cabinet partially removed only to reveal the architecture; no front service door
>   Scene/backdrop: isolated appliance
>   Style/medium: clean semi-realistic 3D educational cutaway, slightly diagrammatic rather than photoreal
>   Composition/framing: centered three-quarter front view, complete appliance visible with comfortable square padding; basket, suspension, low drive assembly, drain pump, and rear hose all legible for UI hotspots
>   Lighting/mood: soft neutral studio lighting, calm and precise
>   Color palette: warm white cabinet, graphite internals, stainless basket, very restrained amber service accents
>   Constraints: no text, labels, arrows, logos, watermark, people, or tools; one pump only; all hoses must visibly connect; rear control console only; no detached, duplicated, floating, or impossible components; no claim of exact model fidelity
>   Avoid: front-mounted control panel, exposed floating circuit board, front access flap, oversized external pump, exploded-parts cloud, exposed high-voltage wiring, colorful wire clutter, dramatic shadows, blueprint grid, dark background

### Plumbing correction prompts

> Remove the hose that incorrectly disappears through the base pan. Add one plausible tub-to-pump inlet hose from the outer-tub outlet to the pump without crossing the belt. Keep the pump outlet connected to the hose rising along the rear-right wall. Preserve every other component.

> Remove the remaining extra dangling pump hose. The pump must have exactly two closed water paths: the inlet from the outer tub and the outlet rising along the rear-right wall. No third hose, open hose end, or hose entering the base pan.

### Final background prompt

> Replace only the baked checkerboard background with one quiet warm off-white application-surface background. Preserve the top-load topology exactly; no checker squares, text, logos, or component changes.

## Retired assets

`clunk-washer-cutaway-v2.png` and `clunk-washer-top-load-cutaway-v1.png` failed the mechanical-credibility review because they showed duplicated or display-like plumbing and implausible component placement. They were removed from the public asset bundle and remain recoverable from Git history only.
