import { afterEach, describe, expect, it, vi } from "vitest";

import { createInitialRepairState, executeRepairTool } from "@/domain/engine";
import type { RepairState, WebMcpStatus } from "@/domain/types";

import { registerClunkTools } from "./registerTools";

describe("WebMCP registration", () => {
  afterEach(() => {
    Reflect.deleteProperty(document, "modelContext");
  });

  it("falls back cleanly when WebMCP is unavailable", () => {
    const statuses: WebMcpStatus[] = [];
    const controller = registerClunkTools(
      (name, input, source) => executeRepairTool(createInitialRepairState(), name, input, source),
      (status) => statuses.push(status),
    );

    expect(controller).toBeNull();
    expect(statuses).toEqual(["unavailable"]);
  });

  it("registers all eight literal tools and routes execution through shared state", async () => {
    const tools: WebMcpTool[] = [];
    const registrationSignals: AbortSignal[] = [];
    const registerTool = vi.fn(async (tool: WebMcpTool, options?: WebMcpRegisterToolOptions) => {
      tools.push(tool);
      if (options?.signal) registrationSignals.push(options.signal);
    });
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: { registerTool },
    });

    let state: RepairState = createInitialRepairState();
    const statuses: WebMcpStatus[] = [];
    const controller = registerClunkTools(
      (name, input, source) => {
        const execution = executeRepairTool(state, name, input, source);
        state = execution.state;
        return execution;
      },
      (status) => statuses.push(status),
    );
    await Promise.resolve();
    await Promise.resolve();

    expect(registerTool).toHaveBeenCalledTimes(8);
    expect(tools.map((tool) => tool.name)).toEqual([
      "get_repair_state",
      "identify_appliance",
      "start_diagnosis",
      "highlight_component",
      "record_check_result",
      "show_repair_step",
      "find_compatible_part",
      "escalate_to_professional",
    ]);
    expect(tools.every((tool) => tool.inputSchema?.["additionalProperties"] === false)).toBe(true);
    expect(statuses).toEqual(["ready"]);

    const executeSignal = new AbortController().signal;
    await tools[1]?.execute({ applianceId: "clunk-wm01" }, { signal: executeSignal });
    await tools[2]?.execute({ symptomId: "will-not-drain" }, { signal: executeSignal });
    expect(state.currentStepId).toBe("prepare-power");
    expect(state.activity.at(-1)?.source).toBe("agent");

    controller?.abort();
    expect(registrationSignals.every((signal) => signal.aborted)).toBe(true);
  });
});
