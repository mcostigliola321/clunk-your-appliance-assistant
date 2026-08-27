import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";

import type {
  ApplianceCatalogEntry,
  ApplianceId,
  ApplianceKind,
  BrandName,
  CheckId,
  ComponentId,
  PartId,
  RepairPack,
  RepairPackCause,
  RepairPackCheck,
  RepairPackComponent,
  RepairPackPart,
  ResultId,
} from "./types";

const FORBIDDEN_STEP_TAGS = new Set([
  "gas",
  "mains-voltage",
  "high-voltage",
  "refrigerant",
  "sealed-compressor",
  "bypass-protection",
  "internal-wiring",
  "control-board",
  "energized-test",
  "professional-only-instruction",
]);

const KIND_LABELS: Record<ApplianceKind, string> = {
  washer: "Washer",
  dishwasher: "Dishwasher",
  dryer: "Electric dryer",
  refrigerator: "Refrigerator",
};

const KIND_NOUNS: Record<ApplianceKind, string> = {
  washer: "washer",
  dishwasher: "dishwasher",
  dryer: "dryer",
  refrigerator: "refrigerator",
};

const FALLBACK_COMPONENT: RepairPackComponent = {
  id: "machine",
  label: "Appliance",
  description: "Choose an appliance to begin.",
  access: "visible",
  hotspot: { x: 50, y: 50 },
};

function component(
  id: string,
  label: string,
  description: string,
  access: RepairPackComponent["access"],
  x: number,
  y: number,
): RepairPackComponent {
  return { id, label, description, access, hotspot: { x, y } };
}

function result(
  id: string,
  label: string,
  effect: RepairPackCheck["results"][number]["effect"],
  options: Partial<Omit<RepairPackCheck["results"][number], "id" | "label" | "effect">> = {},
) {
  return { id, label, effect, ...options };
}

function prepareCheck(entry: ApplianceCatalogEntry, sourceIds: string[], nextCheckId: CheckId) {
  const copy: Record<ApplianceKind, { label: string; instruction: string; stop: string }> = {
    washer: {
      label: "Make the washer safe",
      instruction:
        "Cancel the cycle, unplug the washer, and wait until it is completely still. Make sure any standing water is cool.",
      stop: "you notice smoke, a burning smell, hot water, or water near the outlet.",
    },
    dishwasher: {
      label: "Make the dishwasher safe",
      instruction:
        "Cancel the cycle, wait until the water is cool, and turn the dishwasher off. Do not remove any panels.",
      stop: "you notice smoke, a burning smell, hot water, or water near an outlet.",
    },
    dryer: {
      label: "Unplug the dryer",
      instruction:
        "Stop the dryer, unplug it, and wait until the drum is completely still. Keep the door open.",
      stop: "you notice smoke, a burning smell, heat, or a damaged power cord.",
    },
    refrigerator: {
      label: "Check for a leak first",
      instruction:
        "Put a towel below the water-filter area and look for active dripping. Do not move the refrigerator or remove a panel.",
      stop: "water is actively leaking, water is near an outlet, or the filter area is damaged.",
    },
  };
  const selected = copy[entry.kind];
  return {
    id: "safety-check",
    label: selected.label,
    componentId: "machine",
    instruction: selected.instruction,
    why: "A quick safety boundary keeps this diagnosis to visible, low-risk checks.",
    stop: selected.stop,
    safetyTags: ["external-observation", "no-disassembly"],
    sourceIds,
    results: [
      result("safe-ready", "Safe to continue", "continue", { nextCheckId }),
      result("hazard-burning", "Smoke or burning smell", "hazard", {
        escalationReason: "burning-smell",
      }),
      result("hazard-hot-water", "Water or appliance is still hot", "hazard", {
        escalationReason: "hot-water",
      }),
      result("hazard-active-leak", "Active leak near power", "hazard", {
        escalationReason: "active-leak",
      }),
    ],
  } satisfies RepairPackCheck;
}

