import { APPLIANCE_CATALOG } from "../../../src/data/applianceCatalog";
import { fileURLToPath } from "node:url";

const VERIFIED_ON = "2026-08-28";
const SYMPTOMS = [
  {
    id: "will-not-drain",
    label: "Won't drain",
    definition: "Water is left behind after the cycle.",
  },
  {
    id: "door-will-not-close",
    label: "Door won't close",
    definition: "The door will not latch or stay shut.",
  },
  {
    id: "slow-water-flow",
    label: "Water is slow",
    definition: "The dispenser flow is weaker than usual.",
  },
] as const;

type SymptomId = (typeof SYMPTOMS)[number]["id"];
const POST_RECON_ACTIVATION_IDS = new Set([
  "lg-wm4000hba",
  "ge-gtw325aswww",
  "bosch-shp78cm5n34",
  "samsung-dw80cg5450sraa",
  "lg-dle7000w",
  "ge-gtd38easwws",
  "whirlpool-wrs321sdhz08",
  "samsung-rf27cg5100sraa",
  "lg-wm6500hba",
  "ge-gtw385aswws",
  "whirlpool-wtw6157pw",
  "maytag-mvw7232hw",
  "amana-ntw4516fw",
  "electrolux-elfw7437aw",
  "ge-gdp670sgvww",
  "whirlpool-wdt540hamz",
  "maytag-mdb8959skz",
  "kitchenaid-kdte204kps",
  "lg-ldps6762s",
  "bosch-shx5aem5n01",
  "lg-dlex6500b",
  "ge-gtd58ebsvws",
  "whirlpool-wed6150pb",
  "maytag-med6500mbk",
  "electrolux-elfe7437aw",
  "samsung-dve54cg7150da3",
  "lg-lrmvc2306s",
  "ge-gne29gynfs",
  "whirlpool-wrf555sdfz08",
  "kitchenaid-krff305ess00",
  "bosch-b36ct81ens07",
  "maytag-mrff5033pz",
]);
const BASE_CATALOG = APPLIANCE_CATALOG.filter((entry) => !POST_RECON_ACTIVATION_IDS.has(entry.id));
if (BASE_CATALOG.length !== 131)
  throw new Error(
    `The reconnaissance snapshot requires 131 baseline models, found ${BASE_CATALOG.length}.`,
  );

type Source = {
  id: string;
  kind:
    | "manufacturer-model"
    | "manufacturer-troubleshooting"
    | "manufacturer-manual"
    | "manufacturer-part"
    | "authorized-parts"
    | "retailer";
  title: string;
  url: string;
  publisher: string;
  appliesTo: string;
  verifiedOn: string;
  quality: "primary" | "authorized-secondary" | "commerce-only";
};

const sources: Record<string, Source> = {};
function addSource(source: Source) {
  sources[source.id] = source;
  return source.id;
}
function source(
  id: string,
  kind: Source["kind"],
  title: string,
  url: string,
  publisher: string,
  appliesTo: string,
  quality: Source["quality"] = "primary",
) {
  return addSource({
    id,
    kind,
    title,
    url,
    publisher,
    appliesTo,
    verifiedOn: VERIFIED_ON,
    quality,
  });
}

