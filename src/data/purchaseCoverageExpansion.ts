import purchaseCoverageData from "./purchaseCoverageExpansion.json";

import { DEFAULT_SYMPTOM_BY_KIND } from "@/data/symptomCatalog";
import type { ApplianceCatalogEntry, RepairPackPart, SourceReference } from "@/domain/types";
import { isSafePublicHttpsUrl } from "@/domain/urlSafety";

export interface EvidenceSource extends Omit<SourceReference, "lastVerified"> {
  kind: "manufacturer-part" | "authorized-parts";
}

export interface PartProfile {
  componentId: string;
  name: string;
  sku: string;
  location: string;
  installBoundary: RepairPackPart["installBoundary"];
  commerceQuery: string;
  offerCountAtVerification: number;
  identitySource: EvidenceSource;
}

export interface PurchaseCoverageRecord {
  modelId: string;
  exactCode: string;
  partProfile: string;
  compatibilitySources: EvidenceSource[];
}

export interface PurchaseCoverageData {
  schemaVersion: number;
  verifiedOn: string;
  partProfiles: Record<string, PartProfile>;
  records: PurchaseCoverageRecord[];
  limitations: string[];
}

const EVIDENCE_HOSTS = [
  "lg.com",
  "samsung.com",
  "bosch-home.com",
  "whirlpool.com",
  "whirlpoolparts.com",
  "maytag.com",
  "amana.com",
  "geappliances.com",
  "geapplianceparts.com",
  "encompass.com",
];

const REVIEWED_COMPONENT_BY_KIND = {
  dishwasher: "drain-pump",
  refrigerator: "water-filter",
} as const;

function hasExactToken(value: string, token: string): boolean {
  const characters = token.toUpperCase().match(/[A-Z0-9]/g) ?? [];
  if (characters.length === 0) return false;
  const pattern = characters.join("[^A-Z0-9]*");
  return new RegExp(`(?:^|[^A-Z0-9])${pattern}(?:$|[^A-Z0-9])`, "i").test(value);
}

