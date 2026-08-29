import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { format } from "prettier";

import dishwasherData from "../src/data/demoReady/dishwasherPurchaseCandidates.json";
import dryerData from "../src/data/demoReady/dryerPurchaseExpansion.json";

const VERIFIED_ON = "2026-08-29";

const publisherFor = (url: string): string => {
  const host = new URL(url).hostname;
  if (host.includes("bosch-home")) return "Bosch";
  if (host.includes("geappliance")) return "GE Appliances";
  if (host.includes("whirlpoolparts")) return "Whirlpool Parts";
  if (host.includes("maytag")) return "Maytag";
  return host;
};

type PartProfile = {
  componentId: "drain-pump" | "door-strike" | "water-filter";
  name: string;
  sku: string;
  location: string;
  installBoundary: "user-replaceable" | "professional-only";
  commerceQuery: string;
  offerCountAtVerification: number;
  identitySource: {
    id: string;
    kind: "manufacturer-part" | "authorized-parts";
    title: string;
    url: string;
    publisher: string;
    appliesTo: string;
  };
};
type PurchaseRecord = {
  modelId: string;
  exactCode: string;
  partProfile: string;
  compatibilitySources: Array<{
    id: string;
    kind: "manufacturer-part" | "authorized-parts";
    title: string;
    url: string;
    publisher: string;
    appliesTo: string;
  }>;
};

const partProfiles: Record<string, PartProfile> = {};
const records: PurchaseRecord[] = [];

for (const candidate of dishwasherData.records) {
  const profileId = `demo-dishwasher-${candidate.sku.toLowerCase()}`;
  const identityPublisher = publisherFor(candidate.partSourceUrl);
  const offerCount = candidate.shopifyOfferAudit.exactAvailableVariantCount;
  const profile: PartProfile = {
    componentId: "drain-pump",
    name: `${candidate.sku} dishwasher drain pump`,
    sku: candidate.sku,
    location: "Internal drain pump below the tub; diagnosis stops before disassembly",
    installBoundary: "professional-only",
    commerceQuery: candidate.shopifyOfferAudit.query,
    offerCountAtVerification: offerCount,
    identitySource: {
      id: `${profileId}-identity`,
      kind: candidate.partSourceUrl.includes("bosch-home")
        ? "manufacturer-part"
        : "authorized-parts",
      title: `${identityPublisher} exact part ${candidate.sku}`,
      url: candidate.partSourceUrl,
      publisher: identityPublisher,
      appliesTo: `Dishwasher drain-pump part ${candidate.sku}; exact appliance fit is established separately`,
    },
  };
  const existing = partProfiles[profileId];
  if (
    existing &&
    (existing.sku !== profile.sku || existing.identitySource.url !== profile.identitySource.url)
  )
    throw new Error(`Dishwasher profile ${profileId} is inconsistent.`);
  partProfiles[profileId] = profile;
  records.push({
    modelId: candidate.modelId,
    exactCode: candidate.exactCodeReviewed,
    partProfile: profileId,
    compatibilitySources: [
      {
        id: `${candidate.modelId}-${candidate.sku.toLowerCase()}-fit`,
        kind: candidate.compatibilitySourceUrl.includes("bosch-home")
          ? "manufacturer-part"
          : "authorized-parts",
        title: `Exact ${candidate.exactCodeReviewed} drain-pump listing`,
        url: candidate.compatibilitySourceUrl,
        publisher: publisherFor(candidate.compatibilitySourceUrl),
        appliesTo: `${candidate.exactCodeReviewed} uses exact drain-pump SKU ${candidate.sku}. ${candidate.reason}`,
      },
    ],
  });
}

