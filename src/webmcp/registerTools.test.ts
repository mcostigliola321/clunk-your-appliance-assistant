import { afterEach, describe, expect, it, vi } from "vitest";

import { createInitialRepairState, executeRepairTool } from "@/domain/engine";
import type { RepairState, WebMcpStatus } from "@/domain/types";

import { registerClunkTools } from "./registerTools";

describe("state-dependent WebMCP registration", () => {
  afterEach(() => Reflect.deleteProperty(document, "modelContext"));

  it("falls back cleanly when WebMCP is unavailable", () => {
    const statuses: WebMcpStatus[] = [];
    const state = createInitialRepairState();
    const controller = registerClunkTools(
      (name, input, source) => executeRepairTool(state, name, input, source),
      (status) => statuses.push(status),
      state,
    );
    expect(controller).toBeNull();
    expect(statuses).toEqual(["unavailable"]);
  });

  it("registers only tools useful in the current state and aborts the group", async () => {
    const tools: WebMcpTool[] = [];
    const signals: AbortSignal[] = [];
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: vi.fn(async (tool: WebMcpTool, options?: WebMcpRegisterToolOptions) => {
          tools.push(tool);
          if (options?.signal) signals.push(options.signal);
        }),
      },
    });
    let state: RepairState = createInitialRepairState();
    const controller = registerClunkTools(
      (name, input, source) => {
        const execution = executeRepairTool(state, name, input, source);
        state = execution.state;
        return execution;
      },
      () => undefined,
      state,
    );
    await Promise.resolve();
    expect(tools.map((tool) => tool.name)).toEqual([
      "search_supported_appliances",
      "select_appliance",
      "get_repair_state",
    ]);
    const executeSignal = new AbortController().signal;
    await tools[1]?.execute(
      { applianceId: "lg-wm3400cw", productCode: "WM3400CW.ABWEVUS" },
      { signal: executeSignal },
    );
    expect(state.applianceId).toBe("lg-wm3400cw");
    expect(state.activity.at(-1)?.source).toBe("agent");
    controller?.abort();
    expect(signals.every((signal) => signal.aborted)).toBe(true);
  });

  it("changes inventory between selected, active, and result states", () => {
    const inventories: string[][] = [];
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: vi.fn(async (tool: WebMcpTool) => {
          (inventories.at(-1) ?? []).push(tool.name);
        }),
      },
    });
    const capture = (state: RepairState) => {
      inventories.push([]);
      registerClunkTools(
        (name, input, source) => executeRepairTool(state, name, input, source),
        () => undefined,
        state,
      );
    };
    let state = createInitialRepairState();
    state = executeRepairTool(state, "select_appliance", { applianceId: "lg-wm3400cw" }).state;
    capture(state);
    expect(inventories.at(-1)).toEqual([
      "search_supported_appliances",
      "select_appliance",
      "get_repair_state",
      "start_diagnosis",
    ]);
    state = executeRepairTool(state, "start_diagnosis", { symptomId: "will-not-drain" }).state;
    capture(state);
    expect(inventories.at(-1)).toEqual([
      "get_repair_state",
      "show_component",
      "record_observation",
      "stop_and_escalate",
    ]);
  });
});
