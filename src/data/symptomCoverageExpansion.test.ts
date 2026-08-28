import { describe, expect, it } from "vitest";

import { getCatalogEntriesForSymptom, getSymptomCoverage } from "@/data/journeyCatalog";
import { getRepairPack, resolveRepairPack } from "@/domain/repairPack";

import { APPLIANCE_CATALOG } from "./applianceCatalog";
import rawExpansion from "./symptomCoverageExpansion.json";
import {
  assertSymptomCoverageExpansionData,
  SYMPTOM_COVERAGE_EVIDENCE,
  SYMPTOM_COVERAGE_SOURCES,
} from "./symptomCoverageExpansion";

describe("evidence-backed model × symptom expansion", () => {
  it("activates the exact 91 reconciled door-closure records and no inferred neighbors", () => {
    expect(SYMPTOM_COVERAGE_EVIDENCE).toHaveLength(91);
    expect(
      Object.fromEntries(
        (["washer", "dishwasher", "refrigerator"] as const).map((kind) => [
          kind,
          SYMPTOM_COVERAGE_EVIDENCE.filter((record) => record.category === kind).length,
        ]),
      ),
    ).toEqual({ washer: 36, dishwasher: 20, refrigerator: 35 });

    const evidenceIds = new Set(SYMPTOM_COVERAGE_EVIDENCE.map((record) => record.modelId));
    const activeIds = new Set(
      (["washer", "dishwasher", "refrigerator"] as const).flatMap((kind) =>
        getCatalogEntriesForSymptom(kind, "door-will-not-close").map((entry) => entry.id),
      ),
    );
    expect(activeIds).toEqual(evidenceIds);
    expect(resolveRepairPack("ge-gfw550ssnww", "door-will-not-close")).toBeNull();
    expect(resolveRepairPack("lg-ldfn3432t", "door-will-not-close")).toBeNull();
    expect(resolveRepairPack("lg-lrmvc2306s", "door-will-not-close")).toBeNull();
  });

  it("matches every record to catalog brand, category, topology, load style, and primary source", () => {
    for (const record of SYMPTOM_COVERAGE_EVIDENCE) {
      const entry = APPLIANCE_CATALOG.find((item) => item.id === record.modelId);
      expect(entry, record.modelId).toBeDefined();
      expect(entry).toMatchObject({
        kind: record.category,
        brand: record.brand,
        topology: record.topology,
      });
      expect(entry?.aliases.map((alias) => alias.toUpperCase())).toContain(
        record.modelFamily.toUpperCase(),
      );
      if (record.category === "washer") expect(entry?.loadStyle).toBe(record.loadStyle);
      const coverage = getSymptomCoverage(entry!, "door-will-not-close");
      expect(coverage).toMatchObject({ capability: "guided-checks" });
      expect(coverage?.exactPartEvidence).toBeUndefined();
      expect(coverage?.troubleshootingSources.map((source) => source.id)).toEqual(record.sourceIds);
      expect(
        coverage?.troubleshootingSources.every(
          (source) =>
            source.kind === "manufacturer-troubleshooting" &&
            source.lastVerified === "2026-08-28" &&
            source.url.startsWith("https://"),
        ),
      ).toBe(true);
    }
    expect(Object.keys(SYMPTOM_COVERAGE_SOURCES)).toHaveLength(26);
  });

  it("preserves topology and feature exceptions while keeping the common tree conservative", () => {
    expect(
      SYMPTOM_COVERAGE_EVIDENCE.find((record) => record.modelId === "lg-wt7400cw")
        ?.modelSpecificException,
    ).toContain("door or lid");
    expect(
      SYMPTOM_COVERAGE_EVIDENCE.find((record) => record.modelId === "samsung-dw80cg4021sr")
        ?.modelSpecificException,
    ).toContain("Auto-open/AutoRelease");
    expect(
      SYMPTOM_COVERAGE_EVIDENCE.find((record) => record.modelId === "samsung-rf28t5001sr")
        ?.modelSpecificException,
    ).toContain("Mullion/flap");

    const topLoadPack = getRepairPack("lg-wt7400cw", "door-will-not-close");
    const frontLoadPack = getRepairPack("lg-wm3400cw", "door-will-not-close");
    const dishwasherPack = getRepairPack("samsung-dw80cg4021sr", "door-will-not-close");
    const refrigeratorPack = getRepairPack("samsung-rf28t5001sr", "door-will-not-close");
    expect(topLoadPack.symptom.label).toContain("lid");
    expect(frontLoadPack.symptom.label).toContain("door");
    expect(JSON.stringify(topLoadPack)).not.toContain("front-door gasket");
    expect(JSON.stringify(dishwasherPack)).not.toContain("level the dishwasher");
    expect(JSON.stringify(refrigeratorPack)).not.toContain("Check the mullion");
    for (const pack of [topLoadPack, frontLoadPack, dishwasherPack, refrigeratorPack]) {
      expect(pack.parts).toEqual([]);
      expect(pack.checks[0]?.id).toBe("safety-check");
      expect(pack.checks.flatMap((check) => check.safetyTags)).not.toContain("panel-removal");
      expect(
        pack.checks
          .flatMap((check) => check.results)
          .some((result) => result.effect === "professional-only"),
      ).toBe(true);
    }
  });

  it("rejects missing sources, tier inflation, and malformed record identity", () => {
    const missing = structuredClone(rawExpansion);
    missing.records[0]!.sourceIds = ["missing-source"];
    expect(() =>
      assertSymptomCoverageExpansionData(
        missing as unknown as Parameters<typeof assertSymptomCoverageExpansionData>[0],
      ),
    ).toThrow("unknown source");

    const inflated = structuredClone(rawExpansion);
    Object.assign(inflated.records[0]!, { capabilityTier: "purchase-ready" });
    expect(() =>
      assertSymptomCoverageExpansionData(
        inflated as unknown as Parameters<typeof assertSymptomCoverageExpansionData>[0],
      ),
    ).toThrow("incomplete");

    const mismatched = structuredClone(rawExpansion);
    mismatched.records[0]!.rowId = "neighbor__door-will-not-close";
    expect(() =>
      assertSymptomCoverageExpansionData(
        mismatched as unknown as Parameters<typeof assertSymptomCoverageExpansionData>[0],
      ),
    ).toThrow("mismatched");
  });
});
