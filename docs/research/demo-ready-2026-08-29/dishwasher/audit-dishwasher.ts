import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { APPLIANCE_CATALOG } from "../../../../src/data/applianceCatalog";
import { hasExactPartNumber } from "../../../../src/domain/shopifyCatalog";

const VERIFIED_ON = "2026-08-29";
const OUTPUT_DIR = dirname(fileURLToPath(import.meta.url));
const IMPLEMENTATION_DIR = join(OUTPUT_DIR, "../../../../src/data/demoReady");
const SHOPIFY_ENDPOINT = "https://catalog.shopify.com/api/ucp/mcp";
const SHOPIFY_PROFILE =
  "https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json";
const ALL_SYMPTOMS = [
  "will-not-drain",
  "door-will-not-close",
  "not-cleaning",
  "will-not-fill",
  "is-leaking",
] as const;

type SymptomId = (typeof ALL_SYMPTOMS)[number];

const SOURCES = {
  "samsung-cleaning": {
    title: "Dishwasher cycle ends before dishes are clean",
    publisher: "Samsung",
    url: "https://www.samsung.com/us/support/troubleshoot/TSG10000118/",
    appliesTo: "Samsung dishwashers",
  },
  "samsung-fill": {
    title: "Samsung dishwasher water-supply error guidance",
    publisher: "Samsung",
    url: "https://www.samsung.com/us/support/troubleshoot/TSG10004499/",
    appliesTo: "Samsung dishwashers reporting a water-supply error",
  },
  "samsung-leak": {
    title: "Samsung dishwasher leak guidance",
    publisher: "Samsung",
    url: "https://www.samsung.com/us/support/troubleshoot/TSG10010593/",
    appliesTo: "Samsung dishwashers",
  },
  "kitchenaid-cleaning": {
    title: "Dishes are not clean",
    publisher: "KitchenAid",
    url: "https://producthelp.kitchenaid.com/Dishwashers/Dishwasher/Wash_Performance/None_of_the_Dishes_are_Clean/Dishes_are_not_Clean",
    appliesTo: "KitchenAid dishwashers",
  },
  "kitchenaid-fill": {
    title: "Dishwasher not filling with water",
    publisher: "KitchenAid",
    url: "https://producthelp.kitchenaid.com/Dishwashers/Dishwasher/Cycle_Concerns/Not_Filling%2F%2FNo_Water/Not_Filling_With_Water_-_Dishwasher",
    appliesTo: "KitchenAid dishwashers",
  },
  "kitchenaid-leak": {
    title: "Dishwasher leaking from door",
    publisher: "KitchenAid",
    url: "https://producthelp.kitchenaid.com/Dishwashers/Dishwasher/Leaking/Front%2F%2FDoor/Leaking_from_Door",
    appliesTo: "KitchenAid dishwashers",
  },
  "maytag-cleaning": {
    title: "Dishes are not clean",
    publisher: "Maytag",
    url: "https://producthelp.maytag.com/Dishwashers/Dishwasher/Wash_Performance/None_of_the_Dishes_are_Clean/Dishes_are_not_Clean",
    appliesTo: "Maytag dishwashers",
  },
  "maytag-fill": {
    title: "Dishwasher not filling with water",
    publisher: "Maytag",
    url: "https://producthelp.maytag.com/Dishwashers/Dishwasher/Cycle_Concerns/Not_Filling%2F%2FNo_Water/Not_Filling_With_Water_-_Dishwasher",
    appliesTo: "Maytag dishwashers",
  },
  "maytag-leak": {
    title: "Dishwasher leaking from door",
    publisher: "Maytag",
    url: "https://producthelp.maytag.com/Dishwashers/Dishwasher/Leaking/Front%2F%2FDoor/Leaking_from_Door",
    appliesTo: "Maytag dishwashers",
  },
  "maytag-door": {
    title: "Dishwasher door will not close",
    publisher: "Maytag",
    url: "https://producthelp.maytag.com/Dishwashers/Dishwasher/Door_Concerns/Door_Will_Not_Close/Door_Will_Not_Close_-_Dishwasher",
    appliesTo: "Maytag dishwashers",
  },
  "amana-cleaning": {
    title: "Dishes are not clean",
    publisher: "Amana",
    url: "https://producthelp.amana.com/Dishwashers/Dishwasher/Wash_Performance/None_of_the_Dishes_are_Clean/Dishes_are_not_Clean",
    appliesTo: "Amana dishwashers",
  },
  "amana-fill": {
    title: "Dishwasher not filling with water",
    publisher: "Amana",
    url: "https://producthelp.amana.com/Dishwashers/Dishwasher/Cycle_Concerns/Not_Filling%2F%2FNo_Water/Not_Filling_With_Water_-_Dishwasher",
    appliesTo: "Amana dishwashers",
  },
  "amana-leak": {
    title: "Dishwasher leaking underneath",
    publisher: "Amana",
    url: "https://producthelp.amana.com/Dishwashers/Dishwasher/Leaking/Underneath_or_Behind/Leaking_-_Underneath_-_Dishwasher",
    appliesTo: "Amana dishwashers",
  },
  "amana-door": {
    title: "Dishwasher door will not close",
    publisher: "Amana",
    url: "https://producthelp.amana.com/Dishwashers/Dishwasher/Door_Concerns/Door_Will_Not_Close/Door_Will_Not_Close_-_Dishwasher",
    appliesTo: "Amana dishwashers",
  },
  "electrolux-cleaning": {
    title: "Dishwasher not cleaning",
    publisher: "Electrolux",
    url: "https://owner.electrolux.com/support-articles/article/1831286-dishwasher-not-cleaning",
    appliesTo: "Electrolux dishwashers",
  },
  "electrolux-fill": {
    title: "Dishwasher not filling",
    publisher: "Electrolux",
    url: "https://owner.electrolux.com/support-articles/article/1835628-dishwasher-not-filling",
    appliesTo: "Electrolux dishwashers",
  },
  "electrolux-leak": {
    title: "Dishwasher water leaking",
    publisher: "Electrolux",
    url: "https://owner.electrolux.com/support-articles/article/1838717-dishwasher-water-leaking",
    appliesTo: "Electrolux dishwashers",
  },
  "electrolux-door": {
    title: "Dishwasher error CL or Cd: door is open",
    publisher: "Electrolux",
    url: "https://owner.electrolux.com/support-articles/article/1830354-dishwasher-error-code-cl-or-cd-door-is-open",
    appliesTo: "Electrolux dishwashers that display CL or Cd",
  },
  "ge-door": {
    title: "Dishwasher door does not close properly",
    publisher: "GE Appliances",
    url: "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17529",
    appliesTo: "GE Appliances dishwashers; adjustable-rack branch is model-gated",
  },
  "whirlpool-door": {
    title: "Dishwasher door will not close",
    publisher: "Whirlpool",
    url: "https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Door_Concerns/Door_Will_Not_Close/Door_Will_Not_Close_-_Dishwasher",
    appliesTo: "Whirlpool dishwashers",
  },
  "kitchenaid-door": {
    title: "Dishwasher door will not close",
    publisher: "KitchenAid",
    url: "https://producthelp.kitchenaid.com/Dishwashers/Dishwasher/Door_Concerns/Door_Will_Not_Close/Door_Will_Not_Close_-_Dishwasher",
    appliesTo: "KitchenAid dishwashers",
  },
  "bosch-door": {
    title: "Bosch dishwasher troubleshooting",
    publisher: "Bosch",
    url: "https://www.bosch-home.com/us/owner-support/dishwashers/troubleshooting",
    appliesTo: "Bosch dishwashers; feature-specific branches are model-gated",
  },
  "lg-ldfn4542-door-manual": {
    kind: "manufacturer-manual",
    title: "LDFN4542S exact support page and owner's manual index",
    publisher: "LG",
    url: "https://www.lg.com/us/support/product/lg-LDFN4542S.ASSESNA",
    appliesTo:
      "LDFN4542S.ASSESNA only; the indexed owner's manual directs checking that the door is completely closed and latched",
  },
  "lg-ldfn3432-door-manual": {
    kind: "manufacturer-manual",
    title: "LDFN3432T exact support page and owner's manual index",
    publisher: "LG",
    url: "https://www.lg.com/us/support/product/lg-LDFN3432T",
    appliesTo:
      "LDFN3432T.ASTEEUS only; the indexed owner's manual directs checking that the door is completely closed and latched",
  },
  "lg-ldth7972-door-manual": {
    kind: "manufacturer-manual",
    title: "LDTH7972S exact support page and owner's manual index",
    publisher: "LG",
    url: "https://www.lg.com/us/support/product/lg-LDTH7972S.ASSESNA?tab=1",
    appliesTo:
      "LDTH7972S.ASSESNA only; the indexed owner's manual directs checking that the door is completely closed and latched",
  },
  "lg-ldps6762-door-manual": {
    kind: "manufacturer-manual",
    title: "LDPS6762S exact support page and owner's manual index",
    publisher: "LG",
    url: "https://www.lg.com/us/support/product/lg-LDPS6762S.ASSESNA",
    appliesTo:
      "LDPS6762S.ASSESNA only; the indexed owner's manual directs checking that the door is completely closed and latched",
  },
  "hotpoint-model-manual": {
    title: "HDF310PGRWW owner manual and support",
    publisher: "GE Appliances / Hotpoint",
    url: "https://products.geappliances.com/appliance/gea-specs/HDF310PGRWW/support",
    appliesTo: "Hotpoint HDF310PGRWW only",
  },
} as const;