const doorSources = {
  washer: {
    "LG|front-load": [
      source(
        "lg-front-washer-door",
        "manufacturer-troubleshooting",
        "LG front-load washer dE/dE1/dE2 door errors",
        "https://www.lg.com/us/support/help-library/front-load-washer-what-are-de-de1-and-de2-error-codes--1400508168566",
        "LG",
        "LG front-load washers; all-model article with model-dependent visuals",
      ),
    ],
    "LG|top-load": [
      source(
        "lg-top-washer-lid",
        "manufacturer-troubleshooting",
        "LG top-load washer door will not close",
        "https://www.lg.com/us/support/help-library/troubleshooting-an-lg-top-load-washer-door-that-will-not-close-properly-CT10000010-20152830489687",
        "LG",
        "LG top-load washers; all-model article with model-dependent visuals",
      ),
    ],
    "Samsung|front-load": [
      source(
        "samsung-washer-door",
        "manufacturer-troubleshooting",
        "Samsung washer door error guidance",
        "https://www.samsung.com/us/support/troubleshoot/TSG10000997/",
        "Samsung",
        "Samsung washers; exact error meaning varies by model and manual",
      ),
    ],
    "Samsung|top-load": ["samsung-washer-door"],
    "Whirlpool|front-load": [
      source(
        "whirlpool-front-washer-door",
        "manufacturer-troubleshooting",
        "Whirlpool front-load washer door latching",
        "https://producthelp.whirlpool.com/Laundry/Washers/Product_Info/Washer_Product_Assistance/Latching_a_Front_Load_Washer_Door",
        "Whirlpool",
        "Whirlpool front-load washers",
      ),
    ],
    "Whirlpool|top-load": [
      source(
        "whirlpool-top-washer-lid",
        "manufacturer-troubleshooting",
        "Whirlpool top-load washer lid not latching",
        "https://producthelp.whirlpool.com/Laundry/Washers/Top_Load_Washer/Operation/Not_Operating/Lid_Not_Latching_-_Washer",
        "Whirlpool",
        "Whirlpool top-load washers",
      ),
    ],
    "Maytag|front-load": [
      source(
        "maytag-front-washer-door",
        "manufacturer-troubleshooting",
        "Maytag front-load washer door will not lock",
        "https://producthelp.maytag.com/Laundry/Washers/Front_Load_Washers/Door_Issues/Door_Will_Not_Lock_or_Unlock_-_Front_Load_Washer",
        "Maytag",
        "Maytag front-load washers",
      ),
    ],
    "Maytag|top-load": [
      source(
        "maytag-top-washer-lid",
        "manufacturer-troubleshooting",
        "Maytag top-load washer LdL lid-lock error",
        "https://producthelp.maytag.com/Laundry/Washers/Top_Load_Washer/Error_Codes_or_Flashing_Lights/Other_Error_Codes/LdL_-_Error_Code",
        "Maytag",
        "Maytag top-load washers that display LdL; models without that code need manual confirmation",
      ),
    ],
    "Amana|front-load": [
      source(
        "amana-front-washer-door",
        "manufacturer-troubleshooting",
        "Amana front-load washer door will not lock",
        "https://producthelp.amana.com/Laundry/Washers/Front_Load_Washers/Door_Issues/Door_Will_Not_Lock_-_Front_Load_Washer",
        "Amana",
        "Amana front-load washers",
      ),
    ],
    "Amana|top-load": [
      source(
        "amana-top-washer-lid",
        "manufacturer-troubleshooting",
        "Amana top-load washer lid not latching",
        "https://producthelp.amana.com/Laundry/Washers/Top_Load_Washer/Operation/Not_Operating/Lid_Not_Latching_-_Washer",
        "Amana",
        "Amana top-load washers",
      ),
    ],
    "Electrolux|front-load": [
      source(
        "electrolux-front-washer-door",
        "manufacturer-troubleshooting",
        "Electrolux E41 washer door-open guidance",
        "https://owner.electrolux.com/support-articles/article/1820509-laundry-front-loading-washer-displaying-error-code-e41-door-is-open-",
        "Electrolux",
        "Electrolux front-load washers",
      ),
    ],
  } as Record<string, string[]>,
  dishwasher: {
    Whirlpool: [
      source(
        "whirlpool-dishwasher-door",
        "manufacturer-troubleshooting",
        "Whirlpool dishwasher door will not close",
        "https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Door_Concerns/Door_Will_Not_Close/Door_Will_Not_Close_-_Dishwasher",
        "Whirlpool",
        "Whirlpool built-in dishwashers; Open Door Dry step only on equipped models",
      ),
    ],
    KitchenAid: [
      source(
        "kitchenaid-dishwasher-door",
        "manufacturer-troubleshooting",
        "KitchenAid dishwasher door will not close",
        "https://producthelp.kitchenaid.com/Dishwashers/Dishwasher/Door_Concerns/Door_Will_Not_Close/Door_Will_Not_Close_-_Dishwasher",
        "KitchenAid",
        "KitchenAid built-in dishwashers; Open Door Dry step only on equipped models",
      ),
    ],
    Samsung: [
      source(
        "samsung-dishwasher-door",
        "manufacturer-troubleshooting",
        "Samsung dishwasher door does not close",
        "https://www.samsung.com/us/support/troubleshooting/TSG01001919/",
        "Samsung",
        "Samsung dishwashers; AutoRelease step only on equipped models",
      ),
    ],
    GE: [
      source(
        "ge-dishwasher-door",
        "manufacturer-troubleshooting",
        "GE dishwasher door will not latch",
        "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17527",
        "GE Appliances",
        "GE dishwashers; adjustable-rack note only for listed model prefixes",
      ),
    ],
    Bosch: [
      source(
        "bosch-dishwasher-door",
        "manufacturer-troubleshooting",
        "Bosch dishwasher troubleshooting",
        "https://www.bosch-home.com/us/owner-support/dishwashers/troubleshooting",
        "Bosch",
        "Bosch dishwashers; AutoAir and error-code branches are model-specific",
      ),
    ],
    Frigidaire: [
      source(
        "frigidaire-dishwasher-door",
        "manufacturer-troubleshooting",
        "Frigidaire dishwasher CL/Cd door-open code",
        "https://owner.frigidaire.com/support-articles/article/1830354-dishwasher-error-code-cl-or-cd-door-is-open",
        "Frigidaire",
        "Frigidaire dishwashers that display CL or Cd; supports closure/latch confirmation only",
      ),
    ],
  } as Record<string, string[]>,
  refrigerator: {
    LG: [
      source(
        "lg-refrigerator-door",
        "manufacturer-troubleshooting",
        "LG refrigerator door not closing properly",
        "https://www.lg.com/us/support/help-library/lg-refrigerator-how-to-troubleshoot-a-refrigerator-door-not-closing-properly-CT10000021-20153109606488",
        "LG",
        "LG refrigerators; all-model article with model-dependent visuals",
      ),
    ],
    Samsung: [
      source(
        "samsung-refrigerator-door",
        "manufacturer-troubleshooting",
        "Samsung refrigerator or freezer doors will not close",
        "https://www.samsung.com/us/support/troubleshoot/TSG10007112/",
        "Samsung",
        "Samsung refrigerators; drawer, showcase, flap, and alignment branches are topology-specific",
      ),
    ],
    GE: [
      source(
        "ge-refrigerator-door",
        "manufacturer-troubleshooting",
        "GE refrigerator door will not close",
        "https://products.geappliances.com/appliance/gea-support-search-content?contentId=18947",
        "GE Appliances",
        "GE refrigerators and freezers; built-in leveling exclusions apply",
      ),
    ],
    Whirlpool: [
      source(
        "whirlpool-refrigerator-door",
        "manufacturer-troubleshooting",
        "Whirlpool refrigerator doors not closing properly",
        "https://producthelp.whirlpool.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Installation_Support/Doors_Not_Closing_Properly",
        "Whirlpool",
        "Whirlpool full-size refrigerators; French-door mullion guidance only on French-door models",
      ),
    ],
    Maytag: [
      source(
        "maytag-refrigerator-door",
        "manufacturer-troubleshooting",
        "Maytag refrigerator doors not closing properly",
        "https://producthelp.maytag.com/Refrigeration/Full-size_Refrigerators/Product_Info/Installation_Support/Doors_Not_Closing_Properly",
        "Maytag",
        "Maytag full-size refrigerators; French-door mullion guidance only on French-door models",
      ),
    ],
    Amana: [
      source(
        "amana-refrigerator-door",
        "manufacturer-troubleshooting",
        "Amana refrigerator door not closing",
        "https://producthelp.amana.com/Refrigeration/Full-Size_Refrigerators/French_Door_Bottom_Freezer_Refrigerator/Door_Concerns/Not_Closing/Door_Not_Closing_-_Refrigerator",
        "Amana",
        "Amana French-door refrigerators; side-by-side models may use only obstruction/bin/level checks pending manual confirmation",
      ),
    ],
    KitchenAid: [
      source(
        "kitchenaid-refrigerator-door",
        "manufacturer-troubleshooting",
        "KitchenAid refrigerator doors not closing properly",
        "https://producthelp.kitchenaid.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Installation_Support/Doors_Not_Closing_Properly",
        "KitchenAid",
        "KitchenAid full-size refrigerators; French-door mullion guidance only on French-door models",
      ),
    ],
    Electrolux: [
      source(
        "electrolux-refrigerator-door",
        "manufacturer-troubleshooting",
        "Electrolux refrigerator door issues",
        "https://owner.electrolux.com/support-articles/article/refrigerators-door-issues",
        "Electrolux",
        "Electrolux refrigerators",
      ),
    ],
    Frigidaire: [
      source(
        "frigidaire-refrigerator-door",
        "manufacturer-troubleshooting",
        "Frigidaire refrigerator door issues",
        "https://owner.frigidaire.com/support-articles/article/refrigerators-door-issues",
        "Frigidaire",
        "Frigidaire refrigerators",
      ),
    ],
    Bosch: [
      source(
        "bosch-refrigerator-door",
        "manufacturer-troubleshooting",
        "Bosch refrigerator door does not shut",
        "https://www.bosch-home.com/us/owner-support/get-support/self-help-fridge-does-not-shut",
        "Bosch",
        "Bosch refrigerators; supports door-seal inspection/cleaning and service escalation",
      ),
    ],
  } as Record<string, string[]>,
};

