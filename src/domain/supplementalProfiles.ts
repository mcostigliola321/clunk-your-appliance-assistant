import type {
  ApplianceCatalogEntry,
  RepairPackCause,
  RepairPackCheck,
  RepairPackComponent,
  RepairPackResult,
  SupportedSymptomId,
} from "./types";

export interface RepairPackProfile {
  components: RepairPackComponent[];
  checks: RepairPackCheck[];
  causes: RepairPackCause[];
  symptom: { id: SupportedSymptomId; label: string; shortLabel: string };
  illustration: { src: string; width: number; height: number; alt: string };
  diagramNote: string;
  example: null;
}

interface ProfileSpec {
  symptom: RepairPackProfile["symptom"];
  components: RepairPackComponent[];
  safety: {
    label: string;
    instruction: string;
    stop: string;
    firstCheckId: string;
  };
  checks: RepairPackCheck[];
  causes: RepairPackCause[];
}

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

function outcome(
  id: string,
  label: string,
  effect: RepairPackResult["effect"],
  rest: Omit<RepairPackResult, "id" | "label" | "effect"> = {},
): RepairPackResult {
  return { id, label, effect, ...rest };
}

function check(
  id: string,
  label: string,
  componentId: string,
  instruction: string,
  why: string,
  stop: string,
  results: RepairPackResult[],
): RepairPackCheck {
  return {
    id,
    label,
    componentId,
    instruction,
    why,
    stop,
    safetyTags: ["external-observation", "no-disassembly"],
    sourceIds: [],
    results,
  };
}

function safetyCheck(spec: ProfileSpec, sourceIds: string[]): RepairPackCheck {
  return {
    id: "safety-check",
    label: spec.safety.label,
    componentId: "machine",
    instruction: spec.safety.instruction,
    why: "This keeps the diagnosis to visible, low-risk checks.",
    stop: spec.safety.stop,
    safetyTags: ["external-observation", "no-disassembly"],
    sourceIds,
    results: [
      outcome("safe-ready", "Safe to continue", "continue", {
        nextCheckId: spec.safety.firstCheckId,
      }),
      outcome("hazard-burning", "Smoke or burning smell", "hazard", {
        escalationReason: "burning-smell",
      }),
      outcome("hazard-active-leak", "Water is near power", "hazard", {
        escalationReason: "active-leak",
      }),
      outcome("unsafe-access", "I cannot check this safely", "hazard", {
        escalationReason: "internal-access",
      }),
    ],
  };
}

function illustration(entry: ApplianceCatalogEntry) {
  if (entry.kind === "washer")
    return entry.loadStyle === "top-load"
      ? {
          src: "/assets/clunk-washer-top-load-topology-v2.png",
          width: 1254,
          height: 1254,
          alt: "Open top-load washer with visible controls, basket, door area, and external hoses",
        }
      : {
          src: "/assets/clunk-washer-front-load-topology-v3.png",
          width: 1305,
          height: 1205,
          alt: "Front-load washer with visible controls, drum, door seal, and external hoses",
        };
  if (entry.kind === "dishwasher")
    return {
      src: "/assets/clunk-dishwasher-topology-v1.png",
      width: 1254,
      height: 1254,
      alt: "Open dishwasher with visible racks, spray arms, filter area, door seal, and sink connection",
    };
  if (entry.kind === "dryer")
    return {
      src: "/assets/clunk-electric-dryer-topology-v2.png",
      width: 1275,
      height: 1234,
      alt: "Open electric dryer with visible controls, drum, lint screen, door, and plug area",
    };
  return {
    src: "/assets/clunk-refrigerator-topology-v1.png",
    width: 1205,
    height: 1254,
    alt: "Open side-by-side refrigerator with visible controls, shelves, filter, and ice area",
  };
}

function finish(entry: ApplianceCatalogEntry, sourceIds: string[], spec: ProfileSpec) {
  return {
    components: spec.components,
    checks: [safetyCheck(spec, sourceIds), ...spec.checks.map((item) => ({ ...item, sourceIds }))],
    causes: spec.causes,
    symptom: spec.symptom,
    illustration: illustration(entry),
    diagramNote:
      "Location guide, not a service diagram. Use only the labeled exterior or owner-accessible areas; exact internal layouts vary.",
    example: null,
  } satisfies RepairPackProfile;
}

function washerDoorClosure(entry: ApplianceCatalogEntry): ProfileSpec {
  const isTopLoad = entry.loadStyle === "top-load";
  const closure = isTopLoad ? "lid" : "door";
  const Closure = isTopLoad ? "Lid" : "Door";
  return {
    symptom: {
      id: "door-will-not-close",
      label: `Washer ${closure} will not close`,
      shortLabel: `${Closure} will not close`,
    },
    components: [
      component(
        "machine",
        isTopLoad ? "Top-load washer" : "Front-load washer",
        "The selected washer and visible exterior.",
        "visible",
        50,
        50,
      ),
      component(
        "closure",
        `${Closure} edge and opening`,
        `The visible ${closure}, opening, and contact area.`,
        "user-accessible",
        49,
        isTopLoad ? 30 : 45,
      ),
      component(
        "closure-lock",
        `${Closure} lock system`,
        `The internal ${closure} lock, strike, hinge, wiring, and sensor.`,
        "professional-only",
        58,
        38,
      ),
    ],
    safety: {
      label: `Wait for the ${closure} lock`,
      instruction: `Cancel the cycle and wait for the ${closure}-lock indicator to clear. Keep hands dry, and do not force or bypass the ${closure} lock.`,
      stop: `standing water is behind a locked door, the ${closure} or glass is damaged, water is near power, or there is smoke or a burning smell.`,
      firstCheckId: "check-washer-closure-edge",
    },
    checks: [
      check(
        "check-washer-closure-edge",
        `Inspect the visible ${closure} edge`,
        "closure",
        `Remove clothing or loose debris caught at the visible ${closure} edge. Wipe only the visible contact area with a soft damp cloth. Do not use a tool or move the hinge or strike.`,
        `A trapped item or soil at the visible contact can keep the ${closure} from reaching its normal closed position.`,
        `the ${closure}, glass, hinge, strike, or lock looks bent, cracked, loose, or scorched.`,
        [
          outcome(
            "washer-closure-obstruction",
            "I removed an obstruction or visible soil",
            "continue",
            {
              nextCheckId: "check-washer-closure-once",
              focusComponentId: "closure",
            },
          ),
          outcome(
            "washer-closure-damaged",
            `The ${closure} or lock area looks damaged`,
            "professional-only",
            {
              focusComponentId: "closure-lock",
              outcomeTitle: `Do not force the ${closure}`,
              outcomeMessage: `The ${closure}, hinge, lock, and alignment require model-specific service.`,
            },
          ),
          outcome("washer-closure-clear", "The visible edge is clear and undamaged", "continue", {
            nextCheckId: "check-washer-closure-once",
            focusComponentId: "closure",
          }),
        ],
      ),
      check(
        "check-washer-closure-once",
        `Close the ${closure} once`,
        "closure",
        `Close the ${closure} firmly one time using its normal handle or edge. Stop if it needs force; do not hold, slam, or bypass it.`,
        `A normal closure after clearing the edge confirms an owner-correctable obstruction without naming a part.`,
        `the ${closure} springs back, needs force, stays locked, or shows an unfamiliar error.`,
        [
          outcome("washer-closure-fixed", `The ${closure} now closes normally`, "no-part-needed", {
            focusComponentId: "closure",
            outcomeTitle: `The visible ${closure} obstruction was the problem`,
            outcomeMessage:
              "Run one cycle while staying nearby. Stop if the closure problem or any leak returns.",
          }),
          outcome(
            "washer-closure-failed",
            `The ${closure} still will not close normally`,
            "professional-only",
            {
              focusComponentId: "closure-lock",
              outcomeTitle: `The ${closure} system needs service`,
              outcomeMessage:
                "Do not force or bypass it. Lock, strike, hinge, wiring, and alignment checks require model-specific service.",
            },
          ),
        ],
      ),
    ],
    causes: [
      {
        id: "washer-closure-obstruction-cause",
        label: `Visible ${closure} obstruction`,
        componentId: "closure",
        baseRank: 45,
        defaultExplanation: `Clothing, debris, or soil can block the visible ${closure} contact.`,
        resultScores: { "washer-closure-obstruction": 80, "washer-closure-fixed": 90 },
      },
      {
        id: "washer-closure-service-cause",
        label: `${Closure} lock, hinge, or alignment issue`,
        componentId: "closure-lock",
        baseRank: 25,
        defaultExplanation: "Internal closure parts and alignment require model-specific service.",
        resultScores: { "washer-closure-damaged": 90, "washer-closure-failed": 80 },
      },
    ],
  };
}