const PROFILE = {
  "not-cleaning": {
    homeowner: [
      "Confirm dishes and utensils do not block spray-arm travel or the detergent dispenser.",
      "Confirm automatic-dishwasher detergent and an appropriate cycle were used.",
      "Check hot-water readiness only from normal household controls; do not adjust appliance internals.",
    ],
    professional: [
      "Circulation-pump, heater, sensor, wiring, and internal water-path diagnosis or replacement.",
    ],
    stop: ["Stop for smoke, burning odor, damaged wiring, or active leaking."],
  },
  "will-not-fill": {
    homeowner: [
      "Confirm the door is fully closed and the cycle was started normally.",
      "Confirm the household supply valve is open only when it is already visible and safely reachable.",
      "Inspect only the exposed supply hose for an obvious kink; do not move the dishwasher.",
    ],
    professional: [
      "Inlet-valve, float-switch, pressure-sensor, wiring, or concealed supply diagnosis.",
    ],
    stop: [
      "Stop for active leaking, damaged wiring, or any need to remove a panel or move the unit.",
    ],
  },
  "is-leaking": {
    homeowner: [
      "Stop the cycle and keep people clear of standing water.",
      "Check for visible oversudsing, a recent spill, loading interference, or loose debris on the visible door seal.",
      "Observe exposed under-sink connections only; do not move the appliance or tighten concealed fittings.",
    ],
    professional: [
      "Internal leak location, leveling/alignment correction, hose/valve/pump/seal replacement, and electrical inspection.",
    ],
    stop: [
      "Stop immediately for an active leak near electricity, a burning odor, or water entering cabinetry/flooring.",
    ],
  },
  "door-will-not-close": {
    homeowner: [
      "Remove visible dish, utensil, and rack obstructions and push racks fully home.",
      "Wipe loose debris from the visible seal and observe cabinet/countertop interference without loosening hardware.",
      "Close the door once gently; do not force it.",
    ],
    professional: [
      "Latch, hinge, spring, alignment, leveling, cabinetry, or installation correction.",
    ],
    stop: ["Stop if the door binds, is visibly damaged or misaligned, or requires force."],
  },
} as const;

