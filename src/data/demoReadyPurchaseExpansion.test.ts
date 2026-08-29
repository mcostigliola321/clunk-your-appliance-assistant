import { describe, expect, it } from "vitest";

import { DEFAULT_SYMPTOM_BY_KIND } from "@/data/symptomCatalog";
import type { ApplianceCatalogEntry, SymptomCoverage } from "@/domain/types";

import { APPLIANCE_CATALOG } from "./applianceCatalog";
import rawPurchase from "./demoReadyPurchaseExpansion.json";
import {
  assertDemoReadyPurchaseData,
  DEMO_READY_PURCHASE_RECORDS,
  DEMO_READY_PURCHASE_PROFILES,
} from "./demoReadyPurchaseExpansion";

describe("demo-ready exact purchase expansion", () => {
  it("promotes exactly 17 separately evidenced revisions and reaches 84/163", () => {
    expect(DEMO_READY_PURCHASE_RECORDS).toHaveLength(17);
    expect(Object.keys(DEMO_READY_PURCHASE_PROFILES)).toHaveLength(11);
    const purchaseReady = APPLIANCE_CATALOG.filter((entry) =>
      entry.symptomCoverage.some((coverage) => coverage.capability === "purchase-ready"),
    );
    expect(purchaseReady).toHaveLength(84);
  });

  it("binds every promoted code to one SKU and a separately observed seller descriptor", () => {
    for (const record of DEMO_READY_PURCHASE_RECORDS) {
      const entry = APPLIANCE_CATALOG.find((item) => item.id === record.modelId)!;
      const coverage = entry.symptomCoverage.find(
        (item) => item.symptomId === DEFAULT_SYMPTOM_BY_KIND[entry.kind],
      )!;
      const part = coverage.exactPartEvidence?.part;
      expect(coverage.capability, record.modelId).toBe("purchase-ready");
      expect(coverage.exactPartEvidence?.verifiedProductCodes, record.modelId).toEqual([
        record.exactCode,
      ]);
      expect(part?.sku, record.modelId).toBe(DEMO_READY_PURCHASE_PROFILES[record.partProfile]?.sku);
      expect(part?.compatibleProductCodes, record.modelId).toEqual([record.exactCode]);
      expect(part?.commerce?.exactSku, record.modelId).toBe(part?.sku);
      expect(part?.commerce?.offerCountAtVerification, record.modelId).toBeGreaterThan(0);
      expect(part?.source.appliesTo, record.modelId).toContain(record.exactCode);
    }
  });

  it("preserves the reviewed correction and the explicit blockers", () => {
    const corrected = APPLIANCE_CATALOG.find((entry) => entry.id === "whirlpool-wed6150pb")!;
    const correctedPart = corrected.symptomCoverage[0]?.exactPartEvidence?.part;
    expect(correctedPart?.sku).toBe("W11429589");
    expect(correctedPart?.commerce?.exactSku).toBe("W11429589");
    expect(correctedPart?.source.appliesTo).toContain("W11429587 is separately listed");

    for (const modelId of [
      "lg-ldfn4542s",
      "samsung-dw80cg5450sraa",
      "lg-dlex4000w",
      "bosch-wtg86403uc01",
      "kitchenaid-krff305ess00",
    ]) {
      const entry = APPLIANCE_CATALOG.find((item) => item.id === modelId)!;
      expect(
        entry.symptomCoverage.find(
          (coverage) => coverage.symptomId === DEFAULT_SYMPTOM_BY_KIND[entry.kind],
        )?.capability,
        modelId,
      ).toBe("guided-checks");
    }
  });

  it("rejects missing seller evidence and an imprecise exact-code mapping", () => {
    const entriesBeforeDemoPromotion: ApplianceCatalogEntry[] = APPLIANCE_CATALOG.map((entry) => {
      const record = DEMO_READY_PURCHASE_RECORDS.find((item) => item.modelId === entry.id);
      if (!record) return entry;
      return {
        ...entry,
        symptomCoverage: entry.symptomCoverage.map((coverage): SymptomCoverage => {
          if (coverage.symptomId !== DEFAULT_SYMPTOM_BY_KIND[entry.kind]) return coverage;
          const { exactPartEvidence: _removed, ...withoutExactPartEvidence } = coverage;
          return { ...withoutExactPartEvidence, capability: "guided-checks" };
        }),
      };
    });
    const noOffer = structuredClone(rawPurchase);
    const firstProfileId = Object.keys(noOffer.partProfiles)[0]!;
    const firstProfile = (
      noOffer.partProfiles as Record<string, { offerCountAtVerification: number }>
    )[firstProfileId]!;
    firstProfile.offerCountAtVerification = 0;
    expect(() =>
      assertDemoReadyPurchaseData(
        noOffer as unknown as Parameters<typeof assertDemoReadyPurchaseData>[0],
        entriesBeforeDemoPromotion,
      ),
    ).toThrow("incomplete");

    const wrongCode = structuredClone(rawPurchase);
    wrongCode.records[0]!.exactCode = "SHPM65-NEIGHBOR";
    expect(() =>
      assertDemoReadyPurchaseData(
        wrongCode as unknown as Parameters<typeof assertDemoReadyPurchaseData>[0],
        entriesBeforeDemoPromotion,
      ),
    ).toThrow("exact revision-to-SKU");

    const wrongModel = structuredClone(rawPurchase);
    wrongModel.records[0]!.modelId = "lg-ldfn4542s";
    expect(() =>
      assertDemoReadyPurchaseData(
        wrongModel as unknown as Parameters<typeof assertDemoReadyPurchaseData>[0],
        entriesBeforeDemoPromotion,
      ),
    ).toThrow("outside its catalog identity");
  });
});
