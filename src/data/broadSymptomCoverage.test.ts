import { describe, expect, it } from "vitest";

import { getCatalogEntriesForSymptom, getSymptomCoverage } from "@/data/journeyCatalog";
import { getRepairPack, resolveRepairPack } from "@/domain/repairPack";

import { APPLIANCE_CATALOG } from "./applianceCatalog";
import rawCoverage from "./broadSymptomCoverage.json";
import {
  assertBroadSymptomCoverageData,
  BROAD_SYMPTOM_COVERAGE_COHORTS,
  BROAD_SYMPTOM_COVERAGE_EVIDENCE,
  BROAD_SYMPTOM_COVERAGE_SOURCES,
  EXPECTED_BROAD_SYMPTOM_COUNTS,
} from "./broadSymptomCoverage";

describe("broad evidence-backed model × symptom coverage", () => {
  it("activates all 303 exact evidence rows at the locked route counts", () => {
    expect(BROAD_SYMPTOM_COVERAGE_EVIDENCE).toHaveLength(303);
    expect(BROAD_SYMPTOM_COVERAGE_COHORTS).toHaveLength(12);
    expect(
      Object.fromEntries(
        Object.keys(EXPECTED_BROAD_SYMPTOM_COUNTS).map((key) => {
          const [category, symptomId] = key.split(":") as [
            Parameters<typeof getCatalogEntriesForSymptom>[0],
            Parameters<typeof getCatalogEntriesForSymptom>[1],
          ];
          return [key, getCatalogEntriesForSymptom(category, symptomId).length];
        }),
      ),
    ).toEqual(EXPECTED_BROAD_SYMPTOM_COUNTS);
  });

  it("matches every exact row to catalog identity, topology, feature evidence, and primary sources", () => {
    for (const record of BROAD_SYMPTOM_COVERAGE_EVIDENCE) {
      const entry = APPLIANCE_CATALOG.find((item) => item.id === record.modelId);
      expect(entry, record.rowId).toBeDefined();
      expect(entry).toMatchObject({
        kind: record.category,
        brand: record.brand,
        model: record.modelFamily,
        topology: record.topology,
      });
      expect(entry?.loadStyle ?? null).toBe(record.loadStyle);
      expect(entry?.modelSource.id).toBe(record.modelEvidence.sourceId);
      expect(entry?.modelSource.url).toBe(record.modelEvidence.url);
      expect(entry?.verifiedProductCodes).toEqual(
        expect.arrayContaining(record.modelEvidence.verifiedProductCodes),
      );

      const coverage = getSymptomCoverage(entry!, record.symptomId);
      expect(coverage).toMatchObject({
        repairPackId: `${record.modelId}::${record.symptomId}`,
        capability: "guided-checks",
      });
      expect(coverage?.exactPartEvidence).toBeUndefined();
      expect(coverage?.troubleshootingSources.map((item) => item.id)).toEqual(record.sourceIds);
      expect(
        coverage?.troubleshootingSources.every(
          (item) =>
            item.kind === "manufacturer-troubleshooting" &&
            item.lastVerified === "2026-08-29" &&
            item.url.startsWith("https://"),
        ),
      ).toBe(true);
    }
    expect(Object.keys(BROAD_SYMPTOM_COVERAGE_SOURCES).length).toBeGreaterThanOrEqual(50);
  });

  it("preserves topology gates and conservative stops in representative packs", () => {
    const topStart = getRepairPack("ge-gtw335asnww", "will-not-start");
    const topLeak = getRepairPack("lg-wt7150cw", "is-leaking");
    const frontSpin = getRepairPack("samsung-wf46bg6500av", "will-not-spin");
    const dishwasherLeak = getRepairPack("bosch-shx78cm5n01", "is-leaking");
    const dryerHeat = getRepairPack("whirlpool-wed4815ew", "not-heating");
    const refrigeratorIce = getRepairPack("lg-lfxs26973s", "ice-maker-not-making-ice");

    expect(topStart.appliance.loadStyle).toBe("top-load");
    expect(JSON.stringify(topStart)).toContain("lid");
    expect(JSON.stringify(topStart)).not.toContain("dispenser drawer");
    expect(JSON.stringify(topLeak)).toContain("tub rim");
    expect(JSON.stringify(topLeak)).not.toContain("rubber seal");
    expect(JSON.stringify(frontSpin)).toContain("door");
    expect(JSON.stringify(frontSpin)).not.toContain("lid and tub rim");
    expect(JSON.stringify(dishwasherLeak)).not.toContain("level the dishwasher");
    expect(JSON.stringify(dryerHeat)).not.toContain("terminal block");
    expect(JSON.stringify(refrigeratorIce)).not.toContain("test button");

    for (const pack of [topStart, topLeak, frontSpin, dishwasherLeak, dryerHeat, refrigeratorIce]) {
      expect(pack.parts).toEqual([]);
      expect(pack.checks[0]?.id).toBe("safety-check");
      expect(pack.checks.flatMap((check) => check.safetyTags)).not.toContain("panel-removal");
      expect(
        pack.checks
          .flatMap((check) => check.results)
          .some((result) => result.effect === "professional-only" || result.effect === "hazard"),
      ).toBe(true);
    }
  });

  it("keeps excluded neighboring brands unsupported for the exact problem", () => {
    expect(resolveRepairPack("maytag-mvw4505mw", "will-not-start")).toBeNull();
    expect(resolveRepairPack("samsung-dw80r2031usaa", "will-not-fill")).toBeNull();
    expect(resolveRepairPack("maytag-med6230hw", "not-heating")).toBeNull();
    expect(resolveRepairPack("maytag-mss25c4mgz", "ice-maker-not-making-ice")).toBeNull();

    expect(
      getCatalogEntriesForSymptom("washer", "will-not-start").some(
        (entry) => entry.id === "maytag-mvw4505mw",
      ),
    ).toBe(false);
    expect(
      getCatalogEntriesForSymptom("dishwasher", "will-not-fill").some(
        (entry) => entry.id === "samsung-dw80r2031usaa",
      ),
    ).toBe(false);
  });

  it("preserves all identities and purchase-ready exact revisions", () => {
    expect(APPLIANCE_CATALOG).toHaveLength(163);
    expect(new Set(APPLIANCE_CATALOG.map((entry) => entry.id))).toHaveLength(163);
    expect(
      APPLIANCE_CATALOG.filter((entry) =>
        entry.symptomCoverage.some((coverage) => coverage.exactPartEvidence),
      ),
    ).toHaveLength(55);
    expect(
      APPLIANCE_CATALOG.flatMap((entry) => entry.symptomCoverage).filter(
        (coverage) => coverage.capability === "purchase-ready",
      ),
    ).toHaveLength(55);
  });

  it("rejects missing sources, tier inflation, malformed identity, and removed safety gates", () => {
    const missingSource = structuredClone(rawCoverage);
    missingSource.records[0]!.sourceIds = ["missing-source"];
    expect(() =>
      assertBroadSymptomCoverageData(
        missingSource as unknown as Parameters<typeof assertBroadSymptomCoverageData>[0],
      ),
    ).toThrow("unknown source");

    const inflated = structuredClone(rawCoverage);
    Object.assign(inflated.records[0]!, { capabilityTier: "purchase-ready" });
    expect(() =>
      assertBroadSymptomCoverageData(
        inflated as unknown as Parameters<typeof assertBroadSymptomCoverageData>[0],
      ),
    ).toThrow("incomplete");

    const mismatched = structuredClone(rawCoverage);
    mismatched.records[0]!.rowId = "neighbor__will-not-start";
    expect(() =>
      assertBroadSymptomCoverageData(
        mismatched as unknown as Parameters<typeof assertBroadSymptomCoverageData>[0],
      ),
    ).toThrow("mismatched");

    const unsafe = structuredClone(rawCoverage);
    unsafe.records[0]!.featureGates = [];
    expect(() =>
      assertBroadSymptomCoverageData(
        unsafe as unknown as Parameters<typeof assertBroadSymptomCoverageData>[0],
      ),
    ).toThrow("incomplete");
  });
});
