import type { ApplianceCatalogEntry, BrandName, SourceReference } from "@/domain/types";

const VERIFIED_ON = "2026-08-26";

function source(
  id: string,
  kind: SourceReference["kind"],
  title: string,
  url: string,
  publisher: string,
  appliesTo: string,
): SourceReference {
  return { id, kind, title, url, publisher, appliesTo, lastVerified: VERIFIED_ON };
}

const help = {
  lgDrain: source(
    "lg-no-drain",
    "manufacturer-troubleshooting",
    "LG washer: water not draining",
    "https://www.lg.com/us/support/help-library/lg-washing-machine-water-not-draining--20154726902590",
    "LG",
    "LG front-load washers",
  ),
  lgFilter: source(
    "lg-filter",
    "manufacturer-troubleshooting",
    "LG drain-pump filter cleaning",
    "https://www.lg.com/us/support/help-library/lg-washer-how-to-clean-the-drain-pump-filter--20150206838321",
    "LG",
    "LG front-load washers with user-accessible filters",
  ),
  samsungDrain: source(
    "samsung-no-drain",
    "manufacturer-troubleshooting",
    "Samsung washing machine will not drain",
    "https://www.samsung.com/us/support/troubleshoot/TSG10007110/",
    "Samsung",
    "Samsung front-load washers",
  ),
  samsungFilter: source(
    "samsung-filter",
    "manufacturer-troubleshooting",
    "Samsung washer pump-filter cleaning",
    "https://www.samsung.com/us/support/answer/ANS10003197/",
    "Samsung",
    "Samsung front-load washers with user-accessible filters",
  ),
  geSupport: source(
    "ge-guidance",
    "manufacturer-troubleshooting",
    "GE front-load washer owner guidance",
    "https://www.geappliances.com/ge/service-and-support/",
    "GE Appliances",
    "GE front-load washers",
  ),
  whirlpoolDrain: source(
    "whirlpool-no-drain",
    "manufacturer-troubleshooting",
    "Whirlpool front-load washer not draining",
    "https://producthelp.whirlpool.com/Laundry/Washers/Front_Load_Washers/Cycle_Concerns/Not_Draining/Not_Draining_-_Front_Load_Washer",
    "Whirlpool",
    "Whirlpool front-load washers",
  ),
  whirlpoolFilter: source(
    "whirlpool-filter",
    "manufacturer-troubleshooting",
    "Whirlpool front-load pump-filter cleaning",
    "https://producthelp.whirlpool.com/Laundry/Washers/Product_Info/Washer_Cleaning_and_Care/Cleaning_the_Pump_Filter_-_Front_Load_Washer",
    "Whirlpool",
    "Models whose owner manual confirms filter access",
  ),
  maytagDrain: source(
    "maytag-no-drain",
    "manufacturer-troubleshooting",
    "Maytag front-load washer not draining",
    "https://producthelp.maytag.com/Laundry/Washers/Front_Load_Washers/Cycle_Concerns/Not_Draining/Not_Draining_-_Front_Load_Washer",
    "Maytag",
    "Maytag front-load washers",
  ),
  maytagFilter: source(
    "maytag-filter",
    "manufacturer-troubleshooting",
    "Maytag front-load pump-filter cleaning",
    "https://producthelp.maytag.com/Laundry/Washers/Product_Info/Washer_Cleaning_and_Care/Cleaning_the_Pump_Filter_-_Front_Load_Washer",
    "Maytag",
    "Models whose owner manual confirms filter access",
  ),
  electroluxDrain: source(
    "electrolux-e21",
    "manufacturer-troubleshooting",
    "Electrolux E21 long pump-out guidance",
    "https://owner.electrolux.com/support-articles/article/1820072-laundry-front-loading-washer-displaying-error-code-e21-long-pump-out-time-",
    "Electrolux",
    "Electrolux front-load washers",
  ),
};

const lgPumpSource = source(
  "lg-aha75693425",
  "manufacturer-part",
  "LG washer drain-pump replacement",
  "https://www.lg.com/us/appliances-accessories/lg-5859e1004g-washer-drain-pump/",
  "LG",
  "WM3400CW.ABWEVUS",
);
const samsungPumpSource = source(
  "samsung-dc97-20621a",
  "authorized-parts",
  "Samsung DC97-20621A compatible-model listing",
  "https://encompass.com/item/11667691/Samsung/DC97-20621A/",
  "Encompass",
  "WF45T6000AW/A5 and WF45B6300AW/US",
);