const additions = [
  {
    id: "lg-wm4000hba",
    kind: "washer",
    brand: "LG",
    model: "WM4000HBA",
    label: "4.5 cu. ft. front-load washer",
    aliases: ["WM4000HBA", "WM4000HBA.ABLEVUS"],
    verifiedProductCodes: ["WM4000HBA.ABLEVUS"],
    productCodePrompt: "Enter the complete suffix after WM4000HBA.",
    topology: "front-filter",
    loadStyle: "front-load",
    supportedSymptom: "will-not-drain",
    modelUrl: "https://www.lg.com/us/support/product/lg-WM4000HBA.ABLEVUS?tab=1",
    currentSourceUrls: [
      "https://www.lg.com/us/support/help-library/lg-washing-machine-water-not-draining--20154726902590",
    ],
  },
  {
    id: "ge-gtw325aswww",
    kind: "washer",
    brand: "GE",
    model: "GTW325ASWWW",
    label: "4.0 cu. ft. top-load washer",
    aliases: ["GTW325ASWWW"],
    verifiedProductCodes: [],
    productCodePrompt: "Enter the complete engineering model from the rating label.",
    topology: "washer-top-load",
    loadStyle: "top-load",
    supportedSymptom: "will-not-drain",
    modelUrl: "https://products.geappliances.com/appliance/gea-specs/GTW325ASWWW/support",
    currentSourceUrls: [
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=23080",
    ],
  },
  {
    id: "bosch-shp78cm5n34",
    kind: "dishwasher",
    brand: "Bosch",
    model: "SHP78CM5N/34",
    label: "800 Series 24-inch dishwasher",
    aliases: ["SHP78CM5N", "SHP78CM5N/34"],
    verifiedProductCodes: ["SHP78CM5N/34"],
    productCodePrompt: "Enter the complete E-Nr including the slash suffix.",
    topology: "dishwasher",
    supportedSymptom: "will-not-drain",
    modelUrl: "https://www.bosch-home.com/us/en/productservice/SHP78CM5N-34",
    currentSourceUrls: ["https://www.bosch-home.com/us/owner-support/dishwashers/troubleshooting"],
  },
  {
    id: "samsung-dw80cg5450sr-aa",
    kind: "dishwasher",
    brand: "Samsung",
    model: "DW80CG5450SR/AA",
    label: "46 dBA StormWash dishwasher",
    aliases: ["DW80CG5450SR", "DW80CG5450SR/AA", "DW80CG5450SRAA"],
    verifiedProductCodes: ["DW80CG5450SR/AA"],
    productCodePrompt: "Enter the complete model code including /AA.",
    topology: "dishwasher",
    supportedSymptom: "will-not-drain",
    modelUrl:
      "https://www.samsung.com/us/home-appliances/dishwashers/rotary/smart-46-dba-dishwasher-with-stormwash-in-stainless-steel-dw80cg5450sraa/",
    currentSourceUrls: ["https://www.samsung.com/us/support/troubleshoot/TSG10004498/"],
  },
  {
    id: "lg-dle7000w",
    kind: "dryer",
    brand: "LG",
    model: "DLE7000W",
    label: "7.3 cu. ft. electric dryer",
    aliases: ["DLE7000W", "DLE7000W.ABWETUS"],
    verifiedProductCodes: ["DLE7000W.ABWETUS"],
    productCodePrompt: "Enter the complete suffix after DLE7000W.",
    topology: "electric-dryer",
    supportedSymptom: "door-will-not-close",
    modelUrl: "https://www.lg.com/us/support/product/lg-DLE7000W",
    currentSourceUrls: [
      "https://www.lg.com/us/support/help-library/lg-dryer-error-code-list--20154710772482",
    ],
  },
  {
    id: "ge-gtd38easwws",
    kind: "dryer",
    brand: "GE",
    model: "GTD38EASWWS",
    label: "7.2 cu. ft. electric dryer",
    aliases: ["GTD38EASWWS"],
    verifiedProductCodes: [],
    productCodePrompt: "Enter the complete engineering model from the door-opening label.",
    topology: "electric-dryer",
    supportedSymptom: "door-will-not-close",
    modelUrl: "https://products.geappliances.com/appliance/gea-specs/GTD38EASWWS/support",
    currentSourceUrls: [
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17381",
    ],
  },
  {
    id: "whirlpool-wrs321sdhz08",
    kind: "refrigerator",
    brand: "Whirlpool",
    model: "WRS321SDHZ",
    label: "21 cu. ft. side-by-side refrigerator",
    aliases: ["WRS321SDHZ", "WRS321SDHZ08"],
    verifiedProductCodes: ["WRS321SDHZ08"],
    productCodePrompt: "Enter the complete model number and final engineering digits.",
    topology: "side-by-side-refrigerator",
    supportedSymptom: "slow-water-flow",
    modelUrl: "https://www.whirlpool.com/owners-center-pdp.WRS321SDHZ08.html",
    currentSourceUrls: [
      "https://producthelp.whirlpool.com/%40api/deki/pages/11745/pdf/Not%2BDispensing%2BIce%2Bor%2BWater%2B-%2BRefrigerator.pdf",
    ],
  },
  {
    id: "samsung-rf27cg5100sr-aa",
    kind: "refrigerator",
    brand: "Samsung",
    model: "RF27CG5100SR/AA",
    label: "27 cu. ft. counter-depth French-door refrigerator",
    aliases: ["RF27CG5100SR", "RF27CG5100SR/AA", "RF27CG5100SRAA"],
    verifiedProductCodes: ["RF27CG5100SR/AA"],
    productCodePrompt: "Enter the complete model code including /AA.",
    topology: "french-door-refrigerator",
    supportedSymptom: "slow-water-flow",
    modelUrl:
      "https://www.samsung.com/us/business/home-appliances/refrigerators/3-door-french-door/27-cu-ft-mega-capacity-counter-depth-3-door-french-door-refrigerator-with-dual-auto-ice-maker-in-stainless-steel-rf27cg5100sraa/",
    currentSourceUrls: ["https://www.samsung.com/us/support/troubleshoot/TSG10003791/"],
  },
] as const;