const BROAD_MODELS = [
  "kitchenaid-kdtm404kps",
  "samsung-dw80cg4021sr",
  "amana-adb1400agw",
  "hotpoint-hdf310pgrww",
  "maytag-mdb4949skz",
  "kitchenaid-kdfe204kps",
  "samsung-dw80r2031usaa",
  "samsung-dw80b6060usaa",
  "electrolux-edsh4944as",
  "samsung-dw80cg5450sraa",
  "maytag-mdb8959skz",
  "kitchenaid-kdte204kps",
] as const;

const DOOR_MODELS = [
  "lg-ldfn4542s",
  "amana-adb1400agw",
  "hotpoint-hdf310pgrww",
  "maytag-mdb4949skz",
  "lg-ldfn3432t",
  "lg-ldth7972s",
  "electrolux-edsh4944as",
  "ge-gdp670sgvww",
  "whirlpool-wdt540hamz",
  "maytag-mdb8959skz",
  "kitchenaid-kdte204kps",
  "lg-ldps6762s",
  "bosch-shx5aem5n01",
] as const;

function broadSource(brand: string, symptom: SymptomId): keyof typeof SOURCES {
  if (brand === "Hotpoint") return "hotpoint-model-manual";
  const prefix = brand.toLowerCase();
  const suffix =
    symptom === "not-cleaning" ? "cleaning" : symptom === "will-not-fill" ? "fill" : "leak";
  const sourceId = `${prefix}-${suffix}` as keyof typeof SOURCES;
  if (!(sourceId in SOURCES)) throw new Error(`No broad source for ${brand}:${symptom}`);
  return sourceId;
}

function doorSource(brand: string, modelId: string): keyof typeof SOURCES {
  if (brand === "Hotpoint") return "hotpoint-model-manual";
  if (brand === "LG") {
    const lgSources = {
      "lg-ldfn4542s": "lg-ldfn4542-door-manual",
      "lg-ldfn3432t": "lg-ldfn3432-door-manual",
      "lg-ldth7972s": "lg-ldth7972-door-manual",
      "lg-ldps6762s": "lg-ldps6762-door-manual",
    } as const;
    const sourceId = lgSources[modelId as keyof typeof lgSources];
    if (!sourceId) throw new Error(`No exact LG door manual for ${modelId}`);
    return sourceId;
  }
  const sourceId = `${brand.toLowerCase()}-door` as keyof typeof SOURCES;
  if (!(sourceId in SOURCES)) throw new Error(`No door source for ${brand}`);
  return sourceId;
}

const dishwasher = APPLIANCE_CATALOG.filter((entry) => entry.kind === "dishwasher");
const byId = new Map(dishwasher.map((entry) => [entry.id, entry]));
const existingPairs = new Set(
  dishwasher.flatMap((entry) =>
    entry.symptomCoverage.map((route) => `${entry.id}__${route.symptomId}`),
  ),
);
const allPairs = dishwasher.flatMap((entry) =>
  ALL_SYMPTOMS.map((symptom) => `${entry.id}__${symptom}`),
);
const missingPairs = allPairs.filter((pair) => !existingPairs.has(pair)).sort();

const coverageSeeds: Array<{ modelId: string; symptomId: SymptomId }> = [
  ...BROAD_MODELS.flatMap((modelId) =>
    (["not-cleaning", "will-not-fill", "is-leaking"] as const).map((symptomId) => ({
      modelId,
      symptomId,
    })),
  ),
  ...DOOR_MODELS.map((modelId) => ({ modelId, symptomId: "door-will-not-close" as const })),
];