function washerProfile(entry: ApplianceCatalogEntry, sourceIds: string[]) {
  const components = [
    component(
      "machine",
      entry.loadStyle === "top-load" ? "Top-load washer" : "Front-load washer",
      "The selected washer and its visible exterior.",
      "visible",
      48,
      48,
    ),
    component(
      "drum",
      entry.loadStyle === "top-load" ? "Wash basket" : "Drum",
      "The visible area where clothes are washed.",
      "visible",
      49,
      43,
    ),
    component(
      "drain-hose",
      "Drain hose",
      "The external hose that carries water to the household drain.",
      "visible",
      79,
      47,
    ),
    ...(entry.profile === "washer-front-drain"
      ? [
          component(
            "pump-filter",
            "Drain filter",
            "The lower-front trap that can catch coins, lint, and debris.",
            "user-accessible",
            30,
            79,
          ),
        ]
      : []),
    component(
      "drain-pump",
      "Drain pump",
      "The internal part that pushes water out through the drain hose.",
      "professional-only",
      47,
      74,
    ),
    component(
      "control-module",
      "Controls",
      "Internal controls; Clunk does not provide access instructions for this area.",
      "professional-only",
      50,
      18,
    ),
  ];
  const hoseResults = [
    result("hose-kinked", "The hose is visibly bent or pinched", "no-part-needed", {
      focusComponentId: "drain-hose",
      outcomeTitle: "The hose is the likely problem",
      outcomeMessage:
        "Clear the visible bend without moving the washer, then try a short drain cycle.",
    }),
    entry.profile === "washer-front-drain"
      ? result("hose-clear", "The hose looks clear", "continue", {
          nextCheckId: "inspect-filter",
          focusComponentId: "pump-filter",
        })
      : result("hose-clear", "The hose looks clear", "professional-only", {
          focusComponentId: "drain-pump",
          outcomeTitle: "The next check is inside the washer",
          outcomeMessage:
            "This model has no outside filter Clunk can safely direct you to. A technician should continue.",
        }),
    result("hose-damaged", "The hose is loose or damaged", "professional-only", {
      focusComponentId: "drain-hose",
      outcomeTitle: "Do not run the washer",
      outcomeMessage:
        "A damaged or loose drain hose can leak. A technician should repair the connection before the washer runs.",
    }),
    result("unsafe-to-reach", "I cannot reach it safely", "hazard", {
      escalationReason: "internal-access",
    }),
  ];
  const checks: RepairPackCheck[] = [
    prepareCheck(entry, sourceIds, "inspect-drain-hose"),
    {
      id: "inspect-drain-hose",
      label: "Look at the drain hose",
      componentId: "drain-hose",
      instruction:
        "Follow the visible hose to the household drain. Look for a bend, pinch, loose end, or damage. Do not move the washer.",
      why: "A bent hose can stop water from leaving.",
      stop: "the hose cannot be reached without moving the washer.",
      safetyTags: ["external-observation", "no-disassembly"],
      sourceIds,
      results: hoseResults,
    },
  ];
  if (entry.profile === "washer-front-drain") {
    checks.push({
      id: "inspect-filter",
      label: "Look in the drain filter",
      componentId: "pump-filter",
      instruction:
        "Open only the small lower-front filter door. Put down towels and a shallow pan, drain slowly, then inspect the removable filter.",
      why: "Coins, lint, and debris here can stop draining.",
      stop: "the panel does not match, the cap is stuck, the water is hot, or you see wiring.",
      safetyTags: ["disconnect-power", "cool-water", "spill-control", "user-accessible-filter"],
      sourceIds,
      results: [
        result("filter-blocked", "I found debris", "no-part-needed", {
          focusComponentId: "pump-filter",
          outcomeTitle: "The blockage is the likely problem",
          outcomeMessage: "Clean and reinstall the filter, then run a short drain cycle.",
        }),
        result("filter-clear", "The filter is clear", "part-candidate", {
          focusComponentId: "drain-pump",
          outcomeTitle: "The drain pump is the likely next part",
          outcomeMessage:
            "The outside hose and user-accessible filter look clear, which points next to the drain pump.",
        }),
        result("filter-damaged", "The filter or seal is damaged", "professional-only", {
          focusComponentId: "pump-filter",
          outcomeTitle: "Stop before running the washer",
          outcomeMessage:
            "A damaged filter or seal can leak. A technician should inspect it before the washer runs.",
        }),
        result("filter-mismatch", "My washer does not match this location", "professional-only", {
          focusComponentId: "machine",
          outcomeTitle: "Do not open another panel",
          outcomeMessage:
            "The visible layout does not match this repair pack. Confirm the full model number or use a technician.",
        }),
      ],
    });
  }
  const causes: RepairPackCause[] = [
    {
      id: "washer-hose",
      label: "Bent drain hose",
      componentId: "drain-hose",
      baseRank: 35,
      defaultExplanation: "A visible bend can keep water in the washer.",
      resultScores: { "hose-kinked": 80, "hose-clear": -30 },
      resultExplanations: {
        "hose-kinked": "The bend you saw can explain the standing water.",
        "hose-clear": "The hose looks clear, so the problem is probably farther inside.",
      },
    },
    ...(entry.profile === "washer-front-drain"
      ? [
          {
            id: "washer-filter",
            label: "Blocked drain filter",
            componentId: "pump-filter",
            baseRank: 30,
            defaultExplanation: "Debris can block the drain path.",
            resultScores: { "filter-blocked": 90, "filter-clear": -40 },
            resultExplanations: {
              "filter-blocked": "The debris you found can stop the washer from draining.",
              "filter-clear": "The filter looks clear, making a blockage there less likely.",
            },
          },
        ]
      : []),
    {
      id: "washer-pump",
      label: "Drain pump problem",
      componentId: "drain-pump",
      baseRank: 20,
      defaultExplanation: "The pump may not be moving water out.",
      resultScores: { "hose-clear": 25, "filter-clear": 70 },
      resultExplanations: {
        "filter-clear": "With the hose and filter clear, the pump is the next likely part.",
      },
    },
  ];
  return {
    components,
    checks,
    causes,
    symptom: {
      id: "will-not-drain",
      label: "Washer will not drain",
      shortLabel: "Water stays in the washer",
    },
    illustration:
      entry.loadStyle === "top-load"
        ? {
            src: "/assets/clunk-washer-top-load-topology-v2.png",
            width: 1254,
            height: 1254,
            alt: "Open top-load washer showing the basket and drain path",
          }
        : {
            src: "/assets/clunk-washer-front-load-topology-v3.png",
            width: 1305,
            height: 1205,
            alt: "Front-load washer showing the drum, filter, pump, and drain hose",
          },
    diagramNote: "Location guide, not a service diagram. Exact panel shapes vary by model.",
    example:
      entry.exactPart && entry.profile === "washer-front-drain"
        ? {
            title: "See a complete washer answer",
            summary: "Clear hose + clear filter → verified drain-pump link",
            productCode: entry.verifiedProductCodes[0] ?? entry.model,
            observations: [
              { checkId: "safety-check", resultId: "safe-ready" },
              { checkId: "inspect-drain-hose", resultId: "hose-clear" },
              { checkId: "inspect-filter", resultId: "filter-clear" },
            ],
          }
        : null,
  };
}

