import { describe, expect, it } from "vitest";

import { createInitialRepairState, executeRepairTool } from "./engine";
import { getAvailablePartId } from "./selectors";

function runHappyPath(filterResult: "filter-blocked" | "filter-clear") {
  let state = createInitialRepairState("unavailable");
  state = executeRepairTool(state, "identify_appliance", { applianceId: "clunk-wm01" }, "human").state;
  state = executeRepairTool(state, "start_diagnosis", { symptomId: "will-not-drain" }, "human").state;
  state = executeRepairTool(
    state,
    "record_check_result",
    { checkId: "prepare-power", resultId: "acknowledged" },
    "human",
  ).state;
  state = executeRepairTool(
    state,
    "record_check_result",
    { checkId: "inspect-drain-hose", resultId: "hose-clear" },
    "human",
  ).state;
  return executeRepairTool(
    state,
    "record_check_result",
    { checkId: "inspect-pump-filter", resultId: filterResult },
    "human",
  ).state;
}

describe("repair engine", () => {
  it("runs the safe blocked-filter diagnosis deterministically", () => {
    const state = runHappyPath("filter-blocked");
    const match = executeRepairTool(state, "find_compatible_part", {}, "agent");

    expect(match.ok).toBe(true);
    expect(match.state.phase).toBe("result");
    expect(match.state.selectedPartId).toBe("cl-pf-220");
    expect(match.snapshot.likelyCauses[0]?.id).toBe("blocked-filter");
    expect(match.snapshot.likelyCauses[0]?.confidence).toBe("strong match");
    expect(match.snapshot.progress).toBe(100);
  });

  it("matches a professional-only pump after clear visible checks", () => {
    const state = runHappyPath("filter-clear");

    expect(getAvailablePartId(state)).toBe("cl-dp-420");
    expect(executeRepairTool(state, "find_compatible_part").snapshot.selectedPart?.installBoundary).toBe(
      "professional-only",
    );
  });

  it("rejects out-of-order and mismatched observations without advancing", () => {
    const initial = createInitialRepairState();
    const result = executeRepairTool(initial, "record_check_result", {
      checkId: "inspect-pump-filter",
      resultId: "hose-kinked",
    });

    expect(result.ok).toBe(false);
    expect(result.state.phase).toBe("idle");
    expect(result.state.completedChecks).toEqual({});
    expect(result.state.activity.at(-1)?.outcome).toBe("rejected");
  });

  it("keeps activity ordering deterministic", () => {
    const initial = createInitialRepairState();
    const first = executeRepairTool(initial, "get_repair_state");
    const second = executeRepairTool(first.state, "highlight_component", { componentId: "drain-hose" });

    expect(second.state.activity.map((event) => event.id)).toEqual(["event-0", "event-1", "event-2"]);
    expect(second.state.sequence).toBe(2);
  });
});