const coverageRecords = coverageSeeds.map(({ modelId, symptomId }) => {
  const model = byId.get(modelId);
  if (!model) throw new Error(`Unknown dishwasher model ${modelId}`);
  const sourceId =
    symptomId === "door-will-not-close"
      ? doorSource(model.brand, modelId)
      : broadSource(model.brand, symptomId);
  const applicability =
    sourceId === "hotpoint-model-manual"
      ? "Exact HDF310PGRWW owner-support/manual scope; no GE-brand neighbor transfer."
      : model.brand === "LG"
        ? `${SOURCES[sourceId].appliesTo}; only visible obstruction and gentle closure checks transfer.`
        : `${SOURCES[sourceId].appliesTo}; feature-specific branches remain gated to the exact owner manual.`;
  return {
    rowId: `${modelId}__${symptomId}`,
    modelId,
    brand: model.brand,
    modelFamily: model.model,
    symptomId,
    decision: "promotable-guided-checks",
    reason:
      "A current primary manufacturer source explicitly covers this dishwasher symptom and supports only the bounded external observations in the named safety profile.",
    sourceIds: [sourceId],
    modelEvidence: {
      url: model.modelSource?.url,
      currentlyVerifiedCodes: model.verifiedProductCodes,
      purpose: "Identity evidence only; not an exact-part claim.",
    },
    applicability,
    safetyProfileId: symptomId,
    limitations: [
      "No internal disassembly, energized testing, appliance movement, or component diagnosis.",
      "No part or purchase claim is created by this symptom evidence.",
      "If the named feature/error condition is absent, that feature-specific branch is omitted.",
    ],
    verifiedOn: VERIFIED_ON,
  };
});

