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
    const stateOutput = (await tools[2]?.execute({})) as {
      structuredContent: Record<string, unknown>;
    };
    const serialized = JSON.stringify(stateOutput.structuredContent);
    expect(serialized.length).toBeLessThan(3800);
    expect(serialized).not.toContain("likelyCauses");
    expect(serialized).not.toContain("catalogResults");
    expect(stateOutput.structuredContent).toMatchObject({
      catalog: {
        supportedModelCount: 163,
        modelNumberHandoff: {
          humanAction: expect.stringContaining("Model"),
          rejectLabels: ["Serial", "S/N"],
        },
      },
    });
    expect(state.activity).toHaveLength(1);
    await tools[1]?.execute({
      applianceId: "lg-wm3400cw",
      productCode: "WM3400CW.ABWEVUS",
    });
    expect(state.applianceId).toBe("lg-wm3400cw");
    expect(state.activity.at(-1)?.source).toBe("agent");
    controller?.abort();
    expect(signals.every((signal) => signal.aborted)).toBe(true);
  });

  it("supports workbenches that invoke execute with only the validated input", async () => {
    const tools: WebMcpTool[] = [];
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: vi.fn(async (tool: WebMcpTool) => {
          tools.push(tool);
        }),
      },
    });
    let state = createInitialRepairState();
    registerClunkTools(
      (name, input, source) => {
        const execution = executeRepairTool(state, name, input, source);
        state = execution.state;
        return execution;
      },
      () => undefined,
      state,
    );

    const search = tools.find((tool) => tool.name === "search_supported_appliances");
    const output = (await search?.execute({
      modelQuery: "GTD42EASJ2WW",
      kind: "dryer",
    })) as { structuredContent: Record<string, unknown> };

    expect(output.structuredContent).toMatchObject({
      ok: true,
      phase: "catalog",
      catalog: {
        queryStatus: "exact-code",
        needsCompleteCode: false,
        results: [
          expect.objectContaining({
            applianceId: "ge-gtd42easj2ww",
            capability: "purchase-ready",
          }),
        ],
      },
    });
    expect(state.activity.at(-1)).toMatchObject({
      action: "search_supported_appliances",
      source: "agent",
    });
  });

  it("discovers and selects the exact model × symptom coverage through WebMCP", async () => {
    const tools: WebMcpTool[] = [];
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: vi.fn(async (tool: WebMcpTool) => tools.push(tool)),
      },
    });
    let state = createInitialRepairState();
    registerClunkTools(
      (name, input, source) => {
        const execution = executeRepairTool(state, name, input, source);
        state = execution.state;
        return execution;
      },
      () => undefined,
      state,
    );

    const search = tools.find((tool) => tool.name === "search_supported_appliances")!;
    const searchOutput = (await search.execute({
      kind: "dryer",
      symptomId: "not-heating",
      modelQuery: "GTD42EASJ2WW",
    })) as { structuredContent: Record<string, unknown> };
    expect(searchOutput.structuredContent).toMatchObject({
      ok: true,
      catalog: {
        resultCount: 1,
        results: [
          {
            applianceId: "ge-gtd42easj2ww",
            supportedSymptom: "not-heating",
            capability: "guided-checks",
            symptomCoverage: expect.arrayContaining([
              expect.objectContaining({
                symptomId: "not-heating",
                capability: "guided-checks",
              }),
            ]),
          },
        ],
      },
    });

    const select = tools.find((tool) => tool.name === "select_appliance")!;
    const selected = (await select.execute({
      applianceId: "ge-gtd42easj2ww",
      productCode: "GTD42EASJ2WW",
      symptomId: "not-heating",
    })) as { structuredContent: Record<string, unknown> };
    expect(selected.structuredContent).toMatchObject({
      ok: true,
      phase: "idle",
      task: {
        symptom: "Electric dryer runs without heat",
        capability: "guided-checks",
      },
    });
    expect(state.packId).toBe("ge-gtd42easj2ww::not-heating");

    const unsupported = (await select.execute({
      applianceId: "maytag-med4500mw",
      symptomId: "not-heating",
    })) as { structuredContent: Record<string, unknown> };
    expect(unsupported.structuredContent).toMatchObject({ ok: false });
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
    state = executeRepairTool(state, "record_observation", {
      checkId: "safety-check",
      resultId: "safe-ready",
    }).state;
    state = executeRepairTool(state, "record_observation", {
      checkId: "inspect-drain-hose",
      resultId: "hose-clear",
    }).state;
    state = executeRepairTool(state, "record_observation", {
      checkId: "inspect-filter",
      resultId: "filter-clear",
    }).state;
    capture(state);
    expect(inventories.at(-1)).toEqual([
      "get_repair_state",
      "show_component",
      "find_compatible_part",
      "stop_and_escalate",
    ]);
  });

  it("removes observation and part tools after a reported hazard", () => {
    const tools: string[] = [];
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: vi.fn(async (tool: WebMcpTool) => {
          tools.push(tool.name);
        }),
      },
    });
    let state = createInitialRepairState();
    state = executeRepairTool(state, "select_appliance", {
      applianceId: "ge-gtd42easj2ww",
      productCode: "GTD42EASJ2WW",
    }).state;
    state = executeRepairTool(state, "start_diagnosis", {
      symptomId: "door-will-not-close",
    }).state;
    state = executeRepairTool(state, "record_observation", {
      checkId: "safety-check",
      resultId: "hazard-burning",
    }).state;
    registerClunkTools(
      (name, input, source) => executeRepairTool(state, name, input, source),
      () => undefined,
      state,
    );
    expect(tools).toEqual(["search_supported_appliances", "select_appliance", "get_repair_state"]);
  });
});
