import { describe, expect, it } from "vitest";

import { createInitialRepairState, executeRepairTool } from "./engine";
import { getCheck } from "./repairPack";
import { assertSafeRepairStep, escalationForResult } from "./safety";

describe("deterministic safety boundary", () => {
  it.each([
    ["hazard-burning", "burning-smell"],
    ["hazard-hot-water", "hot-water"],
    ["hazard-active-leak", "active-leak"],
    ["unsafe-to-reach", "internal-access"],
    ["unsafe-to-open", "internal-access"],
  ] as const)("maps %s to %s", (resultId, reason) => {
    expect(escalationForResult(resultId)?.reason).toBe(reason);
  });

  it("ends immediately when a hazard is reported", () => {
    let state = createInitialRepairState();
    state = executeRepairTool(state, "select_appliance", { applianceId: "lg-wm3400cw" }).state;
    state = executeRepairTool(state, "start_diagnosis", { symptomId: "will-not-drain" }).state;
    const stopped = executeRepairTool(state, "record_observation", {
      checkId: "prepare-power",
      resultId: "hazard-burning",
    });
    expect(stopped.state.phase).toBe("escalated");
    expect(stopped.state.currentStepId).toBeNull();
    expect(stopped.state.escalation?.reason).toBe("burning-smell");
    expect(stopped.snapshot.validNextActions).toEqual([
      "get_repair_state",
      "search_supported_appliances",
      "select_appliance",
    ]);
  });

  it("allows only bounded, external or user-accessible steps", () => {
    const check = getCheck("lg-wm3400cw", "prepare-power");
    expect(assertSafeRepairStep(check).id).toBe("prepare-power");
    expect(() => assertSafeRepairStep({ ...check, safetyTags: ["energized-test"] })).toThrow(
      "unsupported safety tag",
    );
  });
});