function dishwasherProfile(entry: ApplianceCatalogEntry, sourceIds: string[]) {
  return {
    components: [
      component("machine", "Dishwasher", "The selected built-in dishwasher.", "visible", 50, 50),
      component(
        "drain-connection",
        "Under-sink drain connection",
        "The visible hose connection under the sink; do not disconnect it.",
        "visible",
        82,
        66,
      ),
      component(
        "sump-filter",
        "Filter and sump",
        "The removable filter at the bottom of the open tub.",
        "user-accessible",
        49,
        62,
      ),
      component(
        "drain-pump",
        "Drain pump",
        "The pump below the sump that sends used water out.",
        "professional-only",
        50,
        76,
      ),
    ],
    checks: [
      prepareCheck(entry, sourceIds, "inspect-drain-connection"),
      {
        id: "inspect-drain-connection",
        label: "Check the sink drain",
        componentId: "drain-connection",
        instruction:
          "Run the sink briefly and look at the dishwasher hose connection under it. Check for a backed-up sink, a visibly pinched hose, or a recently installed disposal plug. Do not disconnect anything.",
        why: "The dishwasher cannot drain if the shared sink drain is blocked.",
        stop: "the cabinet is wet, wiring is visible, or the connection must be removed.",
        safetyTags: ["external-observation", "no-disassembly", "sink-check"],
        sourceIds,
        results: [
          result("sink-blocked", "The sink or disposal is backed up", "no-part-needed", {
            focusComponentId: "drain-connection",
            outcomeTitle: "Clear the sink drain first",
            outcomeMessage:
              "A backed-up sink or disposal can keep the dishwasher from draining. Clear that household drain before testing again.",
          }),
          result("connection-clear", "The sink and visible hose look clear", "continue", {
            nextCheckId: "inspect-sump-filter",
            focusComponentId: "sump-filter",
          }),
          result("connection-damaged", "The hose is loose, wet, or damaged", "professional-only", {
            focusComponentId: "drain-connection",
            outcomeTitle: "Do not run the dishwasher",
            outcomeMessage:
              "The drain connection may leak. A technician or plumber should repair it first.",
          }),
          result("unsafe-under-sink", "I cannot see it safely", "hazard", {
            escalationReason: "internal-access",
          }),
        ],
      },
      {
        id: "inspect-sump-filter",
        label: "Look in the filter area",
        componentId: "sump-filter",
        instruction:
          "Pull out the lower rack and inspect the removable filter and open sump area. Remove only loose visible debris; do not reach into the pump opening.",
        why: "Food, labels, and glass can block water before it reaches the pump.",
        stop: "you see broken glass, standing hot water, sharp debris, or a damaged filter.",
        safetyTags: ["cool-water", "external-observation", "user-accessible-filter"],
        sourceIds,
        results: [
          result("sump-blocked", "I found loose debris in the filter area", "no-part-needed", {
            focusComponentId: "sump-filter",
            outcomeTitle: "The filter blockage is the likely problem",
            outcomeMessage:
              "Remove only safe, loose debris, reinstall the filter, and test a short drain cycle.",
          }),
          result("sump-clear", "The filter and sump look clear", "part-candidate", {
            focusComponentId: "drain-pump",
            outcomeTitle: "The drain pump is the likely next part",
            outcomeMessage:
              "The sink connection and user-accessible filter area look clear, which points next to the drain pump.",
          }),
          result("sump-damaged", "The filter is damaged or I see glass", "professional-only", {
            focusComponentId: "sump-filter",
            outcomeTitle: "Stop at the filter",
            outcomeMessage:
              "Sharp debris or damaged filter parts need careful service before the dishwasher runs.",
          }),
        ],
      },
    ] satisfies RepairPackCheck[],
    causes: [
      {
        id: "dishwasher-sink",
        label: "Blocked sink drain",
        componentId: "drain-connection",
        baseRank: 35,
        defaultExplanation: "A shared sink blockage can stop dishwasher drainage.",
        resultScores: { "sink-blocked": 90, "connection-clear": -35 },
      },
      {
        id: "dishwasher-sump",
        label: "Blocked filter area",
        componentId: "sump-filter",
        baseRank: 30,
        defaultExplanation: "Food or labels can block the filter area.",
        resultScores: { "sump-blocked": 90, "sump-clear": -40 },
      },
      {
        id: "dishwasher-pump",
        label: "Drain pump problem",
        componentId: "drain-pump",
        baseRank: 20,
        defaultExplanation: "The drain pump may not be pushing water out.",
        resultScores: { "connection-clear": 25, "sump-clear": 70 },
        resultExplanations: {
          "sump-clear":
            "With the outside connection and filter clear, the drain pump is the next likely part.",
        },
      },
    ] satisfies RepairPackCause[],
    symptom: {
      id: "will-not-drain",
      label: "Dishwasher will not drain",
      shortLabel: "Water stays in the dishwasher",
    },
    illustration: {
      src: "/assets/clunk-dishwasher-topology-v1.png",
      width: 1254,
      height: 1254,
      alt: "Open dishwasher showing the filter, sump, pump, and drain connection",
    },
    diagramNote:
      "Location guide, not a service diagram. The pump is shown for orientation only; do not remove panels.",
    example: entry.exactPart
      ? {
          title: "See a complete dishwasher answer",
          summary: "Clear sink + clear filter → verified drain-pump link",
          productCode: entry.verifiedProductCodes[0] ?? entry.model,
          observations: [
            { checkId: "safety-check", resultId: "safe-ready" },
            { checkId: "inspect-drain-connection", resultId: "connection-clear" },
            { checkId: "inspect-sump-filter", resultId: "sump-clear" },
          ],
        }
      : null,
  };
}

