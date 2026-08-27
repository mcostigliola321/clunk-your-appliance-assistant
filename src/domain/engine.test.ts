import { describe, expect, it } from "vitest";

import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";

import { createInitialRepairState, executeRepairTool } from "./engine";
import { getRepairPack, REPAIR_PACKS } from "./repairPack";

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
    for (const applianceId of [
      "lg-wm3400cw",
      "whirlpool-wdt750sakz1",
      "ge-gtd42easj2ww",
      "ge-gss25gypfs",
    ]) {
      const result = runExample(applianceId);
      expect(result.ok).toBe(true);
      expect(result.snapshot.partOutcome?.status).toBe("exact");
      expect(result.snapshot.selectedPart?.purchase.url).toMatch(/^https:\/\//);
      expect(result.snapshot.exampleMode).toBe(true);
    }
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
    const exact = executeRepairTool(
      runWasherPath("WM3400CW.ABWEVUS", "filter-clear"),
      "find_compatible_part",
      {},
      "agent",
    );
    expect(exact.snapshot.partOutcome?.status).toBe("exact");
    expect(exact.snapshot.selectedPart?.sku).toBe("AHA75693425");
    const incomplete = executeRepairTool(
      runWasherPath(undefined, "filter-clear"),
      "find_compatible_part",
      {},
      "agent",
    );
    expect(incomplete.snapshot.partOutcome?.status).toBe("variant-needed");
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
    expect(next.state.activity.map((event) => event.id)).toEqual(["event-0", "event-1", "event-2"]);
  });
});
