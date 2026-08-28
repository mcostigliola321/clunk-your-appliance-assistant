import type {
  ApplianceKind,
  CapabilityTier,
  RepairPackPart,
  SourceReference,
  SupportedSymptomId,
  SymptomCoverage,
} from "@/domain/types";

const VERIFIED_ON = "2026-08-27";

export interface SymptomPresentation {
  id: SupportedSymptomId;
  title: string;
  description: string;
}

export const SYMPTOM_PRESENTATION: Record<SupportedSymptomId, SymptomPresentation> = {
  "will-not-drain": {
    id: "will-not-drain",
    title: "Won't drain",
    description: "Water is left behind after the cycle.",
  },
  "will-not-start": {
    id: "will-not-start",
    title: "Won't start",
    description: "The controls respond, but the appliance does not begin running.",
  },
  "will-not-spin": {
    id: "will-not-spin",
    title: "Won't spin",
    description: "Clothes stay wet because the drum does not spin.",
  },
  "is-leaking": {
    id: "is-leaking",
    title: "Water is leaking",
    description: "Water or suds appear around the appliance.",
  },
  "not-cleaning": {
    id: "not-cleaning",
    title: "Dishes stay dirty",
    description: "Food or detergent remains after a full cycle.",
  },
  "will-not-fill": {
    id: "will-not-fill",
    title: "No water enters",
    description: "The cycle starts without filling the tub.",
  },
  "door-will-not-close": {
    id: "door-will-not-close",
    title: "Door won't close",
    description: "The door will not latch or stay shut.",
  },
  "not-heating": {
    id: "not-heating",
    title: "Runs without heat",
    description: "The drum turns, but clothes stay cool and damp.",
  },
  "drum-will-not-turn": {
    id: "drum-will-not-turn",
    title: "Drum won't turn",
    description: "The dryer starts, but the drum does not tumble.",
  },
  "slow-water-flow": {
    id: "slow-water-flow",
    title: "Water is slow",
    description: "The dispenser flow is weaker than usual.",
  },
  "not-cooling": {
    id: "not-cooling",
    title: "Not cold enough",
    description: "Food or freezer temperatures are warmer than expected.",
  },
  "ice-maker-not-making-ice": {
    id: "ice-maker-not-making-ice",
    title: "Ice maker is not making ice",
    description: "The ice bin stays empty or production has stopped.",
  },
};

export const SYMPTOMS_BY_KIND: Record<ApplianceKind, SupportedSymptomId[]> = {
  washer: ["will-not-drain", "will-not-start", "will-not-spin", "is-leaking"],
  dishwasher: ["will-not-drain", "not-cleaning", "will-not-fill", "is-leaking"],
  dryer: ["door-will-not-close", "will-not-start", "not-heating", "drum-will-not-turn"],
  refrigerator: ["slow-water-flow", "not-cooling", "is-leaking", "ice-maker-not-making-ice"],
};

export const DEFAULT_SYMPTOM_BY_KIND: Record<ApplianceKind, SupportedSymptomId> = {
  washer: "will-not-drain",
  dishwasher: "will-not-drain",
  dryer: "door-will-not-close",
  refrigerator: "slow-water-flow",
};

function source(
  id: string,
  title: string,
  url: string,
  publisher: string,
  appliesTo: string,
): SourceReference {
  return {
    id,
    kind: "manufacturer-troubleshooting",
    title,
    url,
    publisher,
    appliesTo,
    lastVerified: VERIFIED_ON,
  };
}

const additionalCoverage: Record<
  string,
  Array<{
    symptomId: SupportedSymptomId;
    sources: SourceReference[];
  }>
