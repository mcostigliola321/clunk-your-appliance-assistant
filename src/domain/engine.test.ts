import { describe, expect, it } from "vitest";

import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";

import { createInitialRepairState, executeRepairTool } from "./engine";
import { getRepairPack, REPAIR_PACKS } from "./repairPack";
import { getWebMcpTaskSnapshot } from "./selectors";

function selectAndStart(applianceId: string, productCode?: string) {
  let state = createInitialRepairState("unavailable");
  state = executeRepairTool(
    state,
    "select_appliance",
    { applianceId, ...(productCode ? { productCode } : {}) },
    "human",
  ).state;
  return executeRepairTool(
    state,
    "start_diagnosis",
    { symptomId: getRepairPack(applianceId).symptom.id },
    "human",
  ).state;
}

function runWasherPath(
  productCode: string | undefined,
  filterResult: "filter-blocked" | "filter-clear",
) {
  let state = selectAndStart("lg-wm3400cw", productCode);
  state = executeRepairTool(
    state,
    "record_observation",
    { checkId: "safety-check", resultId: "safe-ready" },
    "human",
  ).state;
  state = executeRepairTool(
    state,
    "record_observation",
    { checkId: "inspect-drain-hose", resultId: "hose-clear" },
    "human",
  ).state;
  return executeRepairTool(
    state,
    "record_observation",
    { checkId: "inspect-filter", resultId: filterResult },
    "human",
  ).state;
}

function runExample(applianceId: string) {
  const pack = getRepairPack(applianceId);
  expect(pack.example).not.toBeNull();
  let state = createInitialRepairState("unavailable");
  state = executeRepairTool(
    state,
    "select_appliance",
    { applianceId, productCode: pack.example!.productCode },
    "example",
  ).state;
  state = executeRepairTool(
    state,
    "start_diagnosis",
    { symptomId: pack.symptom.id },
    "example",
  ).state;
  for (const observation of pack.example!.observations)
    state = executeRepairTool(state, "record_observation", observation, "example").state;
  return executeRepairTool(state, "find_compatible_part", {}, "example");
}

