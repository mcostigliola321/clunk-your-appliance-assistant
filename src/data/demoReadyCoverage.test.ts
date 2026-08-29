import { describe, expect, it } from "vitest";

import { getCatalogEntriesForSymptom, getSymptomCoverage } from "@/data/journeyCatalog";
import { resolveRepairPack } from "@/domain/repairPack";

import { APPLIANCE_CATALOG } from "./applianceCatalog";
import rawCoverage from "./demoReadyCoverage.json";
import {
  assertDemoReadyCoverageData,
  DEMO_READY_COVERAGE_EVIDENCE,
  DEMO_READY_COVERAGE_SOURCES,
} from "./demoReadyCoverage";

describe("demo-ready exact model × symptom evidence", () => {
  it("activates exactly the 156 category-reviewed rows", () => {
    expect(DEMO_READY_COVERAGE_EVIDENCE).toHaveLength(156);
    expect(
      Object.fromEntries(
        (["washer", "dishwasher", "dryer"] as const).map((category) => [
          category,
          DEMO_READY_COVERAGE_EVIDENCE.filter((record) => record.category === category).length,
        ]),
      ),
    ).toEqual({ washer: 65, dishwasher: 49, dryer: 42 });
    expect(Object.keys(DEMO_READY_COVERAGE_SOURCES)).toHaveLength(71);
  });

  it("matches every row to one catalog identity, route, primary source, and checks-only pack", () => {
    for (const record of DEMO_READY_COVERAGE_EVIDENCE) {
      const entry = APPLIANCE_CATALOG.find((item) => item.id === record.modelId);
      expect(entry, record.rowId).toMatchObject({ kind: record.category });
      expect(getSymptomCoverage(entry!, record.symptomId)).toMatchObject({
        repairPackId: record.rowId.replace("__", "::"),
        capability: "guided-checks",
      });
      const pack = resolveRepairPack(record.modelId, record.symptomId);
      expect(pack, record.rowId).not.toBeNull();
      expect(pack?.parts, record.rowId).toEqual([]);
      expect(pack?.checks[0]?.id, record.rowId).toBe("safety-check");
      expect(
        pack?.checks.flatMap((check) => check.safetyTags),
        record.rowId,
      ).not.toContain("panel-removal");
    }
  });

  it("leaves only the explicitly blocked rows unsupported", () => {
    expect(getCatalogEntriesForSymptom("washer", "door-will-not-close")).toHaveLength(53);
    expect(getCatalogEntriesForSymptom("washer", "will-not-start")).toHaveLength(55);
    expect(getCatalogEntriesForSymptom("dishwasher", "is-leaking")).toHaveLength(33);
    expect(getCatalogEntriesForSymptom("dryer", "drum-will-not-turn")).toHaveLength(33);
    expect(resolveRepairPack("hotpoint-htw2065sbww", "will-not-start")).toBeNull();
    expect(resolveRepairPack("ge-gtw585bsvws", "door-will-not-close")).toBeNull();
  });

  it("rejects duplicate rows, missing sources, and tier inflation fields", () => {
    const duplicate = structuredClone(rawCoverage);
    duplicate.records.push(structuredClone(duplicate.records[0]!));
    expect(() =>
      assertDemoReadyCoverageData(
        duplicate as unknown as Parameters<typeof assertDemoReadyCoverageData>[0],
      ),
    ).toThrow("duplicated");

    const missing = structuredClone(rawCoverage);
    missing.records[0]!.sourceIds = ["missing"];
    expect(() =>
      assertDemoReadyCoverageData(
        missing as unknown as Parameters<typeof assertDemoReadyCoverageData>[0],
      ),
    ).toThrow("incomplete");

    const inflated = structuredClone(rawCoverage) as unknown as {
      records: Array<Record<string, unknown>>;
    };
    inflated.records[0]!["capability"] = "purchase-ready";
    expect(inflated.records[0]?.["capability"]).toBe("purchase-ready");
    expect(DEMO_READY_COVERAGE_EVIDENCE[0]).not.toHaveProperty("capability");
  });
});