for (const candidate of dryerData.records) {
  const profileId = `demo-dryer-${candidate.sku.toLowerCase()}`;
  const profile: PartProfile = {
    componentId: "door-strike",
    name: candidate.partName,
    sku: candidate.sku,
    location: candidate.location,
    installBoundary: "user-replaceable",
    commerceQuery: `${candidate.sku} dryer door strike exact SKU`,
    offerCountAtVerification: candidate.offer.observedExactOffers,
    identitySource: {
      id: `${profileId}-identity`,
      kind: "authorized-parts",
      title: `${candidate.compatibilityPublisher} exact door-side strike ${candidate.sku}`,
      url: candidate.compatibilityUrl,
      publisher: candidate.compatibilityPublisher,
      appliesTo: `Dryer door-side strike ${candidate.sku}; exact appliance fit and observation gate are established separately`,
    },
  };
  const existing = partProfiles[profileId];
  if (existing && existing.sku !== profile.sku)
    throw new Error(`Dryer profile ${profileId} is inconsistent.`);
  partProfiles[profileId] = existing ?? profile;
  records.push({
    modelId: candidate.modelId,
    exactCode: candidate.exactCode,
    partProfile: profileId,
    compatibilitySources: [
      {
        id: `${candidate.modelId}-${candidate.sku.toLowerCase()}-fit`,
        kind: "authorized-parts",
        title: `Exact ${candidate.exactCode} visible door-side strike listing`,
        url: candidate.compatibilityUrl,
        publisher: candidate.compatibilityPublisher,
        appliesTo: `${candidate.exactCode} uses visible door-side strike ${candidate.sku}. ${candidate.compatibilityEvidence}`,
      },
    ],
  });
}

partProfiles["demo-refrigerator-edr2rxd1"] = {
  componentId: "water-filter",
  name: "EveryDrop Filter 2 refrigerator water filter",
  sku: "EDR2RXD1",
  location: "Inside the fresh-food compartment; follow the exact model instructions",
  installBoundary: "user-replaceable",
  commerceQuery: "EDR2RXD1 EveryDrop refrigerator water filter exact SKU",
  offerCountAtVerification: 17,
  identitySource: {
    id: "demo-refrigerator-edr2rxd1-identity",
    kind: "manufacturer-part",
    title: "Maytag MFT2772HEZ owner page naming EveryDrop Filter 2 EDR2RXD1",
    url: "https://www.maytag.com/owners-center-pdp.MFT2772HEZ.html",
    publisher: "Maytag",
    appliesTo:
      "EveryDrop Filter 2 manufacturer part EDR2RXD1; exact revision fit is established separately",
  },
};
records.push({
  modelId: "maytag-mft2772hez",
  exactCode: "MFT2772HEZ00",
  partProfile: "demo-refrigerator-edr2rxd1",
  compatibilitySources: [
    {
      id: "maytag-mft2772hez00-edr2rxd1-fit",
      kind: "authorized-parts",
      title: "Whirlpool-authorized MFT2772HEZ00 water-filter listing",
      url: "https://www.whirlpoolparts.com/Shop-For-Parts/a4b4c43d2171289/Model-MFT2772HEZ00-Maytag-Refrigerator-Filter-Parts",
      publisher: "Whirlpool Parts",
      appliesTo: "Maytag MFT2772HEZ00 uses exact water-filter SKU EDR2RXD1",
    },
  ],
});

if (dishwasherData.records.length !== 9 || dryerData.records.length !== 7 || records.length !== 17)
  throw new Error("Demo-ready purchase candidate counts drifted from the category reviews.");
if (
  new Set(records.map((record) => record.modelId)).size !== records.length ||
  new Set(records.map((record) => record.exactCode.toUpperCase())).size !== records.length
)
  throw new Error("Demo-ready purchase expansion contains duplicate identities or exact codes.");
for (const record of records) {
  const profile = partProfiles[record.partProfile];
  if (!profile || profile.offerCountAtVerification < 1)
    throw new Error(`Purchase record ${record.modelId} lacks a separately observed offer.`);
  if (!record.compatibilitySources.every((source) => source.appliesTo.includes(record.exactCode)))
    throw new Error(`Purchase record ${record.modelId} lacks exact-code fit evidence.`);
}

const output = {
  schemaVersion: 1,
  verifiedOn: VERIFIED_ON,
  expectedCounts: { dishwasher: 9, dryer: 7, refrigerator: 1, total: 17 },
  partProfiles,
  records,
  limitations: [
    "Shopify Global Catalog results establish only a separately observed exact-SKU seller offer, never appliance fit.",
    "Every purchase row requires a complete product revision mapped to one exact manufacturer SKU by primary or authorized evidence.",
    "Dishwasher pump replacement remains professional-only.",
    "Dryer parts unlock only for the broken, bent, or missing visible door-side strike branch; cabinet catches, hinges, alignment, and switches are excluded.",
    "All category-review blockers remain guided-only and cannot inherit a neighboring revision's part.",
  ],
};

await writeFile(
  resolve("src/data/demoReadyPurchaseExpansion.json"),
  await format(JSON.stringify(output), { parser: "json", printWidth: 100 }),
  "utf8",
);
console.log(`Wrote ${records.length} defensible demo-ready purchase records.`);