> = {
  "ge-gfw550ssnww": [
    {
      symptomId: "will-not-start",
      sources: [
        source(
          "ge-gfw550-no-fill-start",
          "GE front-load washer no-fill and start checks",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=23094",
          "GE Appliances",
          "GE GFW550SSNWW front-load washer family; visible power, pause, and water-supply checks only",
        ),
      ],
    },
    {
      symptomId: "will-not-spin",
      sources: [
        source(
          "ge-gfw550-no-spin",
          "GE front-load washer does-not-spin guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=16243",
          "GE Appliances",
          "GE GFW550SSNWW front-load washer family; pause, load balance, door, and dispenser checks",
        ),
      ],
    },
    {
      symptomId: "is-leaking",
      sources: [
        source(
          "ge-gfw550-leak",
          "GE front-load washer leaking-water guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17532",
          "GE Appliances",
          "GE GFW550SSNWW front-load washer family; gasket, dispenser, detergent, and external-hose checks",
        ),
      ],
    },
  ],
  "whirlpool-wdt750sakz1": [
    {
      symptomId: "not-cleaning",
      sources: [
        source(
          "whirlpool-wdt750-cleaning",
          "Whirlpool dishwasher cleaning-performance guidance",
          "https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Wash_Performance/Other_Cookware_and_Dishes/Dull_Surfaces_on_Dishes",
          "Whirlpool",
          "Whirlpool WDT750SAKZ family; loading, spray-arm, detergent-door, and cleaning checks",
        ),
        source(
          "whirlpool-wdt750-filter",
          "Whirlpool dishwasher filter cleaning guidance",
          "https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Other/Cleaning_and_Odor/Cleaning_and_Maintenance/Cleaning_the_Filter/Cleaning_the_Filter_-_Dishwasher",
          "Whirlpool",
          "Whirlpool WDT750SAKZ family; owner-accessible filter styles must match before removal",
        ),
      ],
    },
    {
      symptomId: "will-not-fill",
      sources: [
        source(
          "whirlpool-wdt750-no-fill",
          "Whirlpool dishwasher will-not-fill guidance",
          "https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Cycle_Concerns/Not_Filling%2F%2FNo_Water/Not_Filling_With_Water_-_Dishwasher",
          "Whirlpool",
          "Whirlpool WDT750SAKZ family; water-supply, door-latch, and drain-loop observations",
        ),
      ],
    },
    {
      symptomId: "is-leaking",
      sources: [
        source(
          "whirlpool-wdt750-leak",
          "Whirlpool dishwasher leaking troubleshooting",
          "https://producthelp.whirlpool.com/Dishwashers/Product_Info/Dishwasher_Product_Assistance/Dishwasher_Leaking_Troubleshooting_Guide",
          "Whirlpool",
          "Whirlpool WDT750SAKZ family; leak location, door seal, suds, and visible connection checks",
        ),
      ],
    },
  ],
  "ge-gtd42easj2ww": [
    {
      symptomId: "will-not-start",
      sources: [
        source(
          "ge-gtd42-no-start",
          "GE dryer will-not-run or start guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17381",
          "GE Appliances",
          "GE GTD42EASJ2WW electric dryer; plug, door, cycle, Start control, and visible door-switch checks",
        ),
      ],
    },
    {
      symptomId: "not-heating",
      sources: [
        source(
          "ge-gtd42-no-heat",
          "GE electric dryer runs-without-heat guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=16921",
          "GE Appliances",
          "GE GTD42EASJ2WW electric dryer; cycle setting, airflow, and household breaker boundary",
        ),
        source(
          "ge-gtd42-drying-time",
          "GE dryer taking-too-long or not-drying guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=18058",
          "GE Appliances",
          "GE GTD42EASJ2WW electric dryer; unplugged lint-screen cleaning and exhaust-airflow applicability",
        ),
        source(
          "ge-gtd42-venting",
          "GE dryer venting-issue guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=21557",
          "GE Appliances",
          "GE GTD42EASJ2WW electric dryer; exterior wall-cap airflow observation and duct-service boundary",
        ),
      ],
    },
    {
      symptomId: "drum-will-not-turn",
      sources: [
        source(
          "ge-gtd42-drum",
          "GE dryer drum-does-not-turn guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17096",
          "GE Appliances",
          "GE GTD42EASJ2WW electric dryer; load-size and unplugged drum-movement observations",
        ),
      ],
    },
  ],
  "ge-gss25gypfs": [
    {
      symptomId: "not-cooling",
      sources: [
        source(
          "ge-gss25-not-cooling",
          "GE refrigerator not-cooling-enough guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=21185",
          "GE Appliances",
          "GE GSS25GYPFS side-by-side refrigerator; controls, door seal, airflow, and installation checks",
        ),
      ],
    },
    {
      symptomId: "is-leaking",
      sources: [
        source(
          "ge-gss25-leak",
          "GE refrigerator icemaker leaking or dripping guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17382",
          "GE Appliances",
          "GE GSS25GYPFS side-by-side refrigerator; filter, ice area, and visible water-line leak checks",
        ),
        source(
          "ge-gss25-filter-seating",
          "GE XWF and XWFE water-filter replacement guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=21284",
          "GE Appliances",
          "GE GSS25GYPFS with XWFE filter; cloth placement, alignment, and fully seated filter observations",
        ),
        source(
          "ge-gss25-condensation",
          "GE fresh-food condensation guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=22825",
          "GE Appliances",
          "GE GSS25GYPFS side-by-side refrigerator; door-ajar condensation, drying, closure, and gasket observations",
        ),
      ],
    },
    {
      symptomId: "ice-maker-not-making-ice",
      sources: [
        source(
          "ge-gss25-no-ice",
          "GE refrigerator icemaker not-producing-ice guidance",
          "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17403",
          "GE Appliances",
          "GE GSS25GYPFS side-by-side refrigerator; icemaker power, temperature, filter, and visible ice-bin checks",
        ),
      ],
    },
  ],
};

export function repairPackId(modelId: string, symptomId: SupportedSymptomId): string {
  return `${modelId}::${symptomId}`;
}

export function buildSymptomCoverage(input: {
  modelId: string;
  kind: ApplianceKind;
  capability: CapabilityTier;
  troubleshootingSources: SourceReference[];
  exactPart?: RepairPackPart;
  verifiedProductCodes: string[];
}): SymptomCoverage[] {
  const defaultSymptom = DEFAULT_SYMPTOM_BY_KIND[input.kind];
  const base: SymptomCoverage = {
    symptomId: defaultSymptom,
    repairPackId: repairPackId(input.modelId, defaultSymptom),
    capability: input.capability,
    troubleshootingSources: input.troubleshootingSources,
    ...(input.exactPart
      ? {
          exactPartEvidence: {
            part: input.exactPart,
            verifiedProductCodes: input.verifiedProductCodes,
          },
        }
      : {}),
  };
  return [
    base,
    ...(additionalCoverage[input.modelId] ?? []).map(({ symptomId, sources }): SymptomCoverage => ({
      symptomId,
      repairPackId: repairPackId(input.modelId, symptomId),
      capability: "guided-checks",
      troubleshootingSources: sources,
    })),
  ];
}

export function getSymptomPresentation(symptomId: SupportedSymptomId) {
  return SYMPTOM_PRESENTATION[symptomId];
}