function dryerProfile(entry: ApplianceCatalogEntry, sourceIds: string[]) {
  return {
    components: [
      component(
        "machine",
        "Electric dryer",
        "The selected electric dryer with its door open.",
        "visible",
        47,
        49,
      ),
      component(
        "door-strike",
        "Door strike",
        "The small visible catch on the edge of the dryer door.",
        "user-accessible",
        76,
        48,
      ),
      component(
        "door-latch",
        "Door latch",
        "The matching catch on the front opening.",
        "user-accessible",
        63,
        47,
      ),
      component(
        "drum",
        "Drum",
        "The clothes drum; no internal access is needed for this check.",
        "visible",
        44,
        45,
      ),
    ],
    checks: [
      prepareCheck(entry, sourceIds, "inspect-door-strike"),
      {
        id: "inspect-door-strike",
        label: "Look at the door catch",
        componentId: "door-strike",
        instruction:
          "With the dryer unplugged and door open, inspect the small strike on the door edge. Look for a crack, missing piece, or obvious bend. Do not remove the front panel.",
        why: "A broken $7 door strike can keep the door from latching.",
        stop: "the door is hot, the hinge is loose, or the front panel is damaged.",
        safetyTags: ["disconnect-power", "external-observation", "visible-door-hardware"],
        sourceIds,
        results: [
          result("strike-broken", "The strike is cracked, bent, or missing", "part-candidate", {
            focusComponentId: "door-strike",
            outcomeTitle: "The door strike is the likely part",
            outcomeMessage:
              "The visible strike is damaged, matching the reason the door will not stay closed.",
          }),
          result("strike-intact", "The strike looks intact", "professional-only", {
            focusComponentId: "door-latch",
            outcomeTitle: "The latch or alignment needs a closer look",
            outcomeMessage:
              "The visible strike looks intact. The matching latch, hinge alignment, or front panel should be checked by a technician.",
          }),
          result("hinge-damaged", "The door or hinge is loose", "professional-only", {
            focusComponentId: "machine",
            outcomeTitle: "The door needs service",
            outcomeMessage:
              "A loose hinge or damaged door can prevent safe operation. Do not run the dryer until it is repaired.",
          }),
        ],
      },
    ] satisfies RepairPackCheck[],
    causes: [
      {
        id: "dryer-strike",
        label: "Broken door strike",
        componentId: "door-strike",
        baseRank: 55,
        defaultExplanation: "The visible strike is a common reason a dryer door will not latch.",
        resultScores: { "strike-broken": 90, "strike-intact": -50 },
        resultExplanations: {
          "strike-broken": "The cracked or missing strike you saw directly matches the symptom.",
        },
      },
      {
        id: "dryer-latch",
        label: "Door latch or alignment",
        componentId: "door-latch",
        baseRank: 30,
        defaultExplanation: "The matching latch or door alignment may be preventing closure.",
        resultScores: { "strike-intact": 65 },
      },
    ] satisfies RepairPackCause[],
    symptom: {
      id: "door-will-not-close",
      label: "Dryer door will not stay closed",
      shortLabel: "Door will not stay closed",
    },
    illustration: {
      src: "/assets/clunk-electric-dryer-topology-v2.png",
      width: 1275,
      height: 1234,
      alt: "Open electric dryer showing the drum, door strike, and matching latch",
    },
    diagramNote:
      "Location guide, not a service diagram. This flow covers visible door hardware only—never gas, wiring, or energized tests.",
    example: entry.exactPart
      ? {
          title: "See a complete dryer answer",
          summary: "Broken visible catch → verified $7 part link",
          productCode: entry.verifiedProductCodes[0] ?? entry.model,
          observations: [
            { checkId: "safety-check", resultId: "safe-ready" },
            { checkId: "inspect-door-strike", resultId: "strike-broken" },
          ],
        }
      : null,
  };
}