for (const model of additions) {
  source(
    `${model.id}-model`,
    "manufacturer-model",
    `${model.brand} ${model.model} official model page`,
    model.modelUrl,
    model.brand,
    model.model,
    "primary",
  );
  model.currentSourceUrls.forEach((url, index) =>
    source(
      `${model.id}-current-${index + 1}`,
      "manufacturer-troubleshooting",
      `${model.brand} ${model.supportedSymptom} guidance`,
      url,
      model.brand,
      `${model.brand} ${model.kind} cohort; model/revision limits in source`,
      "primary",
    ),
  );
}

const profileFor = (kind: string, brand: string, loadStyle?: string) => {
  if (kind === "washer") return doorSources.washer[`${brand}|${loadStyle ?? "front-load"}`];
  if (kind === "dishwasher") return doorSources.dishwasher[brand];
  if (kind === "refrigerator") return doorSources.refrigerator[brand];
  return undefined;
};

const checksByKind = {
  washer: [
    "Stop the cycle and wait for the door/lid lock indicator to clear.",
    "Remove clothing or debris caught at the visible door/lid edge.",
    "Wipe only the visible latch/strike contact area with a soft damp cloth.",
    "Close the door/lid firmly once; do not force it or bypass the lock.",
  ],
  dishwasher: [
    "Confirm dishes, handles, and utensils stay inside the rack envelope.",
    "Push both racks fully home and remove visible debris at the door seal.",
    "Check for visible cabinet or countertop interference without loosening hardware.",
    "Close the door once; do not force the latch.",
  ],
  refrigerator: [
    "Move food packages, bins, drawers, or shelves that block closure.",
    "Wipe visible gasket soil with a soft cloth and mild soapy water.",
    "Check only the topology-specific mullion/flap position when the source and model support it.",
    "Close the door gently and observe whether it stays shut.",
  ],
} as const;

const safetyByKind = {
  washer: {
    homeowner: [
      "External visual inspection and gentle cleaning only",
      "Power-off reset only where the official source instructs it",
    ],
    professional: [
      "Latch/lock/strike replacement",
      "Door alignment, hinge, wiring, sensor, or internal access",
    ],
    stop: [
      "Standing water behind a locked front-load door",
      "Active leak, burning smell, damaged glass, or a forced/bypassed lock",
    ],
  },
  dishwasher: {
    homeowner: [
      "Rack/loading/visible-seal checks only",
      "Observe cabinet interference without loosening hardware",
    ],
    professional: [
      "Latch, hinge, spring, alignment, or installation correction",
      "Any panel removal or electrical diagnosis",
    ],
    stop: [
      "Active leak, hot water, burning smell, exposed wiring, or a door that cannot safely support itself",
    ],
  },
  refrigerator: {
    homeowner: [
      "Food/bin/shelf obstruction and visible gasket cleaning only",
      "Model-documented visible mullion/flap check",
    ],
    professional: [
      "Hinge, door, gasket replacement, heavy-unit leveling/movement, wiring, or sensor work",
    ],
    stop: [
      "Damaged hinge or door, unstable appliance, exposed wiring, refrigerant concern, or food-safety temperature excursion",
    ],
  },
} as const;

