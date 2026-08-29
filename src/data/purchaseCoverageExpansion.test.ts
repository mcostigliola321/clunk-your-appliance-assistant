import { describe, expect, it } from "vitest";

import { assertCatalog, getRepairPack } from "@/domain/repairPack";
import { DEFAULT_SYMPTOM_BY_KIND } from "@/data/symptomCatalog";

import { APPLIANCE_CATALOG, PURCHASE_COVERAGE_BASE_CATALOG } from "./applianceCatalog";
import {
  assertPurchaseCoverageExpansion,
  PURCHASE_COVERAGE_EXPANSION,
  PURCHASE_COVERAGE_EXPANSION_COUNT,
  PURCHASE_COVERAGE_EXPANSION_VERIFIED_ON,
} from "./purchaseCoverageExpansion";

describe("purchase coverage expansion", () => {
  it("promotes only the 42 separately reviewed exact default-route revisions", () => {
    expect(PURCHASE_COVERAGE_EXPANSION_COUNT).toBe(42);
    expect(PURCHASE_COVERAGE_EXPANSION_VERIFIED_ON).toBe("2026-08-29");
    expect(PURCHASE_COVERAGE_EXPANSION.limitations.length).toBeGreaterThanOrEqual(4);
    expect(assertCatalog(APPLIANCE_CATALOG)).toBe(APPLIANCE_CATALOG);
    expect(APPLIANCE_CATALOG).toHaveLength(163);
    expect(new Set(APPLIANCE_CATALOG.map((entry) => entry.id))).toHaveLength(163);
    expect(
      APPLIANCE_CATALOG.filter((entry) =>
        entry.symptomCoverage.some((coverage) => coverage.capability === "purchase-ready"),
      ),
    ).toHaveLength(84);

    for (const record of PURCHASE_COVERAGE_EXPANSION.records) {
      const entry = APPLIANCE_CATALOG.find((candidate) => candidate.id === record.modelId);
      expect(entry, record.modelId).toBeDefined();
      expect(["washer", "dishwasher", "dryer", "refrigerator"], record.modelId).toContain(
        entry?.kind,
      );
      expect(entry?.aliases, record.modelId).toContain(record.exactCode);
      expect(entry?.verifiedProductCodes, record.modelId).toContain(record.exactCode);
      const coverage = entry?.symptomCoverage.find(
        (candidate) => candidate.symptomId === DEFAULT_SYMPTOM_BY_KIND[entry!.kind],
      );
      const part = coverage?.exactPartEvidence?.part;
      const profile = PURCHASE_COVERAGE_EXPANSION.partProfiles[record.partProfile]!;
      expect(coverage?.capability, record.modelId).toBe("purchase-ready");
      expect(coverage?.exactPartEvidence?.verifiedProductCodes, record.modelId).toEqual([
        record.exactCode,
      ]);
      expect(part?.compatibleProductCodes, record.modelId).toEqual([record.exactCode]);
      expect(part?.compatibleModel, record.modelId).toContain(record.exactCode);
      expect(part?.sku, record.modelId).toBe(profile.sku);
      expect(part?.source.appliesTo, record.modelId).toContain(record.exactCode);
      expect(part?.source.lastVerified, record.modelId).toBe("2026-08-29");
      expect(part?.corroboratingSources?.length, record.modelId).toBeGreaterThan(0);
      expect(part?.commerce, record.modelId).toMatchObject({
        provider: "shopify-global-catalog",
        protocol: "UCP",
        exactSku: profile.sku,
        offerCountAtVerification: profile.offerCountAtVerification,
        lastVerified: "2026-08-29",
      });

      const pack = getRepairPack(record.modelId);
      expect(pack.appliance.capability, record.modelId).toBe("purchase-ready");
      expect(pack.parts, record.modelId).toHaveLength(1);
      expect(pack.parts[0]?.sku, record.modelId).toBe(profile.sku);
      expect(pack.example?.productCode, record.modelId).toBe(record.exactCode);
      for (const nonDefault of entry?.symptomCoverage.filter(
        (candidate) => candidate.symptomId !== DEFAULT_SYMPTOM_BY_KIND[entry.kind],
      ) ?? []) {
        expect(nonDefault.exactPartEvidence, `${record.modelId}:${nonDefault.symptomId}`).toBe(
          undefined,
        );
        expect(nonDefault.capability, `${record.modelId}:${nonDefault.symptomId}`).toBe(
          "guided-checks",
        );
      }
    }
  });

  it("keeps documented ambiguous or family-only filter mappings checks-only", () => {
    const guidedOnly = [
      "ge-gfe28gynfs",
      "ge-gne29gynfs",
      "kitchenaid-krff305ess00",
      "frigidaire-frss2623as",
      "whirlpool-wrx735sdhz",
      "electrolux-ermc2295as",
    ];
    for (const id of guidedOnly) {
      const entry = APPLIANCE_CATALOG.find((candidate) => candidate.id === id);
      const coverage = entry?.symptomCoverage.find(
        (candidate) => candidate.symptomId === "slow-water-flow",
      );
      expect(coverage?.capability, id).toBe("guided-checks");
      expect(coverage?.exactPartEvidence, id).toBeUndefined();
      expect(getRepairPack(id).parts, id).toEqual([]);
    }
  });

  it("binds KDTE204KPS2 to its one exact authorized drain-pump result", () => {
    const entry = APPLIANCE_CATALOG.find((candidate) => candidate.id === "kitchenaid-kdte204kps");
    const coverage = entry?.symptomCoverage.find(
      (candidate) => candidate.symptomId === "will-not-drain",
    );
    expect(coverage?.capability).toBe("purchase-ready");
    expect(coverage?.exactPartEvidence?.verifiedProductCodes).toEqual(["KDTE204KPS2"]);
    expect(coverage?.exactPartEvidence?.part).toMatchObject({
      sku: "W11462456",
      compatibleProductCodes: ["KDTE204KPS2"],
      installBoundary: "professional-only",
      commerce: { exactSku: "W11462456", offerCountAtVerification: 5 },
    });
  });

  it("binds four Samsung washer revisions to their exact authorized drain pumps", () => {
    const exact = [
      ["samsung-wa45t3200aw", "WA45T3200AW/A4", "DC97-19289F"],
      ["samsung-wf53bb8700at", "WF53BB8700ATUS", "DC97-20621C"],
      ["samsung-wa54cg7105aw", "WA54CG7105AWUS", "DC97-22840A"],
      ["samsung-wa55cg7100aw", "WA55CG7100AWUS", "DC97-22840A"],
    ] as const;
    for (const [id, code, sku] of exact) {
      const part = getRepairPack(id).parts[0];
      expect(part?.sku, id).toBe(sku);
      expect(part?.compatibleProductCodes, id).toEqual([code]);
      expect(part?.installBoundary, id).toBe("professional-only");
      expect(part?.commerce?.offerCountAtVerification, id).toBe(5);
    }
  });

  it("keeps Samsung dryer door-side levers distinct from cabinet holders", () => {
    for (const [id, code] of [
      ["samsung-dve45t6000w", "DVE45T6000W/A3"],
      ["samsung-dve45b6300pa3", "DVE45B6300P/A3"],
    ] as const) {
      const part = getRepairPack(id).parts[0];
      expect(part?.sku, id).toBe("DC66-00814A");
      expect(part?.compatibleProductCodes, id).toEqual([code]);
      expect(part?.location, id).toContain("dryer door");
      expect(part?.installBoundary, id).toBe("professional-only");
      expect(part?.commerce?.offerCountAtVerification, id).toBe(6);
    }
  });

  it("binds two exact LG front-load revisions to their single authorized drain-pump row", () => {
    for (const [id, code] of [
      ["lg-wm6700hba", "WM6700HBA.ABLEVUS"],
      ["lg-wm6500hba", "WM6500HBA.ABLEVUS"],
    ] as const) {
      const part = getRepairPack(id).parts[0];
      expect(part?.sku, id).toBe("AHA75853813");
      expect(part?.compatibleProductCodes, id).toEqual([code]);
      expect(part?.installBoundary, id).toBe("professional-only");
      expect(part?.commerce?.offerCountAtVerification, id).toBe(5);
    }
  });

  it("keeps exact revisions checks-only when the authorized diagram is ambiguous or mismatches the observed branch", () => {
    const guidedOnly = [
      ["lg-dlex4000w", "door-will-not-close"],
      ["lg-dlex6500b", "door-will-not-close"],
      ["lg-wm4000hwa", "will-not-drain"],
      ["lg-wm3600hwa", "will-not-drain"],
      ["lg-wt6105cw", "will-not-drain"],
      ["lg-wt7150cw", "will-not-drain"],
      ["lg-wm5500hwa", "will-not-drain"],
      ["samsung-dve50t5300ca3", "door-will-not-close"],
      ["samsung-dve54cg7150da3", "door-will-not-close"],
    ] as const;
    for (const [id, symptomId] of guidedOnly) {
      const entry = APPLIANCE_CATALOG.find((candidate) => candidate.id === id);
      const coverage = entry?.symptomCoverage.find(
        (candidate) => candidate.symptomId === symptomId,
      );
      expect(coverage?.capability, id).toBe("guided-checks");
      expect(coverage?.exactPartEvidence, id).toBeUndefined();
      expect(getRepairPack(id).parts, id).toEqual([]);
    }
  });

  it("rejects revision carryover, retailer compatibility evidence, and zero-offer inflation", () => {
    const sibling = structuredClone(PURCHASE_COVERAGE_EXPANSION);
    sibling.records[0]!.exactCode = "LFXS26973S.ASTCNA1";
    expect(() => assertPurchaseCoverageExpansion(sibling, PURCHASE_COVERAGE_BASE_CATALOG)).toThrow(
      "unrecognized product code",
    );

    const retailerEvidence = structuredClone(PURCHASE_COVERAGE_EXPANSION);
    retailerEvidence.records[0]!.compatibilitySources[0]!.url =
      "https://parts-retailer.myshopify.com/products/lt1000p";
    expect(() =>
      assertPurchaseCoverageExpansion(retailerEvidence, PURCHASE_COVERAGE_BASE_CATALOG),
    ).toThrow("invalid primary or authorized evidence source");

    const zeroOffer = structuredClone(PURCHASE_COVERAGE_EXPANSION);
    zeroOffer.partProfiles["lg-lt1000p"]!.offerCountAtVerification = 0;
    expect(() =>
      assertPurchaseCoverageExpansion(zeroOffer, PURCHASE_COVERAGE_BASE_CATALOG),
    ).toThrow("incomplete");
  });

  it("rejects model identity as a substitute for reviewed symptom compatibility", () => {
    const wrongCategory = structuredClone(PURCHASE_COVERAGE_EXPANSION);
    wrongCategory.records[0] = {
      ...wrongCategory.records[0]!,
      modelId: "lg-wm3400cw",
      exactCode: "WM3400CW.ABWEVUS",
    };
    expect(() =>
      assertPurchaseCoverageExpansion(wrongCategory, PURCHASE_COVERAGE_BASE_CATALOG),
    ).toThrow("wrong-category part");

    const unknownPart = structuredClone(PURCHASE_COVERAGE_EXPANSION);
    unknownPart.records[0]!.partProfile = "neighboring-filter";
    expect(() =>
      assertPurchaseCoverageExpansion(unknownPart, PURCHASE_COVERAGE_BASE_CATALOG),
    ).toThrow("unknown part profile");

    const wrongPartCategory = structuredClone(PURCHASE_COVERAGE_EXPANSION);
    const dishwasherIndex = wrongPartCategory.records.findIndex(
      (record) => record.modelId === "bosch-shem63w55n01",
    );
    wrongPartCategory.records[dishwasherIndex]!.partProfile = "lg-lt1000p";
    expect(() =>
      assertPurchaseCoverageExpansion(wrongPartCategory, PURCHASE_COVERAGE_BASE_CATALOG),
    ).toThrow("wrong-category part");
  });
});