const dishwasherDoorClosure: ProfileSpec = {
  symptom: {
    id: "door-will-not-close",
    label: "Dishwasher door will not close",
    shortLabel: "Door will not close",
  },
  components: [
    component(
      "machine",
      "Built-in dishwasher",
      "The selected dishwasher and visible exterior.",
      "visible",
      50,
      50,
    ),
    component(
      "racks",
      "Racks and loading envelope",
      "Dishes, handles, utensils, and racks visible from the open door.",
      "user-accessible",
      49,
      37,
    ),
    component(
      "door-edge",
      "Door edge and seal",
      "The visible door edge, gasket, and cabinet clearance.",
      "user-accessible",
      49,
      66,
    ),
    component(
      "door-system",
      "Door latch and alignment system",
      "Latch, hinges, springs, alignment, wiring, and feature-specific open-dry hardware.",
      "professional-only",
      58,
      58,
    ),
  ],
  safety: {
    label: "Stop the cycle before checking",
    instruction:
      "Cancel the cycle, keep hands dry, and wait for spray and steam to stop. Do not force the door or loosen installation hardware.",
    stop: "hot water or steam is escaping, water is near power, the door is damaged, or an open-dry arm is extended.",
    firstCheckId: "check-dishwasher-loading",
  },
  checks: [
    check(
      "check-dishwasher-loading",
      "Check loading and rack position",
      "racks",
      "Keep dishes, handles, and utensils inside the rack envelope, then push both racks fully home. Remove only loose debris at the visible seal.",
      "Items outside the rack envelope or a rack left forward can block normal door travel.",
      "a rack, wheel, rail, or open-dry arm is damaged or will not move normally.",
      [
        outcome("dishwasher-door-loading", "An item or rack blocked the door", "continue", {
          nextCheckId: "check-dishwasher-door-once",
          focusComponentId: "door-edge",
        }),
        outcome(
          "dishwasher-door-rack-damaged",
          "A rack or visible mechanism is damaged",
          "professional-only",
          {
            focusComponentId: "door-system",
            outcomeTitle: "The dishwasher needs model-specific service",
            outcomeMessage:
              "Do not force the rack or door, and do not adjust feature-specific hardware without the exact manual.",
          },
        ),
        outcome("dishwasher-door-loading-clear", "Loading and racks are clear", "continue", {
          nextCheckId: "check-dishwasher-door-once",
          focusComponentId: "door-edge",
        }),
      ],
    ),
    check(
      "check-dishwasher-door-once",
      "Check visible clearance and close once",
      "door-edge",
      "Without moving the dishwasher or loosening screws, look for visible cabinet or countertop contact. If clear, close the door once without force.",
      "Visible loading or cabinet interference can prevent closure; latch, hinge, and alignment repair are service work.",
      "the door rubs the cabinet, needs force, will not stay shut, or the latch looks damaged.",
      [
        outcome("dishwasher-door-fixed", "The door now closes normally", "no-part-needed", {
          focusComponentId: "door-edge",
          outcomeTitle: "The visible obstruction was the problem",
          outcomeMessage:
            "Run one cycle while staying nearby. Stop if the door opens or water leaks.",
        }),
        outcome(
          "dishwasher-door-cabinet",
          "The door contacts the cabinet or countertop",
          "professional-only",
          {
            focusComponentId: "door-system",
            outcomeTitle: "Installation clearance needs correction",
            outcomeMessage:
              "Do not loosen mounting or leveling hardware. Arrange installer or appliance service.",
          },
        ),
        outcome(
          "dishwasher-door-failed",
          "The clear door still will not close",
          "professional-only",
          {
            focusComponentId: "door-system",
            outcomeTitle: "The door system needs service",
            outcomeMessage:
              "Latch, hinge, spring, alignment, and feature-specific mechanisms require model-specific service.",
          },
        ),
      ],
    ),
  ],
  causes: [
    {
      id: "dishwasher-door-obstruction-cause",
      label: "Loading or rack obstruction",
      componentId: "racks",
      baseRank: 45,
      defaultExplanation: "Loading outside the rack envelope can block the door.",
      resultScores: { "dishwasher-door-loading": 80, "dishwasher-door-fixed": 90 },
    },
    {
      id: "dishwasher-door-service-cause",
      label: "Installation, latch, hinge, or feature issue",
      componentId: "door-system",
      baseRank: 25,
      defaultExplanation: "Alignment and door mechanisms require model-specific service.",
      resultScores: {
        "dishwasher-door-rack-damaged": 80,
        "dishwasher-door-cabinet": 90,
        "dishwasher-door-failed": 80,
      },
    },
  ],
};

const refrigeratorDoorClosure: ProfileSpec = {
  symptom: {
    id: "door-will-not-close",
    label: "Refrigerator door will not close",
    shortLabel: "Door will not close",
  },
  components: [
    component(
      "machine",
      "Full-size refrigerator",
      "The selected refrigerator and visible exterior.",
      "visible",
      50,
      50,
    ),
    component(
      "interior",
      "Shelves, bins, and food",
      "Loose items and owner-removable bins visible at the opening.",
      "user-accessible",
      48,
      42,
    ),
    component(
      "gasket",
      "Visible door gasket",
      "The flexible seal surface around the door.",
      "user-accessible",
      51,
      48,
    ),
    component(
      "door-system",
      "Door, hinge, and alignment system",
      "Hinges, alignment, internal closure parts, and topology-specific flaps.",
      "professional-only",
      64,
      40,
    ),
  ],
  safety: {
    label: "Protect food and avoid moving the refrigerator",
    instruction:
      "Keep the refrigerator stable and do not tilt, level, or pull it forward. Move perishable food to safe cold storage if the door has been open long enough to raise temperatures.",
    stop: "water is near power, the door or glass is damaged, the refrigerator is unstable, or food safety is uncertain.",
    firstCheckId: "check-refrigerator-obstruction",
  },
  checks: [
    check(
      "check-refrigerator-obstruction",
      "Clear the visible door path",
      "interior",
      "Move food packages, bins, drawers, or shelves that visibly extend into the door path. Do not force a drawer, adjust a hinge, or use a French-door flap check unless the exact manual confirms it.",
      "An item outside its normal position can keep a full-size refrigerator door from reaching the gasket.",
      "a bin, drawer, shelf, hinge, or topology-specific flap is damaged or will not seat normally.",
      [
        outcome("refrigerator-door-obstruction", "An item blocked the door path", "continue", {
          nextCheckId: "check-refrigerator-gasket",
          focusComponentId: "gasket",
        }),
        outcome(
          "refrigerator-door-component-damaged",
          "A visible door component is damaged",
          "professional-only",
          {
            focusComponentId: "door-system",
            outcomeTitle: "The refrigerator door needs service",
            outcomeMessage:
              "Do not force or realign it. Use model-specific service for hinges, flaps, drawers, and alignment.",
          },
        ),
        outcome("refrigerator-door-path-clear", "The visible door path is clear", "continue", {
          nextCheckId: "check-refrigerator-gasket",
          focusComponentId: "gasket",
        }),
      ],
    ),
    check(
      "check-refrigerator-gasket",
      "Clean the visible gasket and close gently",
      "gasket",
      "Wipe visible gasket soil with a soft cloth and mild soapy water, then dry it. Close the door gently once and observe whether it stays shut.",
      "Visible soil can keep the gasket from contacting evenly; a torn gasket or misaligned door requires service.",
      "the gasket is torn, the door drops or rubs, closure needs force, or the refrigerator moves.",
      [
        outcome("refrigerator-door-fixed", "The door now closes and stays shut", "no-part-needed", {
          focusComponentId: "gasket",
          outcomeTitle: "A visible obstruction or dirty gasket was the problem",
          outcomeMessage:
            "Monitor temperature and food safety. Arrange service if the door opens again.",
        }),
        outcome(
          "refrigerator-door-gasket-damaged",
          "The gasket is torn or will not contact",
          "professional-only",
          {
            focusComponentId: "door-system",
            outcomeTitle: "The closure needs model-specific service",
            outcomeMessage:
              "This guide does not infer a replacement part from model identity. Arrange service for the exact revision.",
          },
        ),
        outcome(
          "refrigerator-door-failed",
          "The clean, clear door still will not stay shut",
          "professional-only",
          {
            focusComponentId: "door-system",
            outcomeTitle: "The door system needs service",
            outcomeMessage:
              "Hinge, alignment, cam, and topology-specific closure checks require model-specific service.",
          },
        ),
      ],
    ),
  ],
  causes: [
    {
      id: "refrigerator-door-obstruction-cause",
      label: "Interior obstruction or gasket soil",
      componentId: "interior",
      baseRank: 45,
      defaultExplanation: "Food, bins, shelves, or visible soil can block closure.",
      resultScores: { "refrigerator-door-obstruction": 80, "refrigerator-door-fixed": 90 },
    },
    {
      id: "refrigerator-door-service-cause",
      label: "Gasket, hinge, or alignment issue",
      componentId: "door-system",
      baseRank: 25,
      defaultExplanation:
        "Door hardware and topology-specific closure parts require exact-model service.",
      resultScores: {
        "refrigerator-door-component-damaged": 85,
        "refrigerator-door-gasket-damaged": 90,
        "refrigerator-door-failed": 80,
      },
    },
  ],
};