const gapReason = (kind: string, symptom: SymptomId) => {
  if (symptom === "slow-water-flow" && kind !== "refrigerator")
    return `Semantic mismatch: Clunk defines this symptom as weak dispenser flow; ${kind}s do not expose that refrigerator-dispenser behavior.`;
  if (symptom === "will-not-drain" && !["washer", "dishwasher"].includes(kind))
    return `Topology mismatch: ${kind}s do not have the cycle-drain behavior defined by this symptom.`;
  if (symptom === "door-will-not-close" && kind === "dryer")
    return "Already the implemented dryer symptom, not a missing combination.";
  return "No official brand/category/topology troubleshooting source was found that safely supports model-cohort reuse; model manual review remains required.";
};

type EvidenceRow = {
  rowId: string;
  roster: "existing-131" | "recommended-addition";
  coverageStatus: "implemented" | "candidate" | "unsupported";
  appliance: {
    category: string;
    brand: string;
    modelFamily: string;
    aliases: readonly string[];
    label: string;
    topology: string | null | undefined;
    loadStyle: string | null;
  };
  symptom: { id: SymptomId; label: string; definition: string };
  modelIdentitySourceId: string;
  troubleshootingSourceIds: string[];
  capabilityTier: string;
  partEvidence: unknown;
  [key: string]: unknown;
};

const rows: EvidenceRow[] = [];
for (const model of BASE_CATALOG) {
  const modelSourceId = addSource({
    ...model.modelSource,
    verifiedOn: VERIFIED_ON,
    quality: "primary",
  } as Source);
  const implementedTroubleshootingIds = model.troubleshootingSources.map((s) =>
    addSource({ ...s, verifiedOn: VERIFIED_ON, quality: "primary" } as Source),
  );
  for (const symptom of SYMPTOMS) {
    const implemented = model.supportedSymptom === symptom.id;
    const doorCandidate =
      !implemented &&
      symptom.id === "door-will-not-close" &&
      ["washer", "dishwasher", "refrigerator"].includes(model.kind);
    const candidateSources = doorCandidate
      ? profileFor(model.kind, model.brand, model.loadStyle)
      : undefined;
    const supportedCandidate = Boolean(candidateSources?.length);
    const capabilityTier = implemented
      ? model.capability
      : supportedCandidate
        ? "guided-checks"
        : "unsupported";
    rows.push({
      rowId: `${model.id}__${symptom.id}`,
      roster: "existing-131",
      coverageStatus: implemented
        ? "implemented"
        : supportedCandidate
          ? "candidate"
          : "unsupported",
      appliance: {
        category: model.kind,
        brand: model.brand,
        modelFamily: model.model,
        aliases: model.aliases,
        label: model.label,
        topology: model.topology,
        loadStyle: model.loadStyle ?? null,
      },
      completeCode: {
        required: true,
        prompt: model.productCodePrompt,
        currentlyVerifiedCodes: model.verifiedProductCodes ?? [],
        requirement:
          "Complete rating-label code is required before any exact-part claim; family identity is sufficient only for bounded checks when source applicability is explicit.",
      },
      symptom: { id: symptom.id, label: symptom.label, definition: symptom.definition },
      modelIdentitySourceId: modelSourceId,
      troubleshootingSourceIds: implemented
        ? implementedTroubleshootingIds
        : supportedCandidate
          ? candidateSources
          : [],
      applicability: implemented
        ? `Current Clunk repair pack for ${model.brand} ${model.model}; ${model.topology}; ${model.loadStyle ?? "category topology"}.`
        : supportedCandidate
          ? `Brand-specific ${model.kind} cohort only; ${model.topology}; ${model.loadStyle ?? "load style not applicable"}. Feature-specific branches require the complete model/manual.`
          : "No evidence transfer. Category semantics or source applicability do not support this combination.",
      homeownerObservableChecks: implemented
        ? ["See current repair pack; existing checks and source IDs remain authoritative."]
        : supportedCandidate
          ? checksByKind[model.kind as keyof typeof checksByKind]
          : [],
      safetyBoundaries: implemented
        ? {
            homeowner: ["Current repair-pack safety tags and stop conditions apply."],
            professional: ["Current repair-pack professional-only boundaries apply."],
            stop: ["Current repair-pack hazard and escalation conditions apply."],
          }
        : supportedCandidate
          ? safetyByKind[model.kind as keyof typeof safetyByKind]
          : {
              homeowner: [],
              professional: [],
              stop: [
                "Do not create a flow from this row until symptom semantics and primary evidence are resolved.",
              ],
            },
      proposedProfile: implemented
        ? model.profile
        : supportedCandidate
          ? `${model.kind}-door-closure-observation`
          : null,
      modelSpecificException: supportedCandidate
        ? model.kind === "washer" && model.loadStyle === "top-load"
          ? "Consumer label must say ‘door or lid’; never imply a front-door gasket."
          : model.kind === "refrigerator" && model.topology === "french-door-refrigerator"
            ? "Mullion/flap check only when the exact model manual confirms the feature."
            : model.kind === "dishwasher"
              ? "Auto-open/AutoRelease behavior only when the exact model supports it."
              : null
        : null,
      capabilityTier,
      partEvidence:
        implemented && model.exactPart
          ? {
              sku: model.exactPart.sku,
              compatibleProductCodes: model.exactPart.compatibleProductCodes,
              compatibleModel: model.exactPart.compatibleModel,
              compatibilitySourceId: addSource({
                ...model.exactPart.source,
                verifiedOn: VERIFIED_ON,
                quality:
                  model.exactPart.source.kind === "authorized-parts"
                    ? "authorized-secondary"
                    : "primary",
              } as Source),
              retailerEvidence: model.exactPart.purchase ?? null,
              commerceAudit: model.exactPart.commerce ?? null,
              note: "Part evidence belongs only to the implemented symptom outcome and does not transfer to other rows.",
            }
          : null,
      verifiedOn: VERIFIED_ON,
      unresolvedGaps: implemented
        ? []
        : supportedCandidate
          ? [
              "No exact complete-code-to-part evidence was collected for this added symptom.",
              "Exact model manual must confirm any feature-specific branch before implementation.",
            ]
          : [gapReason(model.kind, symptom.id)],
    });
  }
}