describe("source-backed multi-appliance repair engine", () => {
  it("validates 31 repair packs across four categories", () => {
    expect(APPLIANCE_CATALOG).toHaveLength(31);
    expect(REPAIR_PACKS.size).toBe(31);
    expect(new Set(APPLIANCE_CATALOG.map((entry) => entry.kind))).toEqual(
      new Set(["washer", "dishwasher", "dryer", "refrigerator"]),
    );
    expect(APPLIANCE_CATALOG.filter((entry) => entry.kind === "washer")).toHaveLength(19);
    expect(APPLIANCE_CATALOG.filter((entry) => entry.kind === "dishwasher")).toHaveLength(4);
    expect(APPLIANCE_CATALOG.filter((entry) => entry.kind === "dryer")).toHaveLength(4);
    expect(APPLIANCE_CATALOG.filter((entry) => entry.kind === "refrigerator")).toHaveLength(4);
  });

  it("reaches an exact seller link in every flagship example", () => {
    const flagships = [
      { applianceId: "ge-gfw550ssnww", sku: "WH11X39237" },
      { applianceId: "whirlpool-wdt750sakz1", sku: "W11412291" },
      { applianceId: "ge-gtd42easj2ww", sku: "WE01M10007" },
      { applianceId: "ge-gss25gypfs", sku: "XWFE" },
    ];
    for (const { applianceId, sku } of flagships) {
      const result = runExample(applianceId);
      expect(result.ok).toBe(true);
      expect(result.snapshot.partOutcome?.status).toBe("exact");
      expect(result.snapshot.selectedPart?.sku).toBe(sku);
      expect(result.snapshot.selectedPart?.purchase.url).toMatch(/^https:\/\//);
      expect(result.snapshot.selectedPart?.purchase.lastVerified).toBe("2026-08-27");
      expect(result.snapshot.exampleMode).toBe(true);
    }
    expect(
      APPLIANCE_CATALOG.find((entry) => entry.id === "lg-wm3400cw")?.exactPart,
    ).toBeUndefined();
  });

  it("returns no-part-needed when the washer filter is blocked", () => {
    const result = executeRepairTool(
      runWasherPath("WM3400CW.ABWEVUS", "filter-blocked"),
      "find_compatible_part",
      {},
      "agent",
    );
    expect(result.ok).toBe(true);
    expect(result.snapshot.partOutcome?.status).toBe("no-part-needed");
    expect(result.snapshot.likelyCauses[0]?.id).toBe("washer-filter");
  });

  it("reveals the washer pump only for a verified complete code", () => {
    let exactState = selectAndStart("ge-gfw550ssnww", "GFW550SSN0WW");
    exactState = executeRepairTool(exactState, "record_observation", {
      checkId: "safety-check",
      resultId: "safe-ready",
    }).state;
    exactState = executeRepairTool(exactState, "record_observation", {
      checkId: "inspect-drain-hose",
      resultId: "hose-clear",
    }).state;
    exactState = executeRepairTool(exactState, "record_observation", {
      checkId: "inspect-filter",
      resultId: "filter-clear",
    }).state;
    const exact = executeRepairTool(exactState, "find_compatible_part", {}, "agent");
    expect(exact.snapshot.partOutcome?.status).toBe("exact");
    expect(exact.snapshot.selectedPart?.sku).toBe("WH11X39237");
    expect(JSON.stringify(getWebMcpTaskSnapshot(exact.state)).length).toBeLessThan(1500);
    const incomplete = executeRepairTool(
      runWasherPath(undefined, "filter-clear"),
      "find_compatible_part",
      {},
      "agent",
    );
    expect(incomplete.snapshot.partOutcome?.status).toBe("variant-needed");
  });

  it("keeps an active human-observation task compact for WebMCP", () => {
    const state = selectAndStart("ge-gtd42easj2ww", "GTD42EASJ2WW");
    const output = getWebMcpTaskSnapshot(state);
    expect(JSON.stringify(output).length).toBeLessThan(1500);
    expect(output.handoff).toBe("human-observation-required");
    expect(output.catalog.results).toEqual([]);
    expect(output.task?.currentCheck?.observations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ resultId: "safe-ready" }),
        expect.objectContaining({ resultId: "hazard-burning" }),
      ]),
    );
  });

  it("keeps broad catalog discovery bounded for WebMCP", () => {
    const state = executeRepairTool(createInitialRepairState(), "search_supported_appliances", {
      kind: "washer",
    }).state;
    const output = getWebMcpTaskSnapshot(state);
    expect(output.catalog.resultCount).toBe(19);
    expect(output.catalog.results).toHaveLength(10);
    expect(JSON.stringify(output).length).toBeLessThan(1500);
  });

  it("keeps top-load models on the safe hose-only path", () => {
    const pack = getRepairPack("ge-gtw585bsvws");
    expect(pack.appliance.loadStyle).toBe("top-load");
    expect(pack.checks.map((check) => check.id)).toEqual(["safety-check", "inspect-drain-hose"]);
  });

  it("does not claim purchase readiness for guided-only models", () => {
    let state = selectAndStart("electrolux-elfw7637at");
    state = executeRepairTool(state, "record_observation", {
      checkId: "safety-check",
      resultId: "safe-ready",
    }).state;
    state = executeRepairTool(state, "record_observation", {
      checkId: "inspect-drain-hose",
      resultId: "hose-clear",
    }).state;
    const result = executeRepairTool(state, "find_compatible_part");
    expect(result.snapshot.partOutcome?.status).toBe("professional-only");
    expect(result.snapshot.selectedPart).toBeNull();
  });

  it("filters the shared catalog by category without substitution", () => {
    const dishwasher = executeRepairTool(
      createInitialRepairState(),
      "search_supported_appliances",
      { kind: "dishwasher", modelQuery: "WDT750" },
    );
    expect(dishwasher.snapshot.catalogResults.map((item) => item.id)).toEqual([
      "whirlpool-wdt750sakz1",
    ]);
    const missing = executeRepairTool(createInitialRepairState(), "search_supported_appliances", {
      kind: "dryer",
      modelQuery: "NOT-A-REAL-MATCH-999",
    });
    expect(missing.snapshot.catalogResults).toEqual([]);
    expect(missing.message).toBe("No matching dryer found.");
  });

  it("rejects out-of-order observations and preserves deterministic activity", () => {
    const initial = createInitialRepairState();
    const rejected = executeRepairTool(initial, "record_observation", {
      checkId: "inspect-filter",
      resultId: "filter-clear",
    });
    expect(rejected.ok).toBe(false);
    const next = executeRepairTool(rejected.state, "get_repair_state");
    expect(next.state.activity.map((event) => event.id)).toEqual(["event-0", "event-1"]);
    expect(next.state).toBe(rejected.state);
  });
});