function washerStart(entry: ApplianceCatalogEntry): ProfileSpec {
  const closure = entry.loadStyle === "top-load" ? "lid" : "door";
  const Closure = entry.loadStyle === "top-load" ? "Lid" : "Door";
  return {
    symptom: {
      id: "will-not-start",
      label: "Washer cycle will not start",
      shortLabel: "Cycle will not start",
    },
    components: [
      component(
        "machine",
        entry.loadStyle === "top-load" ? "Top-load washer" : "Front-load washer",
        "The selected washer and visible exterior.",
        "visible",
        48,
        48,
      ),
      component(
        "controls",
        "Cycle controls",
        "The visible cycle, pause, and lock indicators.",
        "visible",
        50,
        17,
      ),
      component(
        "door",
        `${Closure} and opening`,
        `The visible ${closure}, opening, and closure indicator.`,
        "visible",
        48,
        43,
      ),
      component(
        "water-supply",
        "Water supply",
        "The household valves and visible hose ends behind the washer.",
        "visible",
        82,
        37,
      ),
      component(
        "internal-start-system",
        "Internal start system",
        `${Closure} lock, inlet, and controls behind panels.`,
        "professional-only",
        54,
        28,
      ),
    ],
    safety: {
      label: "Pause before checking",
      instruction:
        "Keep hands dry, stop pressing Start, and look for water near the washer or outlet. Do not move the washer or remove a panel.",
      stop: "there is water near power, a damaged cord, smoke, or a burning smell.",
      firstCheckId: "check-start-controls",
    },
    checks: [
      check(
        "check-start-controls",
        `Check the ${closure} and controls`,
        "controls",
        `Close the ${closure} normally, choose a cycle, and confirm Pause or Control Lock is not shown. Do not force the ${closure}.`,
        `A paused cycle, locked controls, or open ${closure} can prevent the cycle from beginning.`,
        `the ${closure} will not close normally or the controls show an unfamiliar fault.`,
        [
          outcome(
            "start-control-corrected",
            `A pause, lock, or open ${closure} was the problem`,
            "no-part-needed",
            {
              focusComponentId: "controls",
              outcomeTitle: "The start condition was the problem",
              outcomeMessage:
                "With the visible start condition corrected, try the cycle once more and stay nearby for the first fill.",
            },
          ),
          outcome(
            "start-controls-ready",
            "Everything is closed and the controls look ready",
            "continue",
            {
              nextCheckId: "check-water-supply",
              focusComponentId: "water-supply",
            },
          ),
          outcome(
            "start-door-damaged",
            `The ${closure} or control is damaged`,
            "professional-only",
            {
              focusComponentId: "door",
              outcomeTitle: "The washer needs service before another start",
              outcomeMessage: `Visible damage can prevent a safe start. Do not force the ${closure} or remove a panel.`,
            },
          ),
        ],
      ),
      check(
        "check-water-supply",
        "Confirm the visible water supply",
        "water-supply",
        "Without moving the washer, confirm both household water valves are open and the visible hose ends are not kinked or leaking.",
        "This washer can appear not to start while it waits for water.",
        "a valve is stuck, a hose is wet or damaged, or the connections are hidden behind the washer.",
        [
          outcome("start-water-off", "A water valve was closed", "no-part-needed", {
            focusComponentId: "water-supply",
            outcomeTitle: "The washer was waiting for water",
            outcomeMessage:
              "Open the household valve only if it turns normally and the connection stays dry, then try the cycle once.",
          }),
          outcome(
            "start-water-ready",
            "Water is on and the hoses look clear",
            "professional-only",
            {
              focusComponentId: "internal-start-system",
              outcomeTitle: "The next check is inside the washer",
              outcomeMessage:
                "The visible start conditions look correct. Door-lock, inlet, and control checks require model-specific service.",
            },
          ),
          outcome("start-water-damaged", "A hose or valve is wet or damaged", "professional-only", {
            focusComponentId: "water-supply",
            outcomeTitle: "Do not start the washer",
            outcomeMessage:
              "Shut off the household water if it is safe to reach and arrange service for the damaged connection.",
          }),
        ],
      ),
    ],
    causes: [
      {
        id: "washer-start-condition",
        label: "Paused or open start condition",
        componentId: "controls",
        baseRank: 45,
        defaultExplanation: `A visible pause, lock, or ${closure} state can block starting.`,
        resultScores: { "start-control-corrected": 90, "start-controls-ready": -35 },
      },
      {
        id: "washer-start-water",
        label: "Water supply not ready",
        componentId: "water-supply",
        baseRank: 30,
        defaultExplanation: "The washer may wait when it cannot fill.",
        resultScores: { "start-water-off": 90, "start-water-ready": -30 },
      },
      {
        id: "washer-start-internal",
        label: "Door-lock, inlet, or control issue",
        componentId: "internal-start-system",
        baseRank: 15,
        defaultExplanation: "Internal start components require service.",
        resultScores: { "start-controls-ready": 25, "start-water-ready": 75 },
      },
    ],
  };
}

function washerSpin(entry: ApplianceCatalogEntry): ProfileSpec {
  const closure = entry.loadStyle === "top-load" ? "lid" : "door";
  const Closure = entry.loadStyle === "top-load" ? "Lid" : "Door";
  return {
    symptom: {
      id: "will-not-spin",
      label: "Washer will not spin",
      shortLabel: "Drum will not spin",
    },
    components: [
      component(
        "machine",
        entry.loadStyle === "top-load" ? "Top-load washer" : "Front-load washer",
        "The selected washer and visible exterior.",
        "visible",
        48,
        48,
      ),
      component(
        "drum",
        "Drum and load",
        "The visible clothing load inside the drum.",
        "visible",
        49,
        43,
      ),
      component(
        "door",
        `${Closure} and opening`,
        `The visible ${closure}, opening, and closure indicator.`,
        "visible",
        48,
        42,
      ),
      component(
        "drain-path",
        "Drain path",
        "Standing water or a drain message visible to the user.",
        "visible",
        38,
        72,
      ),
      component(
        "drive-system",
        "Internal drive system",
        "Motor, belt, and controls behind panels.",
        "professional-only",
        50,
        64,
      ),
    ],
    safety: {
      label: "Wait for the washer to stop",
      instruction: `Cancel the cycle and wait until the basket is completely still. Do not open a locked ${closure} or reach into standing water.`,
      stop: `water is hot, the ${closure} stays locked, the washer moved, or you smell burning.`,
      firstCheckId: "check-spin-load",
    },
    checks: [
      check(
        "check-spin-load",
        "Look at the load and display",
        "drum",
        "Check for a very small, single heavy, or bunched load and for a balance or drain message. Redistribute only after the door unlocks normally.",
        "An unbalanced load or unfinished drain can prevent full-speed spin.",
        "the door is locked, water remains, or the washer is tilted or damaged.",
        [
          outcome("spin-load-unbalanced", "The load is bunched or unbalanced", "no-part-needed", {
            focusComponentId: "drum",
            outcomeTitle: "The load balance stopped the spin",
            outcomeMessage: "Redistribute similar items evenly and try Drain & Spin once.",
          }),
          outcome(
            "spin-water-remains",
            "Water remains or a drain message is shown",
            "professional-only",
            {
              focusComponentId: "drain-path",
              outcomeTitle: "Resolve the drain problem first",
              outcomeMessage:
                "A washer may not spin while water remains. Use Clunk's supported drain path for this model instead of continuing this spin path.",
            },
          ),
          outcome(
            "spin-load-normal",
            "The load looks balanced and the tub is drained",
            "continue",
            {
              nextCheckId: "check-spin-closures",
              focusComponentId: "door",
            },
          ),
        ],
      ),
      check(
        "check-spin-closures",
        `Check the ${closure}`,
        "door",
        `Confirm the ${closure} closes normally and its visible lock indicator clears. Do not force it.`,
        `An open or unlocked ${closure} condition can block spin.`,
        "anything is cracked, misaligned, or will not close with light pressure.",
        [
          outcome(
            "spin-closure-corrected",
            `The ${closure} was not fully closed`,
            "no-part-needed",
            {
              focusComponentId: "door",
              outcomeTitle: "The open closure stopped the spin",
              outcomeMessage: `Close the ${closure} normally and try Drain & Spin once.`,
            },
          ),
          outcome(
            "spin-closures-normal",
            "The door and drawer are fully closed",
            "professional-only",
            {
              focusComponentId: "drive-system",
              outcomeTitle: "The drive system needs a technician",
              outcomeMessage:
                "The safe, visible spin checks are clear. Belt, motor, lock, and control diagnosis is inside the washer.",
            },
          ),
          outcome(
            "spin-closure-damaged",
            "A closure is damaged or will not seat",
            "professional-only",
            {
              focusComponentId: "door",
              outcomeTitle: "Do not force the closure",
              outcomeMessage: `A damaged ${closure} needs model-specific service.`,
            },
          ),
        ],
      ),
    ],
    causes: [
      {
        id: "washer-spin-load",
        label: "Unbalanced load",
        componentId: "drum",
        baseRank: 45,
        defaultExplanation: "A bunched or unsuitable load can stop spin.",
        resultScores: { "spin-load-unbalanced": 90, "spin-load-normal": -35 },
      },
      {
        id: "washer-spin-drain",
        label: "Water has not drained",
        componentId: "drain-path",
        baseRank: 35,
        defaultExplanation: "The washer may protect itself from spinning with water inside.",
        resultScores: { "spin-water-remains": 90 },
      },
      {
        id: "washer-spin-drive",
        label: "Internal drive or lock issue",
        componentId: "drive-system",
        baseRank: 15,
        defaultExplanation: "Internal spin components are beyond exterior checks.",
        resultScores: { "spin-load-normal": 25, "spin-closures-normal": 75 },
      },
    ],
  };
}