for (const model of additions) {
  for (const symptom of SYMPTOMS) {
    const loadStyle = "loadStyle" in model ? model.loadStyle : undefined;
    const primaryCandidate = model.supportedSymptom === symptom.id;
    const doorCandidate =
      symptom.id === "door-will-not-close" &&
      ["washer", "dishwasher", "refrigerator"].includes(model.kind);
    const candidateSources = doorCandidate
      ? profileFor(model.kind, model.brand, loadStyle)
      : undefined;
    const supportedCandidate = primaryCandidate || Boolean(candidateSources?.length);
    rows.push({
      rowId: `${model.id}__${symptom.id}`,
      roster: "recommended-addition",
      coverageStatus: supportedCandidate ? "candidate" : "unsupported",
      appliance: {
        category: model.kind,
        brand: model.brand,
        modelFamily: model.model,
        aliases: model.aliases,
        label: model.label,
        topology: model.topology,
        loadStyle: loadStyle ?? null,
      },
      completeCode: {
        required: true,
        prompt: model.productCodePrompt,
        currentlyVerifiedCodes: model.verifiedProductCodes,
        requirement:
          "Complete rating-label code is required before any part claim; these additions are checks-only.",
      },
      symptom: { id: symptom.id, label: symptom.label, definition: symptom.definition },
      modelIdentitySourceId: `${model.id}-model`,
      troubleshootingSourceIds: primaryCandidate
        ? model.currentSourceUrls.map((_, i) => `${model.id}-current-${i + 1}`)
        : supportedCandidate
          ? candidateSources
          : [],
      applicability: supportedCandidate
        ? `Official ${model.brand} model identity plus brand/category cohort troubleshooting; ${model.topology}. Complete-code/manual gates remain.`
        : "No evidence transfer; symptom semantics or primary evidence do not support this combination.",
      homeownerObservableChecks: supportedCandidate
        ? doorCandidate
          ? checksByKind[model.kind as keyof typeof checksByKind]
          : [
              "Use only the conservative externally observable checks in the cited manufacturer guidance.",
            ]
        : [],
      safetyBoundaries: supportedCandidate
        ? doorCandidate
          ? safetyByKind[model.kind as keyof typeof safetyByKind]
          : {
              homeowner: [
                "External observation and manufacturer-documented consumer maintenance only",
              ],
              professional: [
                "Internal access, wiring, energized testing, sealed-system work, or part replacement without exact evidence",
              ],
              stop: [
                "Leak, hot water, burning smell, exposed wiring, unstable appliance, or any unsafe condition",
              ],
            }
        : {
            homeowner: [],
            professional: [],
            stop: ["Do not implement until primary evidence exists."],
          },
      proposedProfile: supportedCandidate
        ? doorCandidate
          ? `${model.kind}-door-closure-observation`
          : `${model.kind}-${symptom.id}-existing-conservative-profile`
        : null,
      modelSpecificException:
        model.brand === "Bosch"
          ? "Complete E-Nr slash suffix required; do not merge revisions."
          : model.brand === "Samsung"
            ? "Preserve /AA code and feature-year constraints."
            : null,
      capabilityTier: supportedCandidate ? "guided-checks" : "unsupported",
      partEvidence: null,
      verifiedOn: VERIFIED_ON,
      unresolvedGaps: supportedCandidate
        ? [
            "No exact complete-code-to-part evidence; do not make purchase-ready.",
            "Manual-level feature confirmation is still required before implementation.",
          ]
        : [gapReason(model.kind, symptom.id)],
    });
  }
}

const countBy = (fn: (row: EvidenceRow) => string) =>
  Object.fromEntries(
    [
      ...rows
        .reduce((m, row) => m.set(fn(row), (m.get(fn(row)) ?? 0) + 1), new Map<string, number>())
        .entries(),
    ].sort(),
  );
const counts = {
  rows: rows.length,
  uniqueExistingModels: BASE_CATALOG.length,
  recommendedAdditions: additions.length,
  byCategory: countBy((r) => r.appliance.category),
  bySymptom: countBy((r) => r.symptom.id),
  byManufacturer: countBy((r) => r.appliance.brand),
  byCapabilityTier: countBy((r) => r.capabilityTier),
  byCoverageStatus: countBy((r) => r.coverageStatus),
  existingRosterMissingOnly: Object.fromEntries(
    Object.entries(
      countBy((r) =>
        r.roster === "existing-131" && r.coverageStatus !== "implemented"
          ? r.capabilityTier
          : "excluded",
      ),
    ).filter(([k]) => k !== "excluded"),
  ),
};