function refrigeratorProfile(entry: ApplianceCatalogEntry, sourceIds: string[]) {
  return {
    components: [
      component(
        "machine",
        "Refrigerator",
        "The selected refrigerator and its fresh-food compartment.",
        "visible",
        50,
        50,
      ),
      component(
        "water-filter",
        "Water filter",
        "The twist-in filter inside the fresh-food compartment.",
        "user-accessible",
        63,
        22,
      ),
      component(
        "water-dispenser",
        "Water dispenser",
        "The door dispenser where slow flow is noticed.",
        "visible",
        29,
        46,
      ),
      component(
        "water-line",
        "Water supply line",
        "The external supply line; do not move the refrigerator to inspect it.",
        "professional-only",
        78,
        73,
      ),
    ],
    checks: [
      prepareCheck(entry, sourceIds, "inspect-water-filter"),
      {
        id: "inspect-water-filter",
        label: "Check the filter age",
        componentId: "water-filter",
        instruction:
          "Open the fresh-food compartment and locate the twist-in filter. Check the replacement indicator or when it was last changed. Do not force or remove a stuck filter.",
        why: "An old or clogged filter is a common cause of slow dispenser flow.",
        stop: "the housing is wet, cracked, stuck, or does not match the location shown.",
        safetyTags: ["external-observation", "spill-control", "user-replaceable-filter"],
        sourceIds,
        results: [
          result(
            "filter-overdue",
            "The filter is old, unknown, or shows Replace",
            "part-candidate",
            {
              focusComponentId: "water-filter",
              outcomeTitle: "Replace the water filter first",
              outcomeMessage:
                "The filter is due for replacement and directly affects dispenser flow.",
            },
          ),
          result("filter-recent", "The filter was changed recently", "professional-only", {
            focusComponentId: "water-line",
            outcomeTitle: "The filter is probably not the cause",
            outcomeMessage:
              "A recent filter makes the supply line, valve, or dispenser more likely. Those checks require service beyond this safe flow.",
          }),
          result(
            "filter-area-damaged",
            "The housing is wet, cracked, or stuck",
            "professional-only",
            {
              focusComponentId: "water-filter",
              outcomeTitle: "Do not remove the filter",
              outcomeMessage: "The housing could leak if forced. A technician should inspect it.",
            },
          ),
          result(
            "filter-location-mismatch",
            "My refrigerator does not match this location",
            "professional-only",
            {
              focusComponentId: "machine",
              outcomeTitle: "Confirm the full model number",
              outcomeMessage:
                "Filter locations and parts vary. Do not order until the complete model number is confirmed.",
            },
          ),
        ],
      },
    ] satisfies RepairPackCheck[],
    causes: [
      {
        id: "refrigerator-filter",
        label: "Old water filter",
        componentId: "water-filter",
        baseRank: 60,
        defaultExplanation: "A loaded filter can slow dispenser flow.",
        resultScores: { "filter-overdue": 90, "filter-recent": -55 },
        resultExplanations: {
          "filter-overdue":
            "The age or replacement light makes the filter the first part to change.",
        },
      },
      {
        id: "refrigerator-supply",
        label: "Supply line or valve",
        componentId: "water-line",
        baseRank: 25,
        defaultExplanation: "Restricted incoming water can also reduce flow.",
        resultScores: { "filter-recent": 65 },
      },
    ] satisfies RepairPackCause[],
    symptom: {
      id: "slow-water-flow",
      label: "Refrigerator water dispenser is slow",
      shortLabel: "Water dispenser is slow",
    },
    illustration: {
      src: "/assets/clunk-refrigerator-topology-v1.png",
      width: 1254,
      height: 1254,
      alt: "Open refrigerator showing the fresh-food water filter and door dispenser",
    },
    diagramNote:
      "Location guide, not a service diagram. This flow never covers refrigerant, compressors, or sealed-system work.",
    example: entry.exactPart
      ? {
          title: "See a complete refrigerator answer",
          summary: "Old filter → verified replacement link",
          productCode: entry.verifiedProductCodes[0] ?? entry.model,
          observations: [
            { checkId: "safety-check", resultId: "safe-ready" },
            { checkId: "inspect-water-filter", resultId: "filter-overdue" },
          ],
        }
      : null,
  };
}