function washerLeak(entry: ApplianceCatalogEntry): ProfileSpec {
  const isTopLoad = entry.loadStyle === "top-load";
  const closure = isTopLoad ? "lid and tub rim" : "door seal and dispenser";
  return {
    symptom: { id: "is-leaking", label: "Washer is leaking water", shortLabel: "Water is leaking" },
    components: [
      component(
        "machine",
        isTopLoad ? "Top-load washer" : "Front-load washer",
        "The selected washer and floor around it.",
        "visible",
        48,
        48,
      ),
      component(
        "door-gasket",
        isTopLoad ? "Lid and tub rim" : "Door seal",
        isTopLoad
          ? "The visible lid, basket opening, and top edge of the tub."
          : "The visible rubber seal and door opening.",
        "user-accessible",
        48,
        43,
      ),
      component(
        "dispenser",
        "Detergent area",
        isTopLoad
          ? "The visible detergent dispenser or pour area."
          : "The visible dispenser and its opening.",
        "user-accessible",
        29,
        18,
      ),
      component(
        "external-hoses",
        "External hoses",
        "Visible fill and drain connections without moving the washer.",
        "visible",
        82,
        43,
      ),
      component(
        "internal-water-path",
        "Internal water path",
        "Pump, tub, and internal connections behind panels.",
        "professional-only",
        49,
        70,
      ),
    ],
    safety: {
      label: "Stop the water first",
      instruction:
        "Pause or turn off the washer without stepping in water. If water is still spreading, turn off the household water only if the valves are dry and safe to reach.",
      stop: "water is near an outlet, the floor is flooding, the washer is hot, or the shutoff cannot be reached safely.",
      firstCheckId: "check-leak-front",
    },
    checks: [
      check(
        "check-leak-front",
        `Inspect the ${closure}`,
        "door-gasket",
        isTopLoad
          ? "With the washer off, look for a load above the basket edge, residue around the visible tub rim, detergent outside its labeled area, or heavy suds. Do not reach under the rim or remove trim."
          : "With the washer off, wipe the visible gasket edge and look for trapped fabric, hair, residue, detergent in the wrong compartment, or heavy suds. Do not pull the seal away or remove trim.",
        isTopLoad
          ? "Overloading, residue at the visible rim, and excess suds can send water over the top edge."
          : "Residue, trapped items, and excess suds can send water out the front.",
        isTopLoad
          ? "the lid, basket, or visible tub rim is damaged, or water continues to appear."
          : "the seal is torn, the glass is cracked, or water continues to appear.",
        [
          outcome(
            "leak-front-residue",
            "I found residue, a trapped item, or excess suds",
            "no-part-needed",
            {
              focusComponentId: "door-gasket",
              outcomeTitle: isTopLoad
                ? "The visible loading or suds condition explains the small leak"
                : "The front seal area explains the small leak",
              outcomeMessage: isTopLoad
                ? "Correct the load, clean only the visible rim, and use the labeled amount of HE detergent before one watched test."
                : "Clean the visible seal, place detergent where the console or manual directs, and use the correct amount of HE detergent before one watched test.",
            },
          ),
          outcome(
            "leak-front-damaged",
            "The visible water boundary is damaged",
            "professional-only",
            {
              focusComponentId: "door-gasket",
              outcomeTitle: "Do not run the washer",
              outcomeMessage:
                "A damaged water boundary needs model-specific service before another cycle.",
            },
          ),
          outcome("leak-front-clear", "The front area is clean and undamaged", "continue", {
            nextCheckId: "check-leak-hoses",
            focusComponentId: "external-hoses",
          }),
        ],
      ),
      check(
        "check-leak-hoses",
        "Look at the visible hose connections",
        "external-hoses",
        "Without moving the washer, look for moisture, cracks, or a drain hose pushed too far into or loose at the standpipe. Do not tighten or disconnect anything.",
        "Rear leaks often come from installation, hoses, or household plumbing.",
        "the area is hidden, wet near power, or a connection must be moved.",
        [
          outcome(
            "leak-hose-visible",
            "A hose, valve, or standpipe is wet or damaged",
            "professional-only",
            {
              focusComponentId: "external-hoses",
              outcomeTitle: "Keep the washer off",
              outcomeMessage:
                "The visible connection needs a plumber or appliance technician before another cycle.",
            },
          ),
          outcome("leak-hoses-dry", "The visible hoses and drain are dry", "professional-only", {
            focusComponentId: "internal-water-path",
            outcomeTitle: "The leak source is inside or out of view",
            outcomeMessage:
              "The owner-safe leak checks are clear. Do not remove panels to find the source.",
          }),
        ],
      ),
    ],
    causes: [
      {
        id: "washer-leak-front",
        label: isTopLoad
          ? "Loading, rim residue, or suds"
          : "Seal residue, trapped fabric, or suds",
        componentId: "door-gasket",
        baseRank: 45,
        defaultExplanation: isTopLoad
          ? "Visible loading, rim, or suds conditions can cause small leaks."
          : "Visible front-door conditions can cause small leaks.",
        resultScores: { "leak-front-residue": 90, "leak-front-clear": -35 },
      },
      {
        id: "washer-leak-hose",
        label: "External hose or household drain leak",
        componentId: "external-hoses",
        baseRank: 35,
        defaultExplanation: "Visible connections can leak or back up.",
        resultScores: { "leak-hose-visible": 90, "leak-hoses-dry": -30 },
      },
      {
        id: "washer-leak-internal",
        label: "Internal water-path leak",
        componentId: "internal-water-path",
        baseRank: 15,
        defaultExplanation: "Internal leaks require safe service access.",
        resultScores: { "leak-front-clear": 20, "leak-hoses-dry": 75 },
      },
    ],
  };
}

const dishwasherCleaning: ProfileSpec = {
  symptom: {
    id: "not-cleaning",
    label: "Dishwasher is not cleaning dishes",
    shortLabel: "Dishes stay dirty",
  },
  components: [
    component("machine", "Dishwasher", "The selected built-in dishwasher.", "visible", 50, 50),
    component(
      "racks",
      "Racks and loading",
      "Items that can block spray or the detergent door.",
      "visible",
      50,
      39,
    ),
    component(
      "spray-arms",
      "Spray arms",
      "Visible rotating arms below the racks.",
      "user-accessible",
      50,
      58,
    ),
    component(
      "filter-area",
      "Filter area",
      "The owner-accessible filter style at the tub bottom.",
      "user-accessible",
      49,
      68,
    ),
    component(
      "wash-system",
      "Internal wash system",
      "Circulation pump and heater below the tub.",
      "professional-only",
      50,
      78,
    ),
  ],
  safety: {
    label: "Let the tub cool",
    instruction:
      "Cancel the cycle, wait for dishes and water to cool, and keep sharp items visible. Do not reach below a spray arm or filter opening.",
    stop: "water is hot, glass is broken, wiring is visible, or the dishwasher is leaking.",
    firstCheckId: "check-cleaning-loading",
  },
  checks: [
    check(
      "check-cleaning-loading",
      "Check loading and spray-arm movement",
      "spray-arms",
      "With the cycle off, confirm no tall item blocks the detergent door and gently spin each visible spray arm. Rearrange dishes if an arm touches them.",
      "Blocked spray arms and a blocked detergent door reduce cleaning.",
      "an arm is cracked, detached, or will not move without force.",
      [
        outcome(
          "cleaning-load-blocked",
          "A dish blocked an arm or detergent door",
          "no-part-needed",
          {
            focusComponentId: "racks",
            outcomeTitle: "The loading pattern blocked cleaning",
            outcomeMessage:
              "Reload so both spray arms and the detergent door move freely, then try a normal cycle.",
          },
        ),
        outcome("cleaning-arm-damaged", "A spray arm is damaged or stuck", "professional-only", {
          focusComponentId: "spray-arms",
          outcomeTitle: "The spray system needs model-specific service",
          outcomeMessage: "Do not force or remove a damaged arm without the model owner guide.",
        }),
        outcome(
          "cleaning-loading-clear",
          "Nothing blocks the spray arms or dispenser",
          "continue",
          { nextCheckId: "check-cleaning-filter", focusComponentId: "filter-area" },
        ),
      ],
    ),
    check(
      "check-cleaning-filter",
      "Match and inspect the filter style",
      "filter-area",
      "Compare the visible bottom filter with the manufacturer guidance. Remove and rinse it only if the documented quarter-turn style matches; otherwise inspect without removal.",
      "A loaded filter can recirculate food and weaken wash flow.",
      "the filter style does not match, glass is present, or removal needs force.",
      [
        outcome(
          "cleaning-filter-dirty",
          "The matching filter has visible buildup",
          "no-part-needed",
          {
            focusComponentId: "filter-area",
            outcomeTitle: "The filter buildup explains the poor cleaning",
            outcomeMessage:
              "Rinse and reinstall the matching owner-accessible filter, then run the recommended cleaning cycle.",
          },
        ),
        outcome("cleaning-filter-clear", "The visible filter area is clean", "professional-only", {
          focusComponentId: "wash-system",
          outcomeTitle: "The circulation or heat system needs service",
          outcomeMessage:
            "Loading, spray-arm clearance, and the owner-accessible filter look clear. Internal wash-pressure and heat checks require a technician.",
        }),
        outcome(
          "cleaning-filter-mismatch",
          "My filter does not match the guide",
          "professional-only",
          {
            focusComponentId: "machine",
            outcomeTitle: "Stop at the model boundary",
            outcomeMessage:
              "Do not assume a removable filter. Use the exact owner manual or a technician for this layout.",
          },
        ),
      ],
    ),
  ],
  causes: [
    {
      id: "dishwasher-cleaning-load",
      label: "Blocked spray or detergent path",
      componentId: "racks",
      baseRank: 45,
      defaultExplanation: "Loading can block spray arms or detergent release.",
      resultScores: { "cleaning-load-blocked": 90, "cleaning-loading-clear": -35 },
    },
    {
      id: "dishwasher-cleaning-filter",
      label: "Filter buildup",
      componentId: "filter-area",
      baseRank: 35,
      defaultExplanation: "A loaded filter can recirculate soil.",
      resultScores: { "cleaning-filter-dirty": 90, "cleaning-filter-clear": -40 },
    },
    {
      id: "dishwasher-cleaning-system",
      label: "Internal circulation or heat issue",
      componentId: "wash-system",
      baseRank: 15,
      defaultExplanation: "Internal performance checks require service.",
      resultScores: { "cleaning-loading-clear": 20, "cleaning-filter-clear": 75 },
    },
  ],
};