const purchaseReviews = [
  {
    modelId: "bosch-shpm65z55n20",
    modelFamily: "SHPM65Z55N/20",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "SHPM65Z55N/20",
    outcome: "compatibility-promotable",
    sku: "00631200",
    compatibilitySourceUrl: "https://www.bosch-home.com/us/en/spare-parts-list/SHPM65Z55N-20",
    partSourceUrl: "https://www.bosch-home.com/us/en/product/00631200",
    reason:
      "Bosch's exact E-Nr spare-parts page places 00631200 on SHPM65Z55N/20 and Bosch identifies it as Pump-drain.",
  },
  {
    modelId: "ge-gdf670syvfs",
    modelFamily: "GDF670SYVFS",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "GDF670SYV0FS",
    outcome: "blocked",
    sku: null,
    compatibilitySourceUrl:
      "https://products.geappliances.com/appliance/gea-specs/GDF670SYVFS/support",
    partSourceUrl: "https://www.geapplianceparts.com/store/parts/Home",
    reason:
      "No current primary manufacturer page returning an exact GDF670SYV0FS drain-pump row was observed; third-party corroboration was intentionally rejected.",
  },
  {
    modelId: "kitchenaid-kdtm404kps",
    modelFamily: "KDTM404KPS",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "KDTM404KPS0",
    outcome: "compatibility-promotable",
    sku: "W11412291",
    compatibilitySourceUrl:
      "https://www.whirlpoolparts.com/Shop-For-Parts/a9b121c36d2460010/Model-KDTM404KPS0-Kitchenaid-Dishwasher-Pump-Parts",
    partSourceUrl: "https://www.whirlpoolparts.com/PartDetail/Drain-Pump/W11412291/4960707",
    reason:
      "The Whirlpool-authorized exact-model pump page returns one item explicitly titled drain pump, manufacturer number W11412291, for KDTM404KPS0.",
  },
  {
    modelId: "lg-ldfn4542s",
    modelFamily: "LDFN4542S",
    currentlyVerifiedCodes: ["LDFN4542S.ASSESNA"],
    exactCodeReviewed: "LDFN4542S.ASSESNA",
    outcome: "blocked",
    sku: null,
    compatibilitySourceUrl: "https://www.lg.com/us/support/product/lg-LDFN4542S.ASSESNA",
    partSourceUrl: "https://lgparts.com/",
    reason:
      "The exact identity is verified, but current manufacturer/authorized results do not resolve one unambiguous drain-pump SKU rather than a generic or circulation-pump assembly.",
  },
  {
    modelId: "amana-adb1400agw",
    modelFamily: "ADB1400AGW",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "ADB1400AGW0",
    outcome: "compatibility-promotable",
    sku: "W10876537",
    compatibilitySourceUrl:
      "https://www.whirlpoolparts.com/Shop-For-Parts/a9b1c36d2150695/Model-ADB1400AGW0-Amana-Dishwasher-Pump-Parts",
    partSourceUrl: "https://www.whirlpoolparts.com/PartDetail/Drain-Pump/W10876537/4454971",
    reason:
      "The Whirlpool-authorized exact-model pump page explicitly lists W10876537 as the drain pump fitting ADB1400AGW0.",
  },
  {
    modelId: "frigidaire-fdph4316as",
    modelFamily: "FDPH4316AS",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: null,
    outcome: "blocked",
    sku: null,
    compatibilitySourceUrl:
      "https://www.frigidaire.com/en/p/owner-center/product-support/FDPH4316AS",
    partSourceUrl: "https://www.frigidaireapplianceparts.com/",
    reason:
      "The family support page does not establish a complete PNC/revision, so no one-SKU compatibility claim is defensible.",
  },
  {
    modelId: "ge-gdt550pyrfs",
    modelFamily: "GDT550PYRFS",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "GDT550PYR0FS",
    outcome: "compatibility-promotable",
    sku: "WD19X25461",
    compatibilitySourceUrl:
      "https://www.geapplianceparts.com/store/parts/ModelSectionParts/GDT550PYR0FS/7/0/0/0/MOTOR%2C_SUMP_%26_FILTER_ASSEMBLY",
    partSourceUrl: "https://www.geapplianceparts.com/store/parts/spec/WD19X25461",
    reason:
      "GE's exact-revision diagram labels item 325 Drain Pump Assembly WD19X25461 for GDT550PYR0FS.",
  },
  {
    modelId: "hotpoint-hdf310pgrww",
    modelFamily: "HDF310PGRWW",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "HDF310PGR3WW",
    outcome: "compatibility-promotable",
    sku: "WD19X25461",
    compatibilitySourceUrl:
      "https://www.geapplianceparts.com/store/parts/ModelSectionParts/HDF310PGR3WW/6/0/0/0/MOTOR%2C_SUMP_%26_FILTER_ASSEMBLY",
    partSourceUrl: "https://www.geapplianceparts.com/store/parts/spec/WD19X25461",
    reason:
      "GE Appliances' exact Hotpoint revision diagram labels item 325 Drain Pump Assembly WD19X25461 for HDF310PGR3WW.",
  },
  {
    modelId: "ge-gdt225sslss",
    modelFamily: "GDT225SSLSS",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "GDT225SSL0SS",
    outcome: "compatibility-promotable",
    sku: "WD19X24651",
    compatibilitySourceUrl:
      "https://www.geapplianceparts.com/store/parts/ModelSectionParts/GDT225SSL0SS/4/0/0/0/MOTOR-PUMP_MECHANISM",
    partSourceUrl: "https://www.geapplianceparts.com/store/parts/spec/WD19X24651",
    reason:
      "GE's exact-revision diagram labels item 325 DRAIN PUMP ASM WD19X24651 for GDT225SSL0SS.",
  },
  {
    modelId: "whirlpool-wdf331pams",
    modelFamily: "WDF331PAMS",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "WDF331PAMS0",
    outcome: "compatibility-promotable",
    sku: "W10724439",
    compatibilitySourceUrl:
      "https://www.whirlpool.com/content/dam/global/documents/202210/repair-parts-list-w11637950-reva.pdf",
    partSourceUrl:
      "https://www.whirlpool.com/content/dam/global/documents/202210/repair-parts-list-w11637950-reva.pdf",
    reason:
      "Whirlpool repair-parts list W11637950 Rev. A explicitly scopes WDF331PAMS0 and names item 8 W10724439 Pump, Drain; neighboring W10876537 is not substituted.",
  },
  {
    modelId: "lg-ldfn3432t",
    modelFamily: "LDFN3432T",
    currentlyVerifiedCodes: ["LDFN3432T.ASTEEUS"],
    exactCodeReviewed: "LDFN3432T.ASTEEUS",
    outcome: "blocked",
    sku: null,
    compatibilitySourceUrl: "https://www.lg.com/us/support/product/lg-LDFN3432T",
    partSourceUrl: "https://lgparts.com/",
    reason:
      "The exact identity is verified, but current manufacturer/authorized results do not isolate one part explicitly identified as the drain pump.",
  },
  {
    modelId: "lg-ldth7972s",
    modelFamily: "LDTH7972S",
    currentlyVerifiedCodes: ["LDTH7972S.ASSESNA"],
    exactCodeReviewed: "LDTH7972S.ASSESNA",
    outcome: "blocked",
    sku: null,
    compatibilitySourceUrl: "https://www.lg.com/us/support/product/lg-LDTH7972S.ASSESNA?tab=1",
    partSourceUrl: "https://lgparts.com/",
    reason:
      "Authorized results expose generic pump assemblies without an unambiguous exact drain-pump role; the observed drain route conflicts with treating a generic pump row as sufficient.",
  },
  {
    modelId: "frigidaire-fdpc4314as",
    modelFamily: "FDPC4314AS",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: null,
    outcome: "blocked",
    sku: null,
    compatibilitySourceUrl:
      "https://www.frigidaire.com/en/p/owner-center/product-support/FDPC4314AS",
    partSourceUrl: "https://www.frigidaireapplianceparts.com/",
    reason:
      "The family support page does not establish a complete PNC/revision, so no one-SKU compatibility claim is defensible.",
  },
  {
    modelId: "electrolux-edsh4944as",
    modelFamily: "EDSH4944AS",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: null,
    outcome: "blocked",
    sku: null,
    compatibilitySourceUrl: "https://www.electrolux.com/en/p/dishwasher/EDSH4944AS",
    partSourceUrl: "https://www.electroluxapplianceparts.com/",
    reason:
      "The family product page does not establish a complete PNC/revision; a family-only part result cannot support one-SKU compatibility.",
  },
  {
    modelId: "samsung-dw80cg5450sraa",
    modelFamily: "DW80CG5450SR/AA",
    currentlyVerifiedCodes: ["DW80CG5450SR/AA"],
    exactCodeReviewed: "DW80CG5450SR/AA",
    outcome: "blocked",
    sku: null,
    compatibilitySourceUrl:
      "https://www.samsung.com/us/home-appliances/dishwashers/rotary/smart-46-dba-dishwasher-with-stormwash-in-stainless-steel-dw80cg5450sraa/",
    partSourceUrl: "https://samsungparts.com/",
    reason:
      "The exact code is verified, but current manufacturer/authorized evidence does not resolve one drain-pump SKU without ambiguous pump-role results.",
  },
  {
    modelId: "ge-gdp670sgvww",
    modelFamily: "GDP670SGVWW",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "GDP670SGV0WW",
    outcome: "blocked",
    sku: null,
    compatibilitySourceUrl:
      "https://products.geappliances.com/appliance/gea-specs/GDP670SGVWW/support",
    partSourceUrl: "https://www.geapplianceparts.com/store/parts/Home",
    reason:
      "No current primary manufacturer page returning an exact GDP670SGV0WW drain-pump row was observed; neighboring GDP models were not transferred.",
  },
  {
    modelId: "whirlpool-wdt540hamz",
    modelFamily: "WDT540HAMZ",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "WDT540HAMZ1",
    outcome: "compatibility-promotable",
    sku: "W10876537",
    compatibilitySourceUrl:
      "https://www.whirlpoolparts.com/Shop-For-Parts/a9b5c36d2467117/Model-WDT540HAMZ1-Whirlpool-Dishwasher-Pump-Parts",
    partSourceUrl: "https://www.whirlpoolparts.com/PartDetail/Drain-Pump/W10876537/4454971",
    reason:
      "The Whirlpool-authorized exact-model page explicitly lists W10876537 as the drain pump fitting WDT540HAMZ1; revision 0 is not promoted and must not inherit this result.",
  },
  {
    modelId: "maytag-mdb8959skz",
    modelFamily: "MDB8959SKZ",
    currentlyVerifiedCodes: [],
    exactCodeReviewed: "MDB8959SKZ1",
    outcome: "compatibility-promotable",
    sku: "W11497943",
    compatibilitySourceUrl:
      "https://www.whirlpoolparts.com/Shop-For-Parts/a9b4c36d2454085/Model-MDB8959SKZ1-Maytag-Dishwasher-Pump-Parts",
    partSourceUrl: "https://www.whirlpoolparts.com/PartDetail/Drain-Pump/W11497943/4960223",
    reason:
      "The Whirlpool-authorized exact-model pump page explicitly lists W11497943 as the drain pump fitting MDB8959SKZ1.",
  },
  {
    modelId: "lg-ldps6762s",
    modelFamily: "LDPS6762S",
    currentlyVerifiedCodes: ["LDPS6762S.ASSESNA"],
    exactCodeReviewed: "LDPS6762S.ASSESNA",
    outcome: "blocked",
    sku: null,
    compatibilitySourceUrl: "https://www.lg.com/us/support/product/lg-LDPS6762S.ASSESNA",
    partSourceUrl: "https://lgparts.com/",
    reason:
      "The exact identity is verified, but current manufacturer/authorized results do not isolate one part explicitly identified as the drain pump.",
  },
] as const;