function buildPack(entry: ApplianceCatalogEntry): RepairPack {
  const sources = [entry.modelSource, ...entry.troubleshootingSources];
  if (entry.exactPart) sources.push(entry.exactPart.source);
  const sourceIds = sources.map((item) => item.id);
  const profile =
    entry.kind === "washer"
      ? washerProfile(entry, sourceIds)
      : entry.kind === "dishwasher"
        ? dishwasherProfile(entry, sourceIds)
        : entry.kind === "dryer"
          ? dryerProfile(entry, sourceIds)
          : refrigeratorProfile(entry, sourceIds);
  return {
    id: entry.id,
    schemaVersion: 3,
    appliance: {
      kind: entry.kind,
      kindLabel: KIND_LABELS[entry.kind],
      noun: KIND_NOUNS[entry.kind],
      brand: entry.brand,
      model: entry.model,
      type: entry.label,
      ...(entry.loadStyle ? { loadStyle: entry.loadStyle } : {}),
      topology: entry.topology ?? "washer-front-filter",
      illustration: profile.illustration,
      diagramNote: profile.diagramNote,
    },
    symptom: profile.symptom,
    productCodePrompt: entry.productCodePrompt,
    verifiedProductCodes: entry.verifiedProductCodes,
    components: profile.components,
    checks: profile.checks,
    causes: profile.causes,
    parts: entry.exactPart ? [entry.exactPart] : [],
    sources,
    example: profile.example,
  };
}