const dishwasherFill: ProfileSpec = {
  symptom: {
    id: "will-not-fill",
    label: "Dishwasher will not fill with water",
    shortLabel: "No water enters",
  },
  components: [
    component("machine", "Dishwasher", "The selected built-in dishwasher.", "visible", 50, 50),
    component(
      "door-controls",
      "Door and controls",
      "The closed door and Start/Resume indicator.",
      "visible",
      50,
      20,
    ),
    component(
      "water-valve",
      "Under-sink water valve",
      "The visible household supply valve; do not disconnect it.",
      "visible",
      83,
      61,
    ),
    component(
      "drain-loop",
      "Visible drain hose loop",
      "The external hose routing under the sink.",
      "visible",
      82,
      70,
    ),
    component(
      "fill-system",
      "Internal fill system",
      "Inlet valve, float switch, and controls behind panels.",
      "professional-only",
      46,
      75,
    ),
  ],
  safety: {
    label: "Check for water before starting",
    instruction:
      "Keep the dishwasher off and look for moisture under the sink and around the toe area. Do not remove the toe panel.",
    stop: "the cabinet is wet, water is near wiring, or a valve or hose is damaged.",
    firstCheckId: "check-fill-door",
  },
  checks: [
    check(
      "check-fill-door",
      "Check the door and Start/Resume state",
      "door-controls",
      "Close the door normally and look for a flashing Start/Resume indicator. Press Start/Resume once if the manufacturer control shows the cycle is paused.",
      "An open or unlatched door can pause filling.",
      "the latch is damaged, the door needs force, or an error remains.",
      [
        outcome("fill-door-paused", "The door or paused cycle was the problem", "no-part-needed", {
          focusComponentId: "door-controls",
          outcomeTitle: "The dishwasher was paused",
          outcomeMessage:
            "With the door latched and cycle resumed, listen for the normal fill while staying nearby.",
        }),
        outcome("fill-door-ready", "The door is latched and the cycle is not paused", "continue", {
          nextCheckId: "check-fill-supply",
          focusComponentId: "water-valve",
        }),
        outcome("fill-door-damaged", "The door or latch is damaged", "professional-only", {
          focusComponentId: "door-controls",
          outcomeTitle: "The door needs service",
          outcomeMessage: "A damaged latch can defeat the safety interlock. Do not force it.",
        }),
      ],
    ),
    check(
      "check-fill-supply",
      "Look at the under-sink supply",
      "water-valve",
      "Confirm the dishwasher water valve is fully open and the visible supply hose is not kinked. Also check that the drain hose rises in a high loop; do not disconnect either hose.",
      "A closed supply or incorrect drain routing can leave the tub without water.",
      "a valve is stuck, a hose is wet, or the plumbing is hidden.",
      [
        outcome("fill-valve-closed", "The water valve was closed", "no-part-needed", {
          focusComponentId: "water-valve",
          outcomeTitle: "The water supply was closed",
          outcomeMessage:
            "Open it only if the valve turns normally and stays dry, then try one watched cycle.",
        }),
        outcome("fill-drain-loop-low", "The drain hose has no high loop", "professional-only", {
          focusComponentId: "drain-loop",
          outcomeTitle: "The drain routing needs correction",
          outcomeMessage:
            "A plumber or installer should correct the hose routing without guessing at connections.",
        }),
        outcome(
          "fill-supply-ready",
          "The valve is open and visible hoses look correct",
          "professional-only",
          {
            focusComponentId: "fill-system",
            outcomeTitle: "The fill system needs a technician",
            outcomeMessage:
              "The visible supply and door checks are clear. Inlet-valve, float, and control diagnosis requires panel access.",
          },
        ),
      ],
    ),
  ],
  causes: [
    {
      id: "dishwasher-fill-door",
      label: "Door or resume condition",
      componentId: "door-controls",
      baseRank: 40,
      defaultExplanation: "The dishwasher may not fill until the door is latched and resumed.",
      resultScores: { "fill-door-paused": 90, "fill-door-ready": -35 },
    },
    {
      id: "dishwasher-fill-supply",
      label: "Household water supply",
      componentId: "water-valve",
      baseRank: 35,
      defaultExplanation: "A closed valve or kink can prevent filling.",
      resultScores: { "fill-valve-closed": 90, "fill-supply-ready": -35 },
    },
    {
      id: "dishwasher-fill-internal",
      label: "Internal inlet or float issue",
      componentId: "fill-system",
      baseRank: 15,
      defaultExplanation: "Internal fill components require service.",
      resultScores: { "fill-door-ready": 20, "fill-supply-ready": 75 },
    },
  ],
};

const dishwasherLeak: ProfileSpec = {
  symptom: {
    id: "is-leaking",
    label: "Dishwasher is leaking water",
    shortLabel: "Water is leaking",
  },
  components: [
    component(
      "machine",
      "Dishwasher",
      "The selected dishwasher and surrounding floor.",
      "visible",
      50,
      50,
    ),
    component(
      "door-seal",
      "Door edge and seal",
      "The visible gasket, lower door edge, and loading clearance.",
      "user-accessible",
      50,
      45,
    ),
    component(
      "tub",
      "Tub and detergent",
      "Visible suds and the owner-accessible tub area.",
      "visible",
      50,
      58,
    ),
    component(
      "sink-connections",
      "Under-sink connections",
      "Visible water and drain hoses without disconnection.",
      "visible",
      83,
      66,
    ),
    component(
      "internal-seals",
      "Internal pump and seals",
      "Components under the tub and behind panels.",
      "professional-only",
      50,
      78,
    ),
  ],
  safety: {
    label: "Stop the cycle and power",
    instruction:
      "Cancel the cycle. If water continues to spread, switch off the dishwasher circuit and household water only from a dry, safe position.",
    stop: "water is near an outlet, the floor is flooding, or the breaker or valve cannot be reached safely.",
    firstCheckId: "check-dishwasher-leak-door",
  },
  checks: [
    check(
      "check-dishwasher-leak-door",
      "Find whether water starts at the door",
      "door-seal",
      "Look for utensils blocking closure, residue or damage on the visible gasket, heavy suds, or a spray arm blocked by loading. Do not remove the gasket.",
      "Door leaks commonly follow seal obstruction, loading, spray direction, or excess suds.",
      "the gasket is torn, glass is present, or water is still moving.",
      [
        outcome(
          "dishwasher-leak-loading",
          "Loading, residue, or excess suds is visible",
          "no-part-needed",
          {
            focusComponentId: "door-seal",
            outcomeTitle: "The visible door condition explains the leak",
            outcomeMessage:
              "Correct the loading, wipe the visible seal, and use dishwasher detergent only before one watched test.",
          },
        ),
        outcome(
          "dishwasher-leak-door-damaged",
          "The door seal or door is damaged",
          "professional-only",
          {
            focusComponentId: "door-seal",
            outcomeTitle: "Do not run the dishwasher",
            outcomeMessage: "A damaged water boundary needs model-specific service.",
          },
        ),
        outcome(
          "dishwasher-leak-not-door",
          "The door area is clear or water came from below",
          "continue",
          { nextCheckId: "check-dishwasher-leak-sink", focusComponentId: "sink-connections" },
        ),
      ],
    ),
    check(
      "check-dishwasher-leak-sink",
      "Inspect visible sink connections",
      "sink-connections",
      "Look under the sink for moisture at the dishwasher supply or drain hose. Do not tighten, disconnect, or reach behind wet plumbing.",
      "External connections can leak while internal pump seals remain hidden.",
      "the cabinet is wet near wiring or the connection is out of view.",
      [
        outcome(
          "dishwasher-leak-connection",
          "A visible hose or connection is wet",
          "professional-only",
          {
            focusComponentId: "sink-connections",
            outcomeTitle: "The visible connection needs repair",
            outcomeMessage:
              "Keep power and water off and have a plumber or technician repair the connection.",
          },
        ),
        outcome("dishwasher-leak-internal", "Visible connections are dry", "professional-only", {
          focusComponentId: "internal-seals",
          outcomeTitle: "The leak is inside or below the tub",
          outcomeMessage:
            "Pump, diverter, inlet, and tub-seal checks require a technician. Do not remove the toe panel.",
        }),
      ],
    ),
  ],
  causes: [
    {
      id: "dishwasher-leak-door",
      label: "Door obstruction, suds, or seal issue",
      componentId: "door-seal",
      baseRank: 45,
      defaultExplanation: "Visible door conditions can direct water out of the tub.",
      resultScores: { "dishwasher-leak-loading": 90, "dishwasher-leak-not-door": -35 },
    },
    {
      id: "dishwasher-leak-connection",
      label: "External hose connection",
      componentId: "sink-connections",
      baseRank: 30,
      defaultExplanation: "Supply and drain connections can leak under the sink.",
      resultScores: { "dishwasher-leak-connection": 90 },
    },
    {
      id: "dishwasher-leak-seal",
      label: "Internal pump or tub seal",
      componentId: "internal-seals",
      baseRank: 15,
      defaultExplanation: "Internal leaks require panel access.",
      resultScores: { "dishwasher-leak-not-door": 20, "dishwasher-leak-internal": 75 },
    },
  ],
};

