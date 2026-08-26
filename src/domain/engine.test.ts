import { describe, expect, it } from "vitest";

import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";

import { createInitialRepairState, executeRepairTool } from "./engine";
import { REPAIR_PACKS } from "./repairPack";

function selectAndStart(applianceId: string, productCode?: string) {
  let state = createInitialRepairState("unavailable");
  state = executeRepairTool(
    state,
    "select_appliance",
    { applianceId, ...(productCode ? { productCode } : {}) },
    "human",
  ).state;
  return executeRepairTool(state, "start_diagnosis", { symptomId: "will-not-drain" }, "human")
    .state;
}

function runFilterPath(
  productCode: string | undefined,
  filterResult: "filter-blocked" | "filter-clear",
) {
  let state = selectAndStart("lg-wm3400cw", productCode);
  state = executeRepairTool(
    state,
    "record_observation",
    { checkId: "prepare-power", resultId: "acknowledged" },
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
    { checkId: "inspect-pump-filter", resultId: filterResult },
    "human",
  ).state;
}

describe("source-backed repair engine", () => {
  it("validates twelve packs across six brands", () => {
    expect(APPLIANCE_CATALOG).toHaveLength(12);
    expect(REPAIR_PACKS.size).toBe(12);
    expect(new Set(APPLIANCE_CATALOG.map((entry) => entry.brand)).size).toBe(6);
  });

  it("returns no-part-needed for a reported filter blockage", () => {
    const state = runFilterPath("WM3400CW.ABWEVUS", "filter-blocked");
    const result = executeRepairTool(state, "find_compatible_part", {}, "agent");
    expect(result.ok).toBe(true);
    expect(result.snapshot.partOutcome?.status).toBe("no-part-needed");
    expect(result.snapshot.selectedPart).toBeNull();
    expect(result.snapshot.likelyCauses[0]?.id).toBe("blocked-filter");
  });

  it("reveals an exact professional-only pump only for a verified complete code", () => {
    const state = runFilterPath("WM3400CW.ABWEVUS", "filter-clear");
    const result = executeRepairTool(state, "find_compatible_part", {}, "agent");
    expect(result.snapshot.partOutcome?.status).toBe("exact");
    expect(result.snapshot.selectedPart?.sku).toBe("AHA75693425");
    expect(result.snapshot.selectedPart?.installBoundary).toBe("professional-only");
  });

  it("refuses a family-level exact-part claim", () => {
    const state = runFilterPath(undefined, "filter-clear");
    const result = executeRepairTool(state, "find_compatible_part", {}, "agent");
    expect(result.snapshot.partOutcome?.status).toBe("variant-needed");
    expect(result.snapshot.selectedPart).toBeNull();
  });

  it("lets the shared diagram explain any labeled component without advancing diagnosis", () => {
    const state = selectAndStart("lg-wm3400cw");
    const result = executeRepairTool(
      state,
      "show_component",
      { componentId: "drain-hose" },
      "human",
    );
    expect(result.ok).toBe(true);
    expect(result.snapshot.highlightedComponent.id).toBe("drain-hose");
    expect(result.state.currentStepId).toBe("prepare-power");
    expect(result.state.completedChecks).toEqual({});
  });

  it("ends Electrolux at service after its verified visible hose check", () => {
    let state = selectAndStart("electrolux-elfw7637at");
    state = executeRepairTool(state, "record_observation", {
      checkId: "prepare-power",
      resultId: "acknowledged",
    }).state;
    state = executeRepairTool(state, "record_observation", {
      checkId: "inspect-drain-hose",
      resultId: "hose-clear",
    }).state;
    const result = executeRepairTool(state, "find_compatible_part");
    expect(result.snapshot.partOutcome?.status).toBe("professional-only");
    expect(state.completedChecks["inspect-pump-filter"]).toBeUndefined();
  });

  it("shows an explicit empty result instead of substituting an unsupported model", () => {
    const initial = createInitialRepairState();
    const result = executeRepairTool(initial, "search_supported_appliances", {
      modelQuery: "NOT-A-REAL-MATCH-999",
    });
    expect(result.ok).toBe(true);
    expect(result.snapshot.catalogResults).toEqual([]);
    expect(result.message).toContain("will not substitute");
  });

  it("rejects out-of-order observations without advancing", () => {
    const initial = createInitialRepairState();
    const result = executeRepairTool(initial, "record_observation", {
      checkId: "inspect-pump-filter",
      resultId: "filter-clear",
    });
    expect(result.ok).toBe(false);
    expect(result.state.phase).toBe("catalog");
    expect(result.state.completedChecks).toEqual({});
  });

  it("keeps visible activity ordering deterministic", () => {
    const initial = createInitialRepairState();
    const first = executeRepairTool(initial, "get_repair_state");
    const second = executeRepairTool(first.state, "search_supported_appliances", { brand: "LG" });
    expect(second.state.activity.map((event) => event.id)).toEqual([
      "event-0",
      "event-1",
      "event-2",
    ]);
  });
});