export function assertRepairPack(pack: RepairPack): RepairPack {
  if (pack.schemaVersion !== 3 || !pack.appliance.brand || !pack.appliance.model)
    throw new Error("Repair packs require schema version 3 and a real model identity.");
  const componentIds = new Set(pack.components.map((item) => item.id));
  const checkIds = new Set(pack.checks.map((item) => item.id));
  const sourceIds = new Set(pack.sources.map((item) => item.id));
  if (
    componentIds.size !== pack.components.length ||
    checkIds.size !== pack.checks.length ||
    sourceIds.size !== pack.sources.length
  )
    throw new Error(`Repair pack ${pack.id} contains duplicate identifiers.`);
  if (!pack.sources.some((item) => item.kind === "manufacturer-model"))
    throw new Error(`Repair pack ${pack.id} requires an official model source.`);
  const resultIds = new Set<string>();
  for (const check of pack.checks) {
    if (!componentIds.has(check.componentId))
      throw new Error(`Check ${check.id} references an unknown component.`);
    if (!check.sourceIds.every((id) => sourceIds.has(id)))
      throw new Error(`Check ${check.id} references an unknown source.`);
    for (const tag of check.safetyTags)
      if (FORBIDDEN_STEP_TAGS.has(tag))
        throw new Error(`Check ${check.id} contains forbidden safety tag ${tag}.`);
    for (const item of check.results) {
      if (resultIds.has(item.id))
        throw new Error(`Repair pack result IDs must be unique: ${item.id}.`);
      resultIds.add(item.id);
      if (item.nextCheckId && !checkIds.has(item.nextCheckId))
        throw new Error(`Result ${item.id} references an unknown next check.`);
      if (item.focusComponentId && !componentIds.has(item.focusComponentId))
        throw new Error(`Result ${item.id} references an unknown component.`);
    }
  }
  for (const cause of pack.causes) {
    if (!componentIds.has(cause.componentId))
      throw new Error(`Cause ${cause.id} references an unknown component.`);
  }
  for (const source of pack.sources) {
    if (!source.url.startsWith("https://") || !/^\d{4}-\d{2}-\d{2}$/.test(source.lastVerified))
      throw new Error(`Source ${source.id} is missing a secure URL or verification date.`);
  }
  for (const part of pack.parts) {
    if (!componentIds.has(part.componentId) || part.compatibleProductCodes.length === 0)
      throw new Error(`Part ${part.id} lacks component or compatibility evidence.`);
    if (!["manufacturer-part", "authorized-parts"].includes(part.source.kind))
      throw new Error(`Part ${part.id} requires manufacturer or authorized-parts evidence.`);
    if (
      !part.purchase.url.startsWith("https://") ||
      !/^\d{4}-\d{2}-\d{2}$/.test(part.purchase.lastVerified)
    )
      throw new Error(`Part ${part.id} requires a secure, dated seller handoff.`);
  }
  return pack;
}

