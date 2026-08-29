import purchaseData from "./demoReadyPurchaseExpansion.json";

import { DEFAULT_SYMPTOM_BY_KIND } from "@/data/symptomCatalog";
import type { ApplianceCatalogEntry, RepairPackPart, SourceReference } from "@/domain/types";
import { isSafePublicHttpsUrl } from "@/domain/urlSafety";

type EvidenceSource = Omit<SourceReference, "lastVerified"> & {
  kind: "manufacturer-part" | "authorized-parts";
};
type PartProfile = {
  componentId: string;
  name: string;
  sku: string;
  location: string;
  installBoundary: RepairPackPart["installBoundary"];
  commerceQuery: string;
  offerCountAtVerification: number;
  identitySource: EvidenceSource;
};
type PurchaseRecord = {
  modelId: string;
  exactCode: string;
  partProfile: string;
  compatibilitySources: EvidenceSource[];
};
interface DemoReadyPurchaseData {
  schemaVersion: number;
  verifiedOn: string;
  expectedCounts: { dishwasher: number; dryer: number; refrigerator: number; total: number };
  partProfiles: Record<string, PartProfile>;
  records: PurchaseRecord[];
  limitations: string[];
}

const ALLOWED_HOSTS = [
  "bosch-home.com",
  "geapplianceparts.com",
  "encompass.com",
  "maytag.com",
  "whirlpool.com",
  "whirlpoolparts.com",
];
const COMPONENT_BY_KIND = {
  dishwasher: "drain-pump",
  dryer: "door-strike",
  refrigerator: "water-filter",
} as const;

function hasExactToken(value: string, token: string): boolean {
  const characters = token.toUpperCase().match(/[A-Z0-9]/g) ?? [];
  if (!characters.length) return false;
  return new RegExp(`(?:^|[^A-Z0-9])${characters.join("[^A-Z0-9]*")}(?:$|[^A-Z0-9])`, "i").test(
    value,
  );
}

function normalizedEvidenceCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function assertSource(source: EvidenceSource, label: string): void {
  if (!isSafePublicHttpsUrl(source.url)) throw new Error(`${label} has an unsafe source URL.`);
  const hostname = new URL(source.url).hostname.toLowerCase();
  if (
    !source.id.trim() ||
    !source.title.trim() ||
    !source.publisher.trim() ||
    !source.appliesTo.trim() ||
    !ALLOWED_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
  )
    throw new Error(`${label} has invalid primary or authorized evidence.`);
}