const dryerStart: ProfileSpec = {
  symptom: {
    id: "will-not-start",
    label: "Electric dryer will not start",
    shortLabel: "Dryer will not start",
  },
  components: [
    component(
      "machine",
      "Electric dryer",
      "The selected dryer and visible exterior.",
      "visible",
      47,
      49,
    ),
    component(
      "door-switch",
      "Door and visible switch",
      "The door closure and visible switch button at the opening.",
      "visible",
      65,
      47,
    ),
    component(
      "controls",
      "Cycle and Start controls",
      "The selected cycle and Start control.",
      "visible",
      48,
      17,
    ),
    component(
      "plug",
      "Power plug and cord",
      "The visible plug and cord only; no terminal access.",
      "visible",
      84,
      35,
    ),
    component(
      "start-system",
      "Internal start system",
      "Switches, motor, and controls behind panels.",
      "professional-only",
      50,
      61,
    ),
  ],
  safety: {
    label: "Keep the dryer off",
    instruction:
      "Keep hands dry and look for heat, a damaged cord, smoke, or a burning smell. Do not remove the rear cord cover or any panel.",
    stop: "the cord is burned, broken, loose, or hot, or you smell burning.",
    firstCheckId: "check-dryer-start-door",
  },
  checks: [
    check(
      "check-dryer-start-door",
      "Check the door and cycle controls",
      "door-switch",
      "Close the door firmly, choose a timed or sensor-dry cycle rather than Off, and press Start fully once. Look at the visible door-switch button for scorching or damage.",
      "The door, cycle position, and Start control must all be ready.",
      "the door will not close, the switch looks scorched, or anything needs force.",
      [
        outcome(
          "dryer-start-setting",
          "The door, cycle, or Start control was the problem",
          "no-part-needed",
          {
            focusComponentId: "controls",
            outcomeTitle: "The visible start condition was the problem",
            outcomeMessage: "With the door closed and a drying cycle selected, try Start once.",
          },
        ),
        outcome(
          "dryer-start-switch-damaged",
          "The visible switch or door is damaged",
          "professional-only",
          {
            focusComponentId: "door-switch",
            outcomeTitle: "Do not bypass the door switch",
            outcomeMessage: "The safety interlock needs service before the dryer runs.",
          },
        ),
        outcome("dryer-start-controls-ready", "The door and controls look correct", "continue", {
          nextCheckId: "check-dryer-start-power",
          focusComponentId: "plug",
        }),
      ],
    ),
    check(
      "check-dryer-start-power",
      "Look at the plug and household breaker",
      "plug",
      "Confirm the plug is fully seated and the dryer breaker is not visibly tripped. Do not touch a damaged cord, remove a cover, or inspect wiring.",
      "A loose plug or tripped dedicated circuit can stop the dryer.",
      "the plug is hot, damaged, loose in the outlet, or the electrical panel is not safe for you to use.",
      [
        outcome(
          "dryer-start-breaker",
          "The plug was loose or the breaker was tripped",
          "no-part-needed",
          {
            focusComponentId: "plug",
            outcomeTitle: "Power was interrupted",
            outcomeMessage:
              "After restoring power only from a safe, dry position, try the dryer once. Repeated trips require an electrician or technician.",
          },
        ),
        outcome("dryer-start-power-ready", "Power appears normal", "professional-only", {
          focusComponentId: "start-system",
          outcomeTitle: "The internal start system needs service",
          outcomeMessage:
            "The visible door, control, and power checks are clear. Do not open the dryer for motor or wiring tests.",
        }),
      ],
    ),
  ],
  causes: [
    {
      id: "dryer-start-condition",
      label: "Door or control condition",
      componentId: "door-switch",
      baseRank: 45,
      defaultExplanation: "A visible start condition can stop the dryer.",
      resultScores: { "dryer-start-setting": 90, "dryer-start-controls-ready": -35 },
    },
    {
      id: "dryer-start-power",
      label: "Household power interruption",
      componentId: "plug",
      baseRank: 35,
      defaultExplanation: "The dryer needs its dedicated circuit.",
      resultScores: { "dryer-start-breaker": 90, "dryer-start-power-ready": -30 },
    },
    {
      id: "dryer-start-internal",
      label: "Internal switch, motor, or control issue",
      componentId: "start-system",
      baseRank: 15,
      defaultExplanation: "Internal electrical checks require service.",
      resultScores: { "dryer-start-controls-ready": 20, "dryer-start-power-ready": 75 },
    },
  ],
};

const dryerHeat: ProfileSpec = {
  symptom: {
    id: "not-heating",
    label: "Electric dryer runs without heat",
    shortLabel: "Dryer runs without heat",
  },
  components: [
    component(
      "machine",
      "Electric dryer",
      "The selected dryer and surrounding air path.",
      "visible",
      47,
      49,
    ),
    component(
      "controls",
      "Heat and cycle controls",
      "The selected temperature and cycle.",
      "visible",
      48,
      17,
    ),
    component(
      "lint-screen",
      "Lint screen",
      "The owner-accessible screen at the door opening.",
      "user-accessible",
      32,
      65,
    ),
    component(
      "air-outlet",
      "Exterior vent outlet",
      "The outside vent flap, observed without disassembly.",
      "visible",
      82,
      70,
    ),
    component(
      "heat-system",
      "Internal heat system",
      "240-volt heater, protection devices, and wiring.",
      "professional-only",
      52,
      70,
    ),
  ],
  safety: {
    label: "Stop if there is heat damage",
    instruction:
      "Stop the dryer and unplug it before touching the lint screen. Look for scorching, a hot cord, smoke, or a burning smell. Do not open any panel.",
    stop: "the cord or cabinet is unusually hot, the breaker repeatedly trips, or you smell burning.",
    firstCheckId: "check-dryer-heat-setting",
  },
  checks: [
    check(
      "check-dryer-heat-setting",
      "Check the selected heat and lint screen",
      "controls",
      "Confirm the cycle is not Air Fluff, No Heat, or Cool Down. With the dryer unplugged and cool, remove lint from the screen and reinstall it.",
      "A no-heat setting or blocked screen can leave clothes cool and damp.",
      "the screen is torn, stuck, or the dryer is still hot.",
      [
        outcome(
          "dryer-heat-setting",
          "A no-heat setting or loaded screen was the problem",
          "no-part-needed",
          {
            focusComponentId: "lint-screen",
            outcomeTitle: "The heat or airflow setting explains the result",
            outcomeMessage:
              "Use a heated cycle with the clean screen installed and watch one short test.",
          },
        ),
        outcome(
          "dryer-heat-ready",
          "A heated cycle is selected and the screen is clean",
          "continue",
          { nextCheckId: "check-dryer-airflow", focusComponentId: "air-outlet" },
        ),
        outcome(
          "dryer-heat-screen-damaged",
          "The lint screen is damaged or stuck",
          "professional-only",
          {
            focusComponentId: "lint-screen",
            outcomeTitle: "Do not run without the correct lint screen",
            outcomeMessage: "A damaged or stuck screen needs model-specific service.",
          },
        ),
      ],
    ),
    check(
      "check-dryer-airflow",
      "Observe the outside vent during a short test",
      "air-outlet",
      "After reconnecting power, run a short heated cycle while another adult watches the dryer. From outside, observe whether the vent flap opens. Do not reach into the vent or leave the dryer unattended.",
      "Weak airflow can prevent effective drying, while normal airflow with no heat points to the protected internal heat circuit.",
      "there is smoke, a burning smell, no safe outside access, or the breaker trips.",
      [
        outcome("dryer-heat-no-airflow", "The outside vent barely moves", "professional-only", {
          focusComponentId: "air-outlet",
          outcomeTitle: "The vent path needs cleaning or service",
          outcomeMessage:
            "Stop the dryer. A qualified vent cleaner or technician should inspect the full duct before more use.",
        }),
        outcome(
          "dryer-heat-airflow-normal",
          "Airflow is present but it stays cool",
          "professional-only",
          {
            focusComponentId: "heat-system",
            outcomeTitle: "The 240-volt heat circuit needs service",
            outcomeMessage:
              "Do not open the dryer or test energized parts. A technician should check the supply and protected heat system.",
          },
        ),
      ],
    ),
  ],
  causes: [
    {
      id: "dryer-heat-setting",
      label: "No-heat cycle or loaded lint screen",
      componentId: "controls",
      baseRank: 45,
      defaultExplanation: "The chosen setting or airflow screen can explain cool clothes.",
      resultScores: { "dryer-heat-setting": 90, "dryer-heat-ready": -35 },
    },
    {
      id: "dryer-heat-vent",
      label: "Restricted exhaust",
      componentId: "air-outlet",
      baseRank: 30,
      defaultExplanation: "Restricted airflow prevents effective drying.",
      resultScores: { "dryer-heat-no-airflow": 90 },
    },
    {
      id: "dryer-heat-internal",
      label: "Electrical supply or protected heat-system issue",
      componentId: "heat-system",
      baseRank: 15,
      defaultExplanation: "The electric heat circuit is not homeowner-testable.",
      resultScores: { "dryer-heat-ready": 20, "dryer-heat-airflow-normal": 75 },
    },
  ],
};