function assertAudit() {
  if (dishwasher.length !== 33)
    throw new Error(`Expected 33 dishwasher identities, found ${dishwasher.length}`);
  if (allPairs.length !== 165)
    throw new Error(`Expected 165 dishwasher pairs, found ${allPairs.length}`);
  if (existingPairs.size !== 116)
    throw new Error(`Expected 116 existing pairs, found ${existingPairs.size}`);
  if (missingPairs.length !== 49) throw new Error(`Expected 49 gaps, found ${missingPairs.length}`);
  if (coverageRecords.length !== 49)
    throw new Error(`Expected 49 proposed records, found ${coverageRecords.length}`);
  const proposedPairs = coverageRecords.map((record) => record.rowId).sort();
  if (JSON.stringify(proposedPairs) !== JSON.stringify(missingPairs)) {
    throw new Error(
      "The explicit coverage decisions do not exactly match the current 49 dishwasher gaps.",
    );
  }
  if (new Set(proposedPairs).size !== proposedPairs.length)
    throw new Error("Duplicate coverage row.");
  const guidedOnly = dishwasher.filter(
    (entry) => !entry.symptomCoverage.some((route) => route.capability === "purchase-ready"),
  );
  if (guidedOnly.length !== 19)
    throw new Error(`Expected 19 guided-only identities, found ${guidedOnly.length}`);
  if (purchaseReviews.length !== 19)
    throw new Error(`Expected 19 purchase reviews, found ${purchaseReviews.length}`);
  const reviewIds = purchaseReviews.map((review) => review.modelId).sort();
  const guidedIds = guidedOnly.map((entry) => entry.id).sort();
  if (JSON.stringify(reviewIds) !== JSON.stringify(guidedIds)) {
    throw new Error(
      "Purchase reviews do not exactly match the 19 guided-only dishwasher identities.",
    );
  }
  for (const record of coverageRecords) {
    if (!record.modelEvidence.url?.startsWith("https://"))
      throw new Error(`Missing model source: ${record.rowId}`);
    if (!SOURCES[record.sourceIds[0]]) throw new Error(`Missing symptom source: ${record.rowId}`);
  }
  for (const review of purchaseReviews) {
    if (
      review.outcome === "compatibility-promotable" &&
      (!review.exactCodeReviewed || !review.sku)
    ) {
      throw new Error(`Promotable review lacks exact code/SKU: ${review.modelId}`);
    }
  }
}