export function assertDemoReadyPurchaseData(
  value: DemoReadyPurchaseData,
  entries: ApplianceCatalogEntry[],
): DemoReadyPurchaseData {
  if (value.schemaVersion !== 1 || value.verifiedOn !== "2026-08-29")
    throw new Error("Demo-ready purchase expansion requires the reviewed schema and date.");
  if (value.records.length !== value.expectedCounts.total || value.limitations.length < 5)
    throw new Error("Demo-ready purchase expansion has incomplete counts or limitations.");
  const models = new Set<string>();
  const exactCodes = new Set<string>();
  const counts = { dishwasher: 0, dryer: 0, refrigerator: 0 };
  for (const [profileId, profile] of Object.entries(value.partProfiles)) {
    if (
      !profileId ||
      !profile.componentId.trim() ||
      !profile.name.trim() ||
      !profile.sku.trim() ||
      !profile.location.trim() ||
      !hasExactToken(profile.commerceQuery, profile.sku) ||
      !Number.isInteger(profile.offerCountAtVerification) ||
      profile.offerCountAtVerification < 1
    )
      throw new Error(`Demo-ready part profile ${profileId} is incomplete.`);
    assertSource(profile.identitySource, `Demo-ready part profile ${profileId}`);
    if (
      !hasExactToken(
        [
          profile.identitySource.title,
          profile.identitySource.url,
          profile.identitySource.appliesTo,
        ].join(" "),
        profile.sku,
      )
    )
      throw new Error(`Demo-ready part profile ${profileId} lacks exact-SKU identity evidence.`);
  }
  for (const record of value.records) {
    const entry = entries.find((item) => item.id === record.modelId);
    const profile = value.partProfiles[record.partProfile];
    const normalizedCode = record.exactCode.toUpperCase();
    if (!entry || !(entry.kind in COMPONENT_BY_KIND))
      throw new Error(`Demo-ready purchase model ${record.modelId} is unknown or out of scope.`);
    if (
      normalizedCode.length < 6 ||
      normalizedEvidenceCode(entry.model).slice(0, 6) !==
        normalizedEvidenceCode(record.exactCode).slice(0, 6)
    )
      throw new Error(
        `Demo-ready purchase model ${record.modelId} has an exact code outside its catalog identity.`,
      );
    if (models.has(record.modelId) || exactCodes.has(normalizedCode))
      throw new Error(`Demo-ready purchase model or code is duplicated: ${record.modelId}.`);
    models.add(record.modelId);
    exactCodes.add(normalizedCode);
    counts[entry.kind as keyof typeof counts] += 1;
    const defaultCoverage = entry.symptomCoverage.find(
      (coverage) => coverage.symptomId === DEFAULT_SYMPTOM_BY_KIND[entry.kind],
    );
    if (!defaultCoverage || defaultCoverage.capability !== "guided-checks")
      throw new Error(`Demo-ready purchase model ${record.modelId} is not guided-only.`);
    if (!profile || profile.componentId !== COMPONENT_BY_KIND[entry.kind as keyof typeof counts])
      throw new Error(`Demo-ready purchase model ${record.modelId} has a wrong-category part.`);
    if (!record.compatibilitySources.length)
      throw new Error(`Demo-ready purchase model ${record.modelId} lacks compatibility evidence.`);
    for (const source of record.compatibilitySources) {
      assertSource(source, `Demo-ready purchase model ${record.modelId}`);
      if (
        !hasExactToken(source.appliesTo, record.exactCode) ||
        !hasExactToken(source.appliesTo, profile.sku)
      )
        throw new Error(
          `Demo-ready purchase model ${record.modelId} lacks exact revision-to-SKU evidence.`,
        );
    }
  }
  if (
    counts.dishwasher !== value.expectedCounts.dishwasher ||
    counts.dryer !== value.expectedCounts.dryer ||
    counts.refrigerator !== value.expectedCounts.refrigerator
  )
    throw new Error(`Demo-ready purchase category counts drifted: ${JSON.stringify(counts)}.`);
  return value;
}

const data = purchaseData as DemoReadyPurchaseData;
const datedSource = (source: EvidenceSource): SourceReference => ({
  ...source,
  lastVerified: data.verifiedOn,
});

export function applyDemoReadyPurchaseExpansion(
  entries: ApplianceCatalogEntry[],
): ApplianceCatalogEntry[] {
  assertDemoReadyPurchaseData(data, entries);
  const records = new Map(data.records.map((record) => [record.modelId, record]));
  return entries.map((entry) => {
    const record = records.get(entry.id);
    if (!record) return entry;
    const profile = data.partProfiles[record.partProfile]!;
    const part: RepairPackPart = {
      id: `${entry.id}-${profile.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      componentId: profile.componentId,
      name: profile.name,
      sku: profile.sku,
      compatibleProductCodes: [record.exactCode],
      compatibleModel: `${entry.brand} ${record.exactCode}`,
      location: profile.location,
      installBoundary: profile.installBoundary,
      source: datedSource(record.compatibilitySources[0]!),
      corroboratingSources: [
        ...record.compatibilitySources.slice(1).map(datedSource),
        datedSource(profile.identitySource),
      ],
      commerce: {
        provider: "shopify-global-catalog",
        protocol: "UCP",
        query: profile.commerceQuery,
        exactSku: profile.sku,
        offerCountAtVerification: profile.offerCountAtVerification,
        lastVerified: data.verifiedOn,
      },
    };
    return {
      ...entry,
      aliases: [...new Set([...entry.aliases, record.exactCode])],
      verifiedProductCodes: [...new Set([...entry.verifiedProductCodes, record.exactCode])],
      symptomCoverage: entry.symptomCoverage.map((coverage) =>
        coverage.symptomId === DEFAULT_SYMPTOM_BY_KIND[entry.kind]
          ? {
              ...coverage,
              capability: "purchase-ready",
              exactPartEvidence: { part, verifiedProductCodes: [record.exactCode] },
            }
          : coverage,
      ),
    };
  });
}

export const DEMO_READY_PURCHASE_RECORDS = data.records;
export const DEMO_READY_PURCHASE_PROFILES = data.partProfiles;
export const DEMO_READY_PURCHASE_VERIFIED_ON = data.verifiedOn;
