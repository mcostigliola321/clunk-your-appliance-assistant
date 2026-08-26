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

  it("ends the flow immediately when a hazard is observed", () => {
    let state = createInitialRepairState();
    state = executeRepairTool(state, "identify_appliance", { applianceId: "clunk-wm01" }).state;
    state = executeRepairTool(state, "start_diagnosis", { symptomId: "will-not-drain" }).state;
    const stopped = executeRepairTool(state, "record_check_result", {
      checkId: "prepare-power",
      resultId: "hazard-burning",
    });

    expect(stopped.ok).toBe(true);
    expect(stopped.state.phase).toBe("escalated");
    expect(stopped.state.currentStepId).toBeNull();
    expect(stopped.state.escalation?.reason).toBe("burning-smell");
    expect(stopped.snapshot.validNextActions).toEqual(["get_repair_state"]);
  });

  it("allows only the repair pack's bounded observation steps", () => {
    expect(assertSafeRepairStep(getCheck("prepare-power")).id).toBe("prepare-power");
    expect(() =>
      assertSafeRepairStep({
        ...getCheck("prepare-power"),
        safetyTags: ["energized-test"],
      }),
    ).toThrow("unsupported safety tag");
  });
});