async function auditUrls() {
  const urls = [...new Set(Object.values(SOURCES).map((source) => source.url))].sort();
  const results: Array<Record<string, unknown>> = [];
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: "GET", redirect: "follow" });
      results.push({ url, status: response.status, ok: response.ok, finalUrl: response.url });
    } catch (error) {
      results.push({
        url,
        status: null,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}

async function auditShopify() {
  const promotable = purchaseReviews.filter(
    (review) => review.outcome === "compatibility-promotable",
  );
  const skus = [
    ...new Set(promotable.map((review) => review.sku).filter(Boolean)),
  ].sort() as string[];
  const results: Array<Record<string, unknown>> = [];
  for (const sku of skus) {
    const query = `${sku} dishwasher drain pump exact SKU`;
    try {
      const response = await fetch(SHOPIFY_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "text/plain;charset=UTF-8" },
        cache: "no-store",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          id: 1,
          params: {
            name: "search_catalog",
            arguments: {
              meta: { "ucp-agent": { profile: SHOPIFY_PROFILE } },
              catalog: {
                query,
                filters: { available: true, ships_to: { country: "US" } },
                context: {
                  address_country: "US",
                  currency: "USD",
                  intent: `Find exact ${sku}; do not substitute`,
                },
                pagination: { limit: 20 },
                view: "offer",
              },
            },
          },
        }),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
        result?: { structuredContent?: { products?: Array<Record<string, unknown>> } };
      };
      if (!response.ok || payload.error)
        throw new Error(`HTTP ${response.status}: ${payload.error?.message ?? "request failed"}`);
      const products = payload.result?.structuredContent?.products ?? [];
      let returnedVariantCount = 0;
      let exactVariantCount = 0;
      let exactAvailableVariantCount = 0;
      let exactCheckoutUrlCount = 0;
      for (const product of products as Array<{
        title?: string;
        description?: { plain?: string; html?: string };
        variants?: Array<{
          sku?: string;
          title?: string;
          description?: { plain?: string };
          availability?: { available?: boolean };
          checkout_url?: string;
        }>;
      }>) {
        for (const variant of product.variants ?? []) {
          returnedVariantCount += 1;
          const searchable = [
            product.title,
            product.description?.plain,
            product.description?.html,
            variant.sku,
            variant.title,
            variant.description?.plain,
          ]
            .filter(Boolean)
            .join(" ");
          if (!hasExactPartNumber(searchable, sku)) continue;
          exactVariantCount += 1;
          if (variant.availability?.available === true) exactAvailableVariantCount += 1;
          if (variant.checkout_url?.startsWith("https://")) exactCheckoutUrlCount += 1;
        }
      }
      results.push({
        sku,
        status:
          exactAvailableVariantCount > 0
            ? "present-available"
            : exactVariantCount > 0
              ? "present-unavailable"
              : "not-observed",
        returnedProductCount: products.length,
        returnedVariantCount,
        exactVariantCount,
        exactAvailableVariantCount,
        exactCheckoutUrlCount,
        rejectedNeighborVariantCount: returnedVariantCount - exactVariantCount,
        query,
      });
    } catch (error) {
      results.push({
        sku,
        status: "request-error",
        query,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  return {
    auditedOn: VERIFIED_ON,
    endpoint: SHOPIFY_ENDPOINT,
    criterion:
      "Commerce candidate exists only when an available returned variant contains the exact normalized SKU. Results never establish compatibility.",
    persistenceBoundary:
      "Only aggregate counts and identifiers are retained; seller, product, price, and checkout payloads are not cached.",
    results,
  };
}

assertAudit();

const doUrls = process.argv.includes("--urls");
const doShopify = process.argv.includes("--shopify");
const urlAudit = doUrls ? await auditUrls() : [];
const shopifyAudit = doShopify
  ? await auditShopify()
  : JSON.parse(
      await readFile(join(OUTPUT_DIR, "shopify-offer-audit.json"), "utf8").catch(
        () => '{"results":[]}',
      ),
    );

const coverageArtifact = {
  schemaVersion: 1,
  verifiedOn: VERIFIED_ON,
  scope: "Dishwasher model × symptom gaps present in the 2026-08-29 baseline only.",
  rules: [
    "No evidence transfer from neighboring model, revision, brand, or corporate sibling.",
    "A manufacturer-wide troubleshooting page can support bounded external observations only when it explicitly applies to dishwashers of that brand.",
    "Model pages establish identity only unless the exact owner manual supplies the symptom instruction.",
    "All internal diagnosis, disassembly, electrical testing, appliance movement, and component replacement remain professional-only.",
    "Symptom evidence never establishes a part or purchase claim.",
  ],
  baseline: {
    identities: dishwasher.length,
    symptomRoutes: ALL_SYMPTOMS.length,
    possiblePairs: allPairs.length,
    supportedBefore: existingPairs.size,
    gapsReviewed: missingPairs.length,
    promotableGuidedCheckRows: coverageRecords.filter(
      (record) => record.decision === "promotable-guided-checks",
    ).length,
    unsupportedRows: coverageRecords.filter(
      (record) => record.decision !== "promotable-guided-checks",
    ).length,
    supportedIfIntegrated: existingPairs.size + coverageRecords.length,
  },
  sources: Object.fromEntries(
    Object.entries(SOURCES).map(([id, source]) => [
      id,
      {
        id,
        kind: "manufacturer-troubleshooting",
        quality: "primary",
        ...source,
        verifiedOn: VERIFIED_ON,
      },
    ]),
  ),
  safetyProfiles: PROFILE,
  records: coverageRecords,
};

const shopifyBySku = new Map(
  (shopifyAudit.results ?? []).map((result: { sku: string }) => [result.sku, result]),
);
const purchaseArtifact = {
  schemaVersion: 1,
  verifiedOn: VERIFIED_ON,
  scope: "All dishwasher identities that were not purchase-ready in the 2026-08-29 baseline.",
  rules: [
    "Exact complete-code/revision to one explicitly named drain-pump SKU is required before commerce search.",
    "No model-family, neighboring-revision, brand, physical-similarity, or third-party-only inference.",
    "Shopify Global Catalog is searched only after fit proof; catalog presence never proves compatibility.",
    "Installation, electrical tests, panel removal, and pump replacement remain professional-only.",
  ],
  baseline: { identities: 33, purchaseReady: 14, guidedOnlyReviewed: 19 },
  summary: {
    compatibilityPromotable: purchaseReviews.filter(
      (review) => review.outcome === "compatibility-promotable",
    ).length,
    blocked: purchaseReviews.filter((review) => review.outcome === "blocked").length,
    uniquePromotableSkus: new Set(purchaseReviews.map((review) => review.sku).filter(Boolean)).size,
    shopifyExactAvailableSkus: [...shopifyBySku.values()].filter(
      (result: Record<string, unknown>) => result.status === "present-available",
    ).length,
  },
  reviews: purchaseReviews.map((review) => ({
    ...review,
    exactRevisionOutcome:
      review.outcome === "compatibility-promotable"
        ? "Exact code may be added as a verified code only with this exact SKU mapping. Other revisions remain unverified."
        : "No complete code/SKU is promoted from this review.",
    shopifyOfferAudit: review.sku ? (shopifyBySku.get(review.sku) ?? null) : null,
    homeownerBoundary:
      "External drain-route observations only; no panel removal, energized testing, appliance movement, or pump replacement.",
    professionalOnly: "Confirm diagnosis and perform internal pump access/replacement.",
    verifiedOn: VERIFIED_ON,
  })),
};

await writeFile(
  join(OUTPUT_DIR, "model-symptom-audit.json"),
  `${JSON.stringify(coverageArtifact, null, 2)}\n`,
);
await writeFile(
  join(OUTPUT_DIR, "purchase-readiness-audit.json"),
  `${JSON.stringify(purchaseArtifact, null, 2)}\n`,
);
if (doShopify)
  await writeFile(
    join(OUTPUT_DIR, "shopify-offer-audit.json"),
    `${JSON.stringify(shopifyAudit, null, 2)}\n`,
  );
if (doUrls)
  await writeFile(
    join(OUTPUT_DIR, "source-url-audit.json"),
    `${JSON.stringify({ verifiedOn: VERIFIED_ON, results: urlAudit }, null, 2)}\n`,
  );

const csvHeader = "row_id,model_id,brand,model_family,symptom_id,decision,source_ids,reason";
const csvRows = coverageRecords.map((record) =>
  [
    record.rowId,
    record.modelId,
    record.brand,
    record.modelFamily,
    record.symptomId,
    record.decision,
    record.sourceIds.join(";"),
    record.reason,
  ]
    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
    .join(","),
);
await writeFile(
  join(OUTPUT_DIR, "model-symptom-audit.csv"),
  `${[csvHeader, ...csvRows].join("\n")}\n`,
);

await mkdir(IMPLEMENTATION_DIR, { recursive: true });
await writeFile(
  join(IMPLEMENTATION_DIR, "dishwasherSymptomCoverage.json"),
  `${JSON.stringify(coverageArtifact, null, 2)}\n`,
);
await writeFile(
  join(IMPLEMENTATION_DIR, "dishwasherPurchaseCandidates.json"),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      verifiedOn: VERIFIED_ON,
      integrationStatus: "isolated-candidates-not-wired",
      safetyBoundary:
        "Exact part display does not authorize homeowner replacement; diagnosis and internal access remain professional-only.",
      records: purchaseArtifact.reviews.filter(
        (review) => review.outcome === "compatibility-promotable",
      ),
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(
    {
      dishwasherIdentities: dishwasher.length,
      purchaseReadyBefore: 14,
      guidedOnlyBefore: 19,
      possiblePairs: allPairs.length,
      supportedPairsBefore: existingPairs.size,
      gapsReviewed: missingPairs.length,
      coveragePromotable: coverageRecords.length,
      supportedPairsIfIntegrated: existingPairs.size + coverageRecords.length,
      compatibilityPromotablePurchaseIdentities: purchaseArtifact.summary.compatibilityPromotable,
      purchaseBlockedIdentities: purchaseArtifact.summary.blocked,
      shopifyExactAvailableSkus: purchaseArtifact.summary.shopifyExactAvailableSkus,
    },
    null,
    2,
  ),
);