const cohortDefinitions = [
  {
    id: "washer-door-closure-observation",
    scope: "Brand-specific front-load or top-load washer cohorts only",
    checks: checksByKind.washer,
    exclusions: [
      "No brand transfer",
      "Front-load gasket steps do not apply to top-load lids",
      "Do not bypass, force, or replace a lock",
    ],
    exceptionRule: "Exact manual wins; absent a brand/topology source, remain unsupported.",
  },
  {
    id: "dishwasher-door-closure-observation",
    scope: "Brand-specific built-in dishwasher cohorts only",
    checks: checksByKind.dishwasher,
    exclusions: [
      "No cross-brand latch assumptions",
      "AutoRelease/open-dry branches only on equipped models",
      "No hinge/spring/alignment repair",
    ],
    exceptionRule: "Use model-prefix and feature gates stated by the manufacturer.",
  },
  {
    id: "refrigerator-door-closure-observation",
    scope:
      "Brand-specific full-size refrigerator cohorts, split by side-by-side and French-door topology",
    checks: checksByKind.refrigerator,
    exclusions: [
      "No sealed-system or hinge repair",
      "No heavy-unit movement",
      "French-door mullion step not used on side-by-side models",
    ],
    exceptionRule:
      "Model manual confirms flap/mullion, drawer, showcase-door, and leveling branches.",
  },
];

const dataset = {
  schemaVersion: 1,
  title: "Clunk model × symptom evidence reconnaissance",
  generatedOn: VERIFIED_ON,
  scope: {
    existingModels: 131,
    symptomCatalog: SYMPTOMS,
    interpretation:
      "Complete Cartesian matrix of 131 existing models × 3 implemented symptom IDs, plus 8 recommended additions × the same 3 IDs.",
  },
  evidenceRules: [
    "Model identity never implies symptom coverage.",
    "No evidence transfer across brands or incompatible topologies.",
    "Generic category guidance without brand/category applicability cannot create a candidate.",
    "Purchase-ready requires exact complete-code-to-part compatibility plus separately verified commerce evidence.",
  ],
  counts,
  sourceRegistry: sources,
  cohortDefinitions,
  rows,
};

const outDir = fileURLToPath(new URL("./", import.meta.url));
await Bun.write(`${outDir}candidate-coverage.json`, JSON.stringify(dataset, null, 2) + "\n");
const csvHeader = [
  "row_id",
  "roster",
  "coverage_status",
  "category",
  "brand",
  "model_family",
  "symptom_id",
  "capability_tier",
  "model_source_id",
  "troubleshooting_source_ids",
  "proposed_profile",
  "gap_count",
  "verified_on",
];
const csvEscape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csv =
  [
    csvHeader,
    ...rows.map((r) => [
      r.rowId,
      r.roster,
      r.coverageStatus,
      r.appliance.category,
      r.appliance.brand,
      r.appliance.modelFamily,
      r.symptom.id,
      r.capabilityTier,
      r.modelIdentitySourceId,
      r.troubleshootingSourceIds.join("|"),
      r.proposedProfile,
      r.unresolvedGaps.length,
      r.verifiedOn,
    ]),
  ]
    .map((line) => line.map(csvEscape).join(","))
    .join("\n") + "\n";
await Bun.write(`${outDir}candidate-coverage.csv`, csv);
await Bun.write(`${outDir}counts.json`, JSON.stringify(counts, null, 2) + "\n");
await Bun.write(
  `${outDir}cohorts-and-exceptions.json`,
  JSON.stringify(
    {
      generatedOn: VERIFIED_ON,
      cohortDefinitions,
      evidenceGapRows: rows
        .filter((r) => r.coverageStatus === "unsupported" && r.symptom.id === "door-will-not-close")
        .map((r) => ({
          rowId: r.rowId,
          model: r.appliance.modelFamily,
          brand: r.appliance.brand,
          category: r.appliance.category,
          gaps: r.unresolvedGaps,
        })),
    },
    null,
    2,
  ) + "\n",
);