interface EntryInput {
  id: string;
  brand: BrandName;
  model: string;
  label: string;
  aliases: string[];
  verifiedProductCodes?: string[];
  productCodePrompt: string;
  topology: ApplianceCatalogEntry["topology"];
  checkProfile: ApplianceCatalogEntry["checkProfile"];
  modelUrl: string;
  troubleshootingSources: SourceReference[];
  exactPart?: ApplianceCatalogEntry["exactPart"];
}

function entry(input: EntryInput): ApplianceCatalogEntry {
  const { modelUrl, exactPart, ...rest } = input;
  return {
    ...rest,
    verifiedProductCodes: input.verifiedProductCodes ?? [],
    modelSource: source(
      `${input.id}-model`,
      "manufacturer-model",
      `${input.brand} ${input.model} official support`,
      modelUrl,
      input.brand,
      input.model,
    ),
    ...(exactPart ? { exactPart } : {}),
  };
}

export const APPLIANCE_CATALOG: ApplianceCatalogEntry[] = [
  entry({
    id: "lg-wm3400cw",
    brand: "LG",
    model: "WM3400CW",
    label: "4.5 cu. ft. front-load washer",
    aliases: ["WM3400CW", "WM3400CW.ABWEVUS"],
    verifiedProductCodes: ["WM3400CW.ABWEVUS"],
    productCodePrompt: "Enter the complete suffix printed after WM3400CW (example: .ABWEVUS).",
    topology: "front-filter",
    checkProfile: "filter-access",
    modelUrl: "https://www.lg.com/us/support/product/lg-WM3400CW.ABWEVUS",
    troubleshootingSources: [help.lgDrain, help.lgFilter],
    exactPart: {
      id: "lg-aha75693425",
      componentId: "drain-pump",
      name: "Drain-pump assembly",
      sku: "AHA75693425",
      compatibleProductCodes: ["WM3400CW.ABWEVUS"],
      compatibleModel: "LG WM3400CW.ABWEVUS",
      installBoundary: "professional-only",
      source: lgPumpSource,
    },
  }),
  entry({
    id: "lg-wm4000hwa",
    brand: "LG",
    model: "WM4000HWA",
    label: "4.5 cu. ft. smart front-load washer",
    aliases: ["WM4000HWA", "WM4000HWA.ABWEUUS"],
    verifiedProductCodes: ["WM4000HWA.ABWEUUS"],
    productCodePrompt: "Enter the complete suffix printed after WM4000HWA.",
    topology: "front-filter",
    checkProfile: "filter-access",
    modelUrl: "https://www.lg.com/us/support/product/lg-WM4000HWA.ABWEUUS",
    troubleshootingSources: [help.lgDrain, help.lgFilter],
  }),
  entry({
    id: "samsung-wf45t6000aw",
    brand: "Samsung",
    model: "WF45T6000AW",
    label: "4.5 cu. ft. front-load washer",
    aliases: ["WF45T6000AW", "WF45T6000AW/A5"],
    verifiedProductCodes: ["WF45T6000AW/A5"],
    productCodePrompt: "Enter the complete model code including /A5.",
    topology: "front-filter",
    checkProfile: "filter-access",
    modelUrl:
      "https://www.samsung.com/us/home-appliances/washers/front-load/4-5-cu-ft-front-load-washer-with-vibration-reduction-technology-plus-in-white-wf45t6000aw-a5/",
    troubleshootingSources: [help.samsungDrain, help.samsungFilter],
    exactPart: {
      id: "samsung-dc97-20621a-t6000",
      componentId: "drain-pump",
      name: "Drain-pump assembly",
      sku: "DC97-20621A",
      compatibleProductCodes: ["WF45T6000AW/A5"],
      compatibleModel: "Samsung WF45T6000AW/A5",
      installBoundary: "professional-only",
      source: samsungPumpSource,
    },
  }),
  entry({
    id: "samsung-wf45b6300aw",
    brand: "Samsung",
    model: "WF45B6300AW",
    label: "4.5 cu. ft. smart front-load washer",
    aliases: ["WF45B6300AW", "WF45B6300AW/US"],
    verifiedProductCodes: ["WF45B6300AW/US"],
    productCodePrompt: "Enter the complete model code including /US.",
    topology: "front-filter",
    checkProfile: "filter-access",
    modelUrl:
      "https://www.samsung.com/us/home-appliances/washers/front-load/4-5-cu--ft--large-capacity-smart-front-load-washer-with-super-speed-wash-in-white-wf45b6300aw-us/",
    troubleshootingSources: [help.samsungDrain, help.samsungFilter],
    exactPart: {
      id: "samsung-dc97-20621a-b6300",
      componentId: "drain-pump",
      name: "Drain-pump assembly",
      sku: "DC97-20621A",
      compatibleProductCodes: ["WF45B6300AW/US"],
      compatibleModel: "Samsung WF45B6300AW/US",
      installBoundary: "professional-only",
      source: samsungPumpSource,
    },
  }),
  entry({
    id: "ge-gfw550ssnww",
    brand: "GE",
    model: "GFW550SSNWW",
    label: "4.8 cu. ft. smart front-load washer",
    aliases: ["GFW550SSNWW"],
    productCodePrompt: "Enter the full engineering revision from the rating label.",
    topology: "front-filter",
    checkProfile: "filter-access",
    modelUrl: "https://products.geappliances.com/appliance/gea-specs/GFW550SSNWW/support",
    troubleshootingSources: [help.geSupport],
  }),
  entry({
    id: "ge-gfw650ssnww",
    brand: "GE",
    model: "GFW650SSNWW",
    label: "4.8 cu. ft. smart front-load washer",
    aliases: ["GFW650SSNWW"],
    productCodePrompt: "Enter the full engineering revision from the rating label.",
    topology: "front-filter",
    checkProfile: "filter-access",
    modelUrl: "https://products.geappliances.com/appliance/gea-specs/GFW650SSNWW/support",
    troubleshootingSources: [help.geSupport],
  }),
  entry({
    id: "whirlpool-wfw5605mw",
    brand: "Whirlpool",
    model: "WFW5605MW",
    label: "4.5 cu. ft. front-load washer",
    aliases: ["WFW5605MW"],
    productCodePrompt: "Enter the engineering revision printed after the model number.",
    topology: "drawer-filter",
    checkProfile: "filter-access",
    modelUrl: "https://www.whirlpool.com/owners-center-pdp.WFW5605MW.html",
    troubleshootingSources: [help.whirlpoolDrain, help.whirlpoolFilter],
  }),
  entry({
    id: "whirlpool-wfw6620hw",
    brand: "Whirlpool",
    model: "WFW6620HW",
    label: "4.5 cu. ft. closet-depth front-load washer",
    aliases: ["WFW6620HW"],
    productCodePrompt: "Enter the engineering revision printed after the model number.",
    topology: "drawer-filter",
    checkProfile: "filter-access",
    modelUrl: "https://www.whirlpool.com/owners-center-pdp.WFW6620HW.html",
    troubleshootingSources: [help.whirlpoolDrain, help.whirlpoolFilter],
  }),
  entry({
    id: "maytag-mhw5630hw",
    brand: "Maytag",
    model: "MHW5630HW",
    label: "4.5 cu. ft. front-load washer",
    aliases: ["MHW5630HW"],
    productCodePrompt: "Enter the engineering revision printed after the model number.",
    topology: "drawer-filter",
    checkProfile: "filter-access",
    modelUrl: "https://www.maytag.com/owners-center-pdp.MHW5630HW.html",
    troubleshootingSources: [help.maytagDrain, help.maytagFilter],
  }),
  entry({
    id: "maytag-mhw6630hw",
    brand: "Maytag",
    model: "MHW6630HW",
    label: "4.8 cu. ft. front-load washer",
    aliases: ["MHW6630HW"],
    productCodePrompt: "Enter the engineering revision printed after the model number.",
    topology: "drawer-filter",
    checkProfile: "filter-access",
    modelUrl: "https://www.maytag.com/owners-center-pdp.MHW6630HW.html",
    troubleshootingSources: [help.maytagDrain, help.maytagFilter],
  }),
  entry({
    id: "electrolux-elfw7537at",
    brand: "Electrolux",
    model: "ELFW7537AT",
    label: "4.5 cu. ft. front-load washer",
    aliases: ["ELFW7537AT"],
    productCodePrompt: "Enter the complete product number from the rating label.",
    topology: "hose-only",
    checkProfile: "hose-then-service",
    modelUrl: "https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7537AT",
    troubleshootingSources: [help.electroluxDrain],
  }),
  entry({
    id: "electrolux-elfw7637at",
    brand: "Electrolux",
    model: "ELFW7637AT",
    label: "4.5 cu. ft. smart front-load washer",
    aliases: ["ELFW7637AT"],
    productCodePrompt: "Enter the complete product number from the rating label.",
    topology: "hose-only",
    checkProfile: "hose-then-service",
    modelUrl: "https://www.electrolux.com/en/p/laundry-care/washers/front-load-washers/ELFW7637AT",
    troubleshootingSources: [help.electroluxDrain],
  }),
];