export const REPAIR_PACKS = new Map(
  APPLIANCE_CATALOG.map((entry) => [entry.id, assertRepairPack(buildPack(entry))]),
);

export function normalizeModel(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function searchCatalog(
  query = "",
  brand?: BrandName | null,
  kind?: ApplianceKind | null,
): ApplianceCatalogEntry[] {
  const needle = normalizeModel(query);
  return APPLIANCE_CATALOG.filter((entry) => {
    if (brand && entry.brand !== brand) return false;
    if (kind && entry.kind !== kind) return false;
    if (!needle) return true;
    const haystacks = [entry.brand, entry.model, entry.label, entry.kind, ...entry.aliases].map(
      normalizeModel,
    );
    return haystacks.some((value) => value.includes(needle) || needle.includes(value));
  });
}

export function getCatalogEntry(applianceId: ApplianceId): ApplianceCatalogEntry {
  const entry = APPLIANCE_CATALOG.find((item) => item.id === applianceId);
  if (!entry) throw new Error(`Unknown appliance ${applianceId}.`);
  return entry;
}

export function getRepairPack(applianceId: ApplianceId): RepairPack {
  const pack = REPAIR_PACKS.get(applianceId);
  if (!pack) throw new Error(`Unknown repair pack ${applianceId}.`);
  return pack;
}

export function getComponent(
  packId: ApplianceId | null,
  componentId: ComponentId,
): RepairPackComponent {
  if (!packId) return FALLBACK_COMPONENT;
  const component = getRepairPack(packId).components.find((item) => item.id === componentId);
  if (!component) throw new Error(`Unknown component ${componentId}.`);
  return component;
}

export function getCheck(packId: ApplianceId, checkId: CheckId): RepairPackCheck {
  const check = getRepairPack(packId).checks.find((item) => item.id === checkId);
  if (!check) throw new Error(`Unknown check ${checkId}.`);
  return check;
}

export function getPart(packId: ApplianceId, partId: PartId): RepairPackPart {
  const part = getRepairPack(packId).parts.find((item) => item.id === partId);
  if (!part) throw new Error(`Unknown part ${partId}.`);
  return part;
}

export function isResultForCheck(
  packId: ApplianceId,
  checkId: CheckId,
  resultId: ResultId,
): boolean {
  return getCheck(packId, checkId).results.some((item) => item.id === resultId);
}

export function isComponentId(packId: ApplianceId | null, value: unknown): value is ComponentId {
  return (
    typeof value === "string" &&
    Boolean(packId && getRepairPack(packId).components.some((item) => item.id === value))
  );
}

export function isCheckId(packId: ApplianceId | null, value: unknown): value is CheckId {
  return Boolean(
    packId &&
    typeof value === "string" &&
    getRepairPack(packId).checks.some((item) => item.id === value),
  );
}

export function isBrandName(value: unknown): value is BrandName {
  return (
    typeof value === "string" &&
    ["LG", "Samsung", "GE", "Whirlpool", "Maytag", "Electrolux", "Bosch", "KitchenAid"].includes(
      value,
    )
  );
}

export function isApplianceKind(value: unknown): value is ApplianceKind {
  return (
    typeof value === "string" && ["washer", "dishwasher", "dryer", "refrigerator"].includes(value)
  );
}