const dryerDrum: ProfileSpec = {
  symptom: {
    id: "drum-will-not-turn",
    label: "Dryer drum will not turn",
    shortLabel: "Drum will not turn",
  },
  components: [
    component(
      "machine",
      "Electric dryer",
      "The selected dryer and visible exterior.",
      "visible",
      47,
      49,
    ),
    component("drum", "Drum and load", "The visible drum and clothes load.", "visible", 44, 45),
    component(
      "door",
      "Door opening",
      "The safe opening used only to remove the load; the drum stays untouched.",
      "visible",
      64,
      48,
    ),
    component(
      "drive-system",
      "Internal drive system",
      "Belt, idler, rollers, and motor behind panels.",
      "professional-only",
      49,
      63,
    ),
  ],
  safety: {
    label: "Keep the drum still and stop for hazards",
    instruction:
      "Stop and unplug the dryer, then wait until the drum is completely still. Keep hands clear of the drum and do not remove any panel.",
    stop: "the cabinet is hot, the cord is damaged, or you smell burning.",
    firstCheckId: "check-dryer-drum-load",
  },
  checks: [
    check(
      "check-dryer-drum-load",
      "Remove an overloaded or heavy load",
      "drum",
      "With the dryer unplugged, remove enough heavy wet items that the drum is no more than about half full.",
      "A heavy, wet overload can make the belt slip.",
      "the drum is jammed, scraping, or an item is caught outside the drum.",
      [
        outcome(
          "dryer-drum-overloaded",
          "The load was very heavy or tightly packed",
          "no-part-needed",
          {
            focusComponentId: "drum",
            outcomeTitle: "The load may have stopped the tumble",
            outcomeMessage:
              "Split the load and try the dryer once. Stop if the drum still does not turn.",
          },
        ),
        outcome("dryer-drum-load-normal", "The load was not overloaded", "professional-only", {
          focusComponentId: "drive-system",
          outcomeTitle: "The drive system needs service",
          outcomeMessage:
            "Leave the drum still and keep the dryer unplugged. Belt, motor, roller, switch, and control diagnosis requires internal access.",
        }),
        outcome("dryer-drum-jammed", "The drum is jammed or scraping", "professional-only", {
          focusComponentId: "drive-system",
          outcomeTitle: "Do not run the dryer",
          outcomeMessage:
            "A jammed drum or trapped item needs service before the motor is energized.",
        }),
      ],
    ),
  ],
  causes: [
    {
      id: "dryer-drum-load",
      label: "Heavy or overloaded drum",
      componentId: "drum",
      baseRank: 40,
      defaultExplanation: "A heavy wet load can make the drive belt slip.",
      resultScores: { "dryer-drum-overloaded": 90, "dryer-drum-load-normal": -35 },
    },
    {
      id: "dryer-drum-belt",
      label: "Loose or broken belt",
      componentId: "drive-system",
      baseRank: 30,
      defaultExplanation:
        "A belt fault requires internal service; Clunk does not ask for hand rotation.",
      resultScores: { "dryer-drum-load-normal": 70 },
    },
    {
      id: "dryer-drum-drive",
      label: "Motor, roller, or control issue",
      componentId: "drive-system",
      baseRank: 20,
      defaultExplanation: "Internal drive parts require panel access.",
      resultScores: { "dryer-drum-load-normal": 60, "dryer-drum-jammed": 80 },
    },
  ],
};

const refrigeratorCooling: ProfileSpec = {
  symptom: {
    id: "not-cooling",
    label: "Refrigerator is not cold enough",
    shortLabel: "Not cold enough",
  },
  components: [
    component(
      "machine",
      "Side-by-side refrigerator",
      "The selected refrigerator and visible exterior.",
      "visible",
      50,
      50,
    ),
    component(
      "controls",
      "Temperature controls",
      "The visible refrigerator and freezer settings.",
      "visible",
      47,
      18,
    ),
    component(
      "doors",
      "Doors and seals",
      "Visible closure, gaskets, and blocked door paths.",
      "user-accessible",
      49,
      47,
    ),
    component(
      "airflow",
      "Interior airflow paths",
      "Visible vents and food placement inside both sections.",
      "visible",
      48,
      40,
    ),
    component(
      "cooling-system",
      "Internal cooling system",
      "Fans, compressor, defrost, and sealed system.",
      "professional-only",
      77,
      74,
    ),
  ],
  safety: {
    label: "Protect food and check for damage",
    instruction:
      "Keep the refrigerator plugged in unless there is smoke, burning smell, cord damage, or water near power. Move perishable food to safe cold storage if temperatures are rising.",
    stop: "you smell burning, the cord is damaged, water is near power, or food safety is uncertain.",
    firstCheckId: "check-fridge-controls",
  },
  checks: [
    check(
      "check-fridge-controls",
      "Check controls and door closure",
      "controls",
      "Confirm the controls are on and near the manufacturer-recommended 37°F refrigerator and 0°F freezer settings. Remove anything preventing either door from closing and inspect the visible gasket for gaps.",
      "Controls, blocked doors, and poor sealing can raise temperatures.",
      "a door is misaligned, the gasket is torn, or controls show a fault.",
      [
        outcome(
          "fridge-cooling-setting",
          "A control or blocked door was the problem",
          "no-part-needed",
          {
            focusComponentId: "doors",
            outcomeTitle: "The visible setting or door condition explains the warmth",
            outcomeMessage:
              "Correct it and allow up to 24 hours for temperatures to stabilize while monitoring food safety.",
          },
        ),
        outcome("fridge-cooling-door-damaged", "A door or gasket is damaged", "professional-only", {
          focusComponentId: "doors",
          outcomeTitle: "The refrigerator needs door service",
          outcomeMessage:
            "A damaged seal can prevent safe cooling. Arrange model-specific service.",
        }),
        outcome("fridge-cooling-controls-ready", "Controls and doors look correct", "continue", {
          nextCheckId: "check-fridge-airflow",
          focusComponentId: "airflow",
        }),
      ],
    ),
    check(
      "check-fridge-airflow",
      "Look for blocked interior vents",
      "airflow",
      "Move only loose food containers that cover visible vents or hold a door open. Do not remove interior panels or chip frost.",
      "Blocked circulation can leave one or both sections warm.",
      "there is heavy frost behind a panel, melting water near power, or a vent cover is damaged.",
      [
        outcome("fridge-cooling-blocked", "Food blocked a vent", "no-part-needed", {
          focusComponentId: "airflow",
          outcomeTitle: "Blocked airflow explains the warm area",
          outcomeMessage: "Keep vents clear and allow up to 24 hours for stable temperatures.",
        }),
        outcome(
          "fridge-cooling-frost",
          "Heavy frost or ice covers the interior back wall",
          "professional-only",
          {
            focusComponentId: "cooling-system",
            outcomeTitle: "The defrost or airflow system needs service",
            outcomeMessage: "Do not chip ice or remove panels. Protect food and arrange service.",
          },
        ),
        outcome(
          "fridge-cooling-airflow-clear",
          "Vents are clear and there is no heavy frost",
          "professional-only",
          {
            focusComponentId: "cooling-system",
            outcomeTitle: "The cooling system needs a technician",
            outcomeMessage:
              "The visible settings, doors, and airflow are clear. Fan, defrost, compressor, and sealed-system diagnosis is professional-only.",
          },
        ),
      ],
    ),
  ],
  causes: [
    {
      id: "fridge-cooling-controls",
      label: "Control or door condition",
      componentId: "controls",
      baseRank: 40,
      defaultExplanation: "Settings or an open door can raise temperatures.",
      resultScores: { "fridge-cooling-setting": 90, "fridge-cooling-controls-ready": -35 },
    },
    {
      id: "fridge-cooling-airflow",
      label: "Blocked interior airflow",
      componentId: "airflow",
      baseRank: 35,
      defaultExplanation: "Blocked vents can create warm zones.",
      resultScores: { "fridge-cooling-blocked": 90, "fridge-cooling-airflow-clear": -35 },
    },
    {
      id: "fridge-cooling-system",
      label: "Defrost, fan, or sealed cooling issue",
      componentId: "cooling-system",
      baseRank: 15,
      defaultExplanation: "Internal cooling diagnosis requires service.",
      resultScores: { "fridge-cooling-frost": 75, "fridge-cooling-airflow-clear": 75 },
    },
  ],
};