const priority = rows.filter(
  (r) => r.coverageStatus === "candidate" && r.roster === "existing-131",
);
const gaps = rows.filter((r) => r.coverageStatus === "unsupported");
const additionsRows = rows.filter(
  (r) => r.roster === "recommended-addition" && r.coverageStatus === "candidate",
);
const sourceList = Object.values(sources).sort((a, b) => a.id.localeCompare(b.id));
const md = `# Clunk appliance diagnostic evidence reconnaissance\n\nVerified ${VERIFIED_ON}. This is research documentation only; no product code was changed.\n\n## Technical summary\n\nThe audit covers all ${counts.rows} model × symptom rows: 393 for Clunk's 131-model catalog and 24 for eight recommended additions. Of the 262 missing rows in the existing roster, ${counts.existingRosterMissingOnly["guided-checks"] ?? 0} have enough primary evidence for a conservative guided-checks candidate and ${counts.existingRosterMissingOnly.unsupported ?? 0} remain unsupported. No new row is purchase-ready because this pass did not establish symptom-specific complete-code-to-part compatibility and separate commerce evidence.\n\n## Definitions and denominator\n\n- “Missing” means the Cartesian gap between each model and Clunk's three current symptom IDs.\n- “Candidate” means brand/category/topology evidence supports only the listed homeowner-observable checks.\n- “Unsupported” includes both true topology/semantic mismatches and applicable-looking rows whose primary evidence is insufficient.\n- Model identity, symptom guidance, part compatibility, and retailer availability are four separate claims.\n\n## Counts\n\n\`\`\`json\n${JSON.stringify(counts, null, 2)}\n\`\`\`\n\n## Cohorts and model-specific exceptions\n\n${cohortDefinitions.map((c) => `### ${c.id}\n\nScope: ${c.scope}.\n\nSafe checks:\n${c.checks.map((x) => `- ${x}`).join("\n")}\n\nExclusions:\n${c.exclusions.map((x) => `- ${x}`).join("\n")}\n\nException rule: ${c.exceptionRule}`).join("\n\n")}\n\n## Prioritized implementation backlog\n\n1. Implement the refrigerator door-closure profile first: all 33 existing refrigerator families have brand-specific primary evidence, with side-by-side/French-door feature gates.\n2. Implement dishwasher door closure for the 18 evidenced GE, Whirlpool, KitchenAid, Samsung, Bosch, and Frigidaire families; keep AutoRelease/open-dry and model-prefix branches gated.\n3. Implement washer door/lid closure for the 35 evidenced LG, Samsung, Whirlpool, Maytag, Amana, and Electrolux families, split front-load from top-load copy and checks.\n4. Close the 20 applicable evidence gaps before expanding further: locate model manuals or brand-specific owner guidance for GE, Hotpoint, and Frigidaire washers and LG, Maytag, Amana, Electrolux, and Hotpoint dishwashers.\n5. Add the eight new roster models as guided-checks only after manual-level review and regression fixtures; do not promote any to purchase-ready in this batch.\n6. Treat new symptom concepts such as “fills slowly,” “rack obstructed,” or “door seal leak” as separate reviewed IDs rather than overloading Clunk's current labels.\n\n## Recommended new-model roster additions\n\n${additions.map((m) => `- **${m.brand} ${m.model}** (${m.kind}, ${m.topology}) — official identity: ${m.modelUrl}; complete-code rule: ${m.productCodePrompt}`).join("\n")}\n\nThese are high-yield current/mainstream U.S. lineup candidates, not a sales-rank claim. Each remains guided-checks only.\n\n## Explicit unsupported and evidence gaps\n\n- 156 existing-roster rows are semantic/topology non-matches: dryer/refrigerator “will not drain,” and non-refrigerator “slow water flow.”\n- ${gaps.filter((r) => r.roster === "existing-131" && r.symptom.id === "door-will-not-close").length} existing door-closure rows lack sufficiently specific brand/category evidence and remain unsupported.\n- ${gaps.filter((r) => r.roster === "recommended-addition").length} new-roster model × symptom rows remain unsupported.\n- No new exact part, verified-part-unavailable, retailer, or purchase-ready candidate was created.\n- Full unsupported rows and their exact reasons are in \`candidate-coverage.json\` and \`cohorts-and-exceptions.json\`.\n\n## Source-quality and duplicate-applicability audit\n\n- Primary manufacturer model/support pages and manuals are accepted for identity.\n- Manufacturer troubleshooting pages are accepted only for the stated brand, appliance category, topology, feature, and revision scope.\n- Authorized-parts catalogs remain acceptable only for complete-code-to-part compatibility, never for symptom guidance.\n- Retailer and Shopify evidence is commerce-only and cannot create compatibility.\n- Reused source IDs are deduplicated in the source registry. Every reuse is confined to the source's explicit brand/category cohort; no cross-brand troubleshooting source is used.\n- Feature branches (AutoRelease/open-dry, French-door mullion, model-prefix rack notes, error-code variants) are recorded as exceptions and require exact-model/manual confirmation.\n\n## Exact source ledger\n\n${sourceList.map((s) => `- **${s.id}** — ${s.title}. Publisher: ${s.publisher}. Applies to: ${s.appliesTo}. Quality: ${s.quality}. Verified: ${s.verifiedOn}. ${s.url}`).join("\n")}\n\n## Files and reproducibility\n\n- \`candidate-coverage.json\`: canonical machine-readable matrix with full model, symptom, evidence, checks, safety boundaries, profiles, tiers, part evidence, verification dates, and gaps.\n- \`candidate-coverage.csv\`: flat index for filtering and pivoting.\n- \`cohorts-and-exceptions.json\`: reusable cohort definitions and applicable-looking unsupported rows.\n- \`counts.json\`: frozen aggregate counts.\n- \`build-evidence-recon.ts\`: deterministic generator importing the current catalog without modifying it.\n\n## Limitations and next verification steps\n\nThe reconnaissance verifies source identity and applicability, not physical repair outcomes. Manufacturer pages can change. Before product implementation, re-open each reused source, review the exact model manual for feature branches, add schema/runtime support for \`unsupported\` research rows outside the production capability enum, and rerun URL/content checks.\n`;
const shopifyAuditAddendum = `\n## Shopify Global Catalog existence audit\n\nA separate live, credential-free, no-store UCP pass re-queried all 17 unique exact SKUs already supporting Clunk's 25 purchase-ready model rows. All 17 were present in Shopify Global Catalog and all 17 returned at least one available exact-SKU listing on ${VERIFIED_ON}; neighboring part numbers were excluded. This is the SKU-level commerce criterion for this reconnaissance. Catalog presence remains independent of manufacturer or authorized-parts compatibility evidence.\n\nShopify documents WebMCP tools on every Liquid storefront and Hydrogen developer-preview storefront, with current agent support limited to Chromium-based browsers. Therefore this pass does not require a completed checkout transaction per SKU; the platform supplies the storefront search, cart, and navigation path after catalog discovery.\n\nSupporting files:\n\n- \`shopify-global-catalog-audit.json\`: machine-readable exact-SKU presence results.\n- \`shopify-global-catalog-audit.md\`: human-readable live catalog audit and agentic-commerce boundary.\n- \`audit-shopify-global-catalog.ts\`: reproducible no-store UCP audit that persists aggregate observations only.\n`;

await Bun.write(`${outDir}evidence-ledger.md`, `${md}${shopifyAuditAddendum}`);
console.log(JSON.stringify(counts, null, 2));
