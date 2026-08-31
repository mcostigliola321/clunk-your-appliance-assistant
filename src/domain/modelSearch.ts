import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import type {
  ApplianceCatalogEntry,
  ApplianceKind,
  BrandName,
  CapabilityTier,
} from "@/domain/types";

export type ModelQueryStatus =
  "empty" | "serial-number" | "exact-code" | "exact-family" | "partial" | "unsupported";

export interface CatalogSearchAnalysis {
  status: ModelQueryStatus;
  normalizedQuery: string;
  matches: ApplianceCatalogEntry[];
  exactEntryId: string | null;
  needsCompleteCode: boolean;
  variantAmbiguity: boolean;
  candidateProductCodes: string[];
  guidance: string;
}

const SERIAL_LABEL =
  /(?:^|\s)(?:serial(?:\s*(?:number|no\.?|#))?|s\s*\/\s*n|ser[.:#])(?:\s|:|#|-)/i;

export function normalizeModel(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isExplicitSerialNumber(value: string): boolean {
  return SERIAL_LABEL.test(value.trim());
}

function searchValues(entry: ApplianceCatalogEntry): string[] {
  return [...new Set([entry.model, ...entry.aliases, ...entry.verifiedProductCodes])].map(
    normalizeModel,
  );
}

function rankEntry(entry: ApplianceCatalogEntry, needle: string): number | null {
  if (!needle) return 10;
  const brand = normalizeModel(entry.brand);
  const model = normalizeModel(entry.model);
  const values = searchValues(entry);
  if (entry.verifiedProductCodes.some((code) => normalizeModel(code) === needle)) return 0;
  if (values.includes(needle)) return 1;
  if (model.startsWith(needle) || values.some((value) => value.startsWith(needle))) return 2;
  if (model.includes(needle) || values.some((value) => value.includes(needle))) return 3;
  if (brand.startsWith(needle) || brand.includes(needle)) return 4;
  return null;
}

export function searchCatalog(
  query = "",
  brand?: BrandName | null,
  kind?: ApplianceKind | null,
): ApplianceCatalogEntry[] {
  if (isExplicitSerialNumber(query)) return [];
  const needle = normalizeModel(query);
  return APPLIANCE_CATALOG.map((entry, index) => ({
    entry,
    index,
    rank: rankEntry(entry, needle),
  }))
    .filter(
      (item): item is { entry: ApplianceCatalogEntry; index: number; rank: number } =>
        item.rank !== null &&
        (!brand || item.entry.brand === brand) &&
        (!kind || item.entry.kind === kind),
    )
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map((item) => item.entry);
}

export function analyzeModelQuery(
  query = "",
  brand?: BrandName | null,
  kind?: ApplianceKind | null,
): CatalogSearchAnalysis {
  const normalizedQuery = normalizeModel(query);
  if (isExplicitSerialNumber(query)) {
    return {
      status: "serial-number",
      normalizedQuery,
      matches: [],
      exactEntryId: null,
      needsCompleteCode: true,
      variantAmbiguity: false,
      candidateProductCodes: [],
      guidance:
        "That text is labeled as a serial number. Use the value beside Model, Model No., E-Nr, or Product Code instead.",
    };
  }

  const matches = searchCatalog(query, brand, kind);
  if (!normalizedQuery) {
    return {
      status: "empty",
      normalizedQuery,
      matches,
      exactEntryId: null,
      needsCompleteCode: false,
      variantAmbiguity: false,
      candidateProductCodes: [],
      guidance: "Enter any part of the model number, including punctuation if it is shown.",
    };
  }

  const exactCodeEntries = matches.filter((entry) =>
    entry.verifiedProductCodes.some((code) => normalizeModel(code) === normalizedQuery),
  );
  if (exactCodeEntries.length === 1) {
    const entry = exactCodeEntries[0]!;
    return {
      status: "exact-code",
      normalizedQuery,
      matches,
      exactEntryId: entry.id,
      needsCompleteCode: false,
      variantAmbiguity: false,
      candidateProductCodes: entry.verifiedProductCodes,
      guidance: `Exact model number found for ${entry.brand} ${entry.model}.`,
    };
  }

  const exactFamilyEntries = matches.filter((entry) =>
    [entry.model, ...entry.aliases].some((value) => normalizeModel(value) === normalizedQuery),
  );
  if (exactFamilyEntries.length === 1) {
    const entry = exactFamilyEntries[0]!;
    const candidateProductCodes = entry.verifiedProductCodes.filter(
      (code) => normalizeModel(code) !== normalizedQuery,
    );
    return {
      status: "exact-family",
      normalizedQuery,
      matches,
      exactEntryId: entry.id,
      needsCompleteCode: true,
      variantAmbiguity: candidateProductCodes.length > 1,
      candidateProductCodes,
      guidance: candidateProductCodes.length
        ? `${entry.brand} ${entry.model} matches a model family. Check the ending on the label before choosing a part.`
        : `${entry.brand} ${entry.model} has safe checks available. Keep the complete label text handy.`,
    };
  }

  if (matches.length) {
    return {
      status: "partial",
      normalizedQuery,
      matches,
      exactEntryId: null,
      needsCompleteCode: true,
      variantAmbiguity: matches.length > 1,
      candidateProductCodes: [],
      guidance:
        matches.length === 1
          ? "One possible model found. Check every letter and number against the appliance label."
          : `${matches.length} possible models found. Choose the exact label match; Clunk will not guess the ending.`,
    };
  }

  return {
    status: "unsupported",
    normalizedQuery,
    matches: [],
    exactEntryId: null,
    needsCompleteCode: true,
    variantAmbiguity: false,
    candidateProductCodes: [],
    guidance:
      "No supported model matches that text. Recheck O versus 0 and I versus 1, then try the complete model value—not the serial number.",
  };
}

export function capabilityLabel(capability: CapabilityTier): string {
  if (capability === "purchase-ready") return "Exact part available";
  if (capability === "verified-part-unavailable") return "Exact part currently unavailable";
  return "Safe checks available";
}