const refrigeratorLeak: ProfileSpec = {
  symptom: {
    id: "is-leaking",
    label: "Refrigerator is leaking water",
    shortLabel: "Water is leaking",
  },
  components: [
    component(
      "machine",
      "Side-by-side refrigerator",
      "The selected refrigerator and surrounding floor.",
      "visible",
      50,
      50,
    ),
    component(
      "filter-area",
      "Water filter area",
      "The visible filter housing and nearby shelf.",
      "user-accessible",
      31,
      28,
    ),
    component(
      "ice-area",
      "Ice maker and bucket area",
      "Visible ice bucket, fill area, and drips.",
      "user-accessible",
      73,
      24,
    ),
    component(
      "water-line",
      "Household water line",
      "The visible shutoff and line only; do not move the refrigerator.",
      "visible",
      86,
      67,
    ),
    component(
      "drain-system",
      "Internal drain and valves",
      "Defrost drain, inlet valve, and tubing behind panels.",
      "professional-only",
      57,
      73,
    ),
  ],
  safety: {
    label: "Keep water away from power",
    instruction:
      "Place towels at the front without moving the refrigerator. If water is actively spreading, turn off the icemaker and household water only if the controls and valve are dry and safely reachable.",
    stop: "water is near an outlet, the floor is flooding, or moving the refrigerator would be required.",
    firstCheckId: "check-fridge-leak-source",
  },
  checks: [
    check(
      "check-fridge-leak-source",
      "Locate the visible source",
      "filter-area",
      "Look for drips at the filter housing, water inside the ice bucket, or condensation around a door. Do not remove panels or the ice maker.",
      "The location separates a filter or ice-area concern from hidden drains and valves.",
      "water is near wiring, the filter housing is cracked, or the leak is active and growing.",
      [
        outcome(
          "fridge-leak-filter-seating",
          "Drips started after a filter change and the housing is intact",
          "no-part-needed",
          {
            focusComponentId: "filter-area",
            outcomeTitle: "The filter may not be fully seated",
            outcomeMessage:
              "Follow the exact model filter instructions to reseat it once, then keep the area under observation. Stop if dripping continues.",
          },
        ),
        outcome("fridge-leak-ice-area", "Water is in or below the ice bucket", "continue", {
          nextCheckId: "check-fridge-leak-water",
          focusComponentId: "ice-area",
        }),
        outcome("fridge-leak-hidden", "Water comes from below or behind", "professional-only", {
          focusComponentId: "drain-system",
          outcomeTitle: "The source is outside the safe viewing area",
          outcomeMessage:
            "Turn off the household water if safely reachable and arrange service without moving the refrigerator.",
        }),
        outcome(
          "fridge-leak-condensation",
          "Moisture is only around a door that was ajar",
          "no-part-needed",
          {
            focusComponentId: "machine",
            outcomeTitle: "The open door caused condensation",
            outcomeMessage:
              "Close the door fully, dry the area, and monitor it. A returning puddle needs service.",
          },
        ),
      ],
    ),
    check(
      "check-fridge-leak-water",
      "Check ice controls and visible water line",
      "water-line",
      "Turn the icemaker off at its normal control and look for moisture at the visible household shutoff or line. Do not pull the refrigerator forward.",
      "GE directs owners to stop ice production and water supply when the ice area leaks.",
      "the valve or line is hidden, damaged, or wet near power.",
      [
        outcome("fridge-leak-line", "The visible water line or valve is wet", "professional-only", {
          focusComponentId: "water-line",
          outcomeTitle: "Keep the household water off",
          outcomeMessage:
            "A plumber or refrigerator technician should repair the visible connection before water is restored.",
        }),
        outcome("fridge-leak-line-dry", "The visible line is dry", "professional-only", {
          focusComponentId: "drain-system",
          outcomeTitle: "The ice maker, inlet, or drain system needs service",
          outcomeMessage:
            "Keep the icemaker off. Internal fill tubes, valves, and drains require a technician.",
        }),
      ],
    ),
  ],
  causes: [
    {
      id: "fridge-leak-filter",
      label: "Filter seating or housing area",
      componentId: "filter-area",
      baseRank: 35,
      defaultExplanation: "A recently changed filter can drip if not seated.",
      resultScores: { "fridge-leak-filter-seating": 90 },
    },
    {
      id: "fridge-leak-line",
      label: "Visible water-line connection",
      componentId: "water-line",
      baseRank: 30,
      defaultExplanation: "The household line can leak at a connection.",
      resultScores: { "fridge-leak-line": 90 },
    },
    {
      id: "fridge-leak-internal",
      label: "Ice maker, valve, or defrost drain",
      componentId: "drain-system",
      baseRank: 20,
      defaultExplanation: "Internal water paths require service.",
      resultScores: { "fridge-leak-hidden": 75, "fridge-leak-line-dry": 75 },
    },
  ],
};

const refrigeratorIce: ProfileSpec = {
  symptom: {
    id: "ice-maker-not-making-ice",
    label: "Ice maker is not making ice",
    shortLabel: "Ice maker is not making ice",
  },
  components: [
    component(
      "machine",
      "Side-by-side refrigerator",
      "The selected refrigerator and visible controls.",
      "visible",
      50,
      50,
    ),
    component(
      "ice-controls",
      "Ice maker control",
      "The normal on/off control or visible switch.",
      "visible",
      72,
      18,
    ),
    component(
      "ice-bin",
      "Ice bucket and feeler area",
      "The removable bucket and visible ice obstruction.",
      "user-accessible",
      72,
      29,
    ),
    component(
      "filter-area",
      "Water filter",
      "The owner-accessible filter and date indicator.",
      "user-accessible",
      31,
      28,
    ),
    component(
      "ice-system",
      "Internal ice and water system",
      "Fill tube, valve, heater, and ice maker mechanism.",
      "professional-only",
      73,
      39,
    ),
  ],
  safety: {
    label: "Keep hands out of the ice mechanism",
    instruction:
      "Leave the refrigerator powered unless there is damage or leaking. Do not reach into the ice mold, force the rake, or use tools on stuck ice.",
    stop: "water is leaking, wiring is visible, the mechanism is hot, or ice cannot be reached safely.",
    firstCheckId: "check-ice-settings",
  },
  checks: [
    check(
      "check-ice-settings",
      "Check ice power and freezer setting",
      "ice-controls",
      "Confirm the ice maker is on at its normal control and the freezer is set near 0°F. If the refrigerator was installed or warmed recently, note whether 24 hours have passed.",
      "Ice production stops when the ice maker is off or the freezer is too warm.",
      "the control is damaged or an unfamiliar fault is shown.",
      [
        outcome("ice-control-off", "The ice maker was off", "no-part-needed", {
          focusComponentId: "ice-controls",
          outcomeTitle: "The ice maker was switched off",
          outcomeMessage: "Turn it on with the normal control and allow a full production cycle.",
        }),
        outcome("ice-freezer-warm", "The freezer is warmer than 0°F", "professional-only", {
          focusComponentId: "machine",
          outcomeTitle: "Restore safe freezer temperature first",
          outcomeMessage:
            "Ice production depends on a cold freezer. Use the supported not-cooling path and protect food before diagnosing the ice maker.",
        }),
        outcome("ice-settings-ready", "The ice maker is on and the freezer is cold", "continue", {
          nextCheckId: "check-ice-bin-filter",
          focusComponentId: "ice-bin",
        }),
      ],
    ),
    check(
      "check-ice-bin-filter",
      "Inspect the ice bucket and filter status",
      "ice-bin",
      "Remove the ice bucket only by its normal handle. Look for loose cubes blocking the feeler area, then check whether the water filter is older than six months or the dispenser flow is slow. Do not reach into the mold.",
      "A blocked feeler or restricted water filter can stop ice production.",
      "ice is fused around the mechanism, the bucket is stuck, or filter removal does not match the owner guide.",
      [
        outcome(
          "ice-bin-blocked",
          "Loose cubes blocked the bucket or feeler area",
          "no-part-needed",
          {
            focusComponentId: "ice-bin",
            outcomeTitle: "The visible ice obstruction stopped production",
            outcomeMessage:
              "Clear only loose ice from the removable bucket, reinstall it, and allow a full cycle.",
          },
        ),
        outcome(
          "ice-filter-old",
          "The filter is overdue and water flow is slow",
          "professional-only",
          {
            focusComponentId: "filter-area",
            outcomeTitle: "Verify the exact filter before replacement",
            outcomeMessage:
              "This ice-maker guide cannot confirm the exact water filter. Use the slow-water-flow guide for a model-matched filter.",
          },
        ),
        outcome(
          "ice-bin-clear",
          "The bucket is clear and water flow is normal",
          "professional-only",
          {
            focusComponentId: "ice-system",
            outcomeTitle: "The internal ice system needs service",
            outcomeMessage:
              "The visible controls, temperature, bin, and filter indicators are clear. Fill-tube, valve, and ice-maker checks require a technician.",
          },
        ),
      ],
    ),
  ],
  causes: [
    {
      id: "fridge-ice-setting",
      label: "Ice maker off or freezer too warm",
      componentId: "ice-controls",
      baseRank: 40,
      defaultExplanation: "The ice maker needs power and a cold freezer.",
      resultScores: { "ice-control-off": 90, "ice-freezer-warm": 75, "ice-settings-ready": -35 },
    },
    {
      id: "fridge-ice-obstruction",
      label: "Visible ice-bin obstruction",
      componentId: "ice-bin",
      baseRank: 30,
      defaultExplanation: "Loose cubes can block the feeler or bucket.",
      resultScores: { "ice-bin-blocked": 90, "ice-bin-clear": -35 },
    },
    {
      id: "fridge-ice-water",
      label: "Restricted water or internal ice system",
      componentId: "ice-system",
      baseRank: 20,
      defaultExplanation: "Water and ice-making components require exact evidence or service.",
      resultScores: { "ice-filter-old": 60, "ice-bin-clear": 75 },
    },
  ],
};

export function buildSupplementalProfile(
  entry: ApplianceCatalogEntry,
  symptomId: SupportedSymptomId,
  sourceIds: string[],
): RepairPackProfile {
  if (symptomId === "door-will-not-close") {
    if (entry.kind === "washer") return finish(entry, sourceIds, washerDoorClosure(entry));
    if (entry.kind === "dishwasher") return finish(entry, sourceIds, dishwasherDoorClosure);
    if (entry.kind === "refrigerator") return finish(entry, sourceIds, refrigeratorDoorClosure);
  }
  const spec =
    entry.kind === "washer"
      ? symptomId === "will-not-start"
        ? washerStart(entry)
        : symptomId === "will-not-spin"
          ? washerSpin(entry)
          : washerLeak(entry)
      : entry.kind === "dishwasher"
        ? symptomId === "not-cleaning"
          ? dishwasherCleaning
          : symptomId === "will-not-fill"
            ? dishwasherFill
            : dishwasherLeak
        : entry.kind === "dryer"
          ? symptomId === "will-not-start"
            ? dryerStart
            : symptomId === "not-heating"
              ? dryerHeat
              : dryerDrum
          : symptomId === "not-cooling"
            ? refrigeratorCooling
            : symptomId === "is-leaking"
              ? refrigeratorLeak
              : refrigeratorIce;
  return finish(entry, sourceIds, spec);
}