function hasAllowedEvidenceHost(value: string): boolean {
  const hostname = new URL(value).hostname.toLowerCase();
  return EVIDENCE_HOSTS.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`));
}

function assertEvidenceSource(source: EvidenceSource, label: string): void {
  if (
    !source.id.trim() ||
    !source.title.trim() ||
    !source.publisher.trim() ||
    !source.appliesTo.trim() ||
    !isSafePublicHttpsUrl(source.url) ||
    !hasAllowedEvidenceHost(source.url)
  )
    throw new Error(`${label} has an invalid primary or authorized evidence source.`);
}

export function assertPurchaseCoverageExpansion(
  value: PurchaseCoverageData,
  entries: ApplianceCatalogEntry[],
): PurchaseCoverageData {
  if (value.schemaVersion !== 1)
    throw new Error("Purchase coverage expansion requires schema version 1.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.verifiedOn))
    throw new Error("Purchase coverage expansion requires an ISO verification date.");
  if (!value.limitations.length)
    throw new Error("Purchase coverage expansion must record its evidence limitations.");

  const baseEntries = new Map(entries.map((entry) => [entry.id, entry]));
  const recordIds = new Set<string>();
  const exactCodes = new Set<string>();

  for (const [profileId, profile] of Object.entries(value.partProfiles)) {
    if (
      !profileId ||
      !profile.componentId.trim() ||
      !profile.name.trim() ||
      !profile.sku.trim() ||
      !profile.location.trim() ||
      !["user-replaceable", "professional-only"].includes(profile.installBoundary) ||
      !hasExactToken(profile.commerceQuery, profile.sku) ||
      !Number.isInteger(profile.offerCountAtVerification) ||
      profile.offerCountAtVerification <= 0
    )
      throw new Error(`Purchase part profile ${profileId} is incomplete.`);
    assertEvidenceSource(profile.identitySource, `Purchase part profile ${profileId}`);
    const identityText = [
      profile.identitySource.title,
      profile.identitySource.url,
      profile.identitySource.appliesTo,
    ].join(" ");
    if (!hasExactToken(identityText, profile.sku))
      throw new Error(`Purchase part profile ${profileId} lacks exact-SKU identity evidence.`);
  }

  for (const record of value.records) {
    const entry = baseEntries.get(record.modelId);
    const profile = value.partProfiles[record.partProfile];
    const normalizedCode = record.exactCode.toUpperCase();
    if (!entry) throw new Error(`Purchase coverage model ${record.modelId} is unknown.`);
    if (recordIds.has(record.modelId) || exactCodes.has(normalizedCode))
      throw new Error(`Purchase coverage model or exact code is duplicated: ${record.modelId}.`);
    recordIds.add(record.modelId);
    exactCodes.add(normalizedCode);
    if (!(entry.kind in REVIEWED_COMPONENT_BY_KIND))
      throw new Error(`Purchase coverage model ${record.modelId} is outside the reviewed cohort.`);
    const defaultCoverage = entry.symptomCoverage.find(
      (coverage) => coverage.symptomId === DEFAULT_SYMPTOM_BY_KIND[entry.kind],
    );
    if (!defaultCoverage || defaultCoverage.capability !== "guided-checks")
      throw new Error(
        `Purchase coverage model ${record.modelId} is not a checks-only default route.`,
      );
    if (!profile)
      throw new Error(`Purchase coverage model ${record.modelId} has an unknown part profile.`);
    if (
      profile.componentId !==
      REVIEWED_COMPONENT_BY_KIND[entry.kind as keyof typeof REVIEWED_COMPONENT_BY_KIND]
    )
      throw new Error(`Purchase coverage model ${record.modelId} has a wrong-category part.`);
    if (!record.compatibilitySources.length)
      throw new Error(`Purchase coverage model ${record.modelId} lacks compatibility evidence.`);
    if (
      !entry.aliases.some((alias) => alias.toUpperCase() === normalizedCode) &&
      entry.model.toUpperCase() !== normalizedCode
    )
      throw new Error(
        `Purchase coverage model ${record.modelId} binds an unrecognized product code.`,
      );
    for (const source of record.compatibilitySources) {
      assertEvidenceSource(source, `Purchase coverage model ${record.modelId}`);
      if (!hasExactToken(source.appliesTo, record.exactCode))
        throw new Error(
          `Purchase coverage model ${record.modelId} has evidence outside its exact revision.`,
        );
    }
  }

  return value;
}

const data = purchaseCoverageData as PurchaseCoverageData;

function datedSource(source: EvidenceSource): SourceReference {
  return { ...source, lastVerified: data.verifiedOn };
}

export function applyPurchaseCoverageExpansion(
  entries: ApplianceCatalogEntry[],
): ApplianceCatalogEntry[] {
  assertPurchaseCoverageExpansion(data, entries);
  const records = new Map(data.records.map((record) => [record.modelId, record]));

  return entries.map((entry) => {
    const record = records.get(entry.id);
    if (!record) return entry;
    const profile = data.partProfiles[record.partProfile]!;
    const primarySource = datedSource(record.compatibilitySources[0]!);
    const corroboratingSources = [
      ...record.compatibilitySources.slice(1).map(datedSource),
      datedSource(profile.identitySource),
    ];
    const part: RepairPackPart = {
      id: `${entry.id}-${profile.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      componentId: profile.componentId,
      name: profile.name,
      sku: profile.sku,
      compatibleProductCodes: [record.exactCode],
      compatibleModel: `${entry.brand} ${record.exactCode}`,
      location: profile.location,
      installBoundary: profile.installBoundary,
      source: primarySource,
      corroboratingSources,
      commerce: {
        provider: "shopify-global-catalog",
        protocol: "UCP",
        query: profile.commerceQuery,
        exactSku: profile.sku,
        offerCountAtVerification: profile.offerCountAtVerification,
        lastVerified: data.verifiedOn,
      },
    };
    const verifiedProductCodes = [...new Set([...entry.verifiedProductCodes, record.exactCode])];
    const aliases = [...new Set([...entry.aliases, record.exactCode])];
    return {
      ...entry,
      aliases,
      verifiedProductCodes,
      symptomCoverage: entry.symptomCoverage.map((coverage) =>
        coverage.symptomId === DEFAULT_SYMPTOM_BY_KIND[entry.kind]
          ? {
              ...coverage,
              capability: "purchase-ready",
              exactPartEvidence: {
                part,
                verifiedProductCodes: [record.exactCode],
              },
            }
          : coverage,
      ),
    };
  });
}

export const PURCHASE_COVERAGE_EXPANSION = data;
export const PURCHASE_COVERAGE_EXPANSION_COUNT = data.records.length;
export const PURCHASE_COVERAGE_EXPANSION_VERIFIED_ON = data.verifiedOn;
