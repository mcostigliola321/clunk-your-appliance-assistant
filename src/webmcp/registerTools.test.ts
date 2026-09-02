import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createInitialRepairState, executeRepairTool } from "@/domain/engine";
import type { RepairState, WebMcpStatus } from "@/domain/types";

import { WEBMCP_TASK_OUTPUT_SCHEMA } from "./contracts";
import { registerClunkTools } from "./registerTools";

const COMPLETE_TOOL_INVENTORY = [
  "search_supported_appliances",
  "select_appliance",
  "get_repair_state",
  "start_diagnosis",
  "show_component",
  "record_observation",
  "find_compatible_part",
  "stop_and_escalate",
];
const outputContract = z.fromJSONSchema(WEBMCP_TASK_OUTPUT_SCHEMA);

describe("stable WebMCP registration", () => {
  afterEach(() => Reflect.deleteProperty(document, "modelContext"));

  it("falls back cleanly when WebMCP is unavailable", () => {
    const statuses: WebMcpStatus[] = [];
    const state = createInitialRepairState();
    const controller = registerClunkTools(
      (name, input, source) => executeRepairTool(state, name, input, source),
      (status) => statuses.push(status),
    );
    expect(controller).toBeNull();
    expect(statuses).toEqual(["unavailable"]);
  });

  it("registers the complete discoverable workflow with output schemas and aborts the group", async () => {
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
    );
    await Promise.resolve();
    expect(tools.map((tool) => tool.name)).toEqual(COMPLETE_TOOL_INVENTORY);
    expect(tools.every((tool) => tool.outputSchema === WEBMCP_TASK_OUTPUT_SCHEMA)).toBe(true);

    const selectSchema = tools.find((tool) => tool.name === "select_appliance")?.inputSchema as {
      properties: { applianceId: Record<string, unknown> };
    };
    expect(selectSchema.properties.applianceId).toMatchObject({
      type: "string",
      maxLength: 128,
      description: expect.stringContaining("returned by search_supported_appliances"),
    });
    expect(selectSchema.properties.applianceId).not.toHaveProperty("enum");

    const stateOutput = (await tools[2]?.execute({})) as {
      structuredContent: Record<string, unknown>;
    };
    const serialized = JSON.stringify(stateOutput.structuredContent);
    expect(serialized.length).toBeLessThan(4200);
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
    expect(outputContract.safeParse(stateOutput.structuredContent).success).toBe(true);
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
      applianceId: "bosch-b36ct81ens07",
      symptomId: "is-leaking",
    })) as { structuredContent: Record<string, unknown> };
    expect(unsupported.structuredContent).toMatchObject({ ok: false });
  });

  it("keeps all tools discoverable while nextTools advances through the repair phases", async () => {
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
    );

    const execute = async (name: string, input: Record<string, unknown> = {}) => {
      const tool = tools.find((candidate) => candidate.name === name)!;
      const result = (await tool.execute(input)) as {
        structuredContent: Record<string, unknown>;
      };
      expect(outputContract.safeParse(result.structuredContent).success).toBe(true);
      return result;
    };

    expect(tools.map((tool) => tool.name)).toEqual(COMPLETE_TOOL_INVENTORY);
    expect((await execute("get_repair_state")).structuredContent["nextTools"]).toEqual([
      "get_repair_state",
      "search_supported_appliances",
      "select_appliance",
    ]);
    expect(
      (
        await execute("select_appliance", {
          applianceId: "ge-gtd42easj2ww",
          productCode: "GTD42EASJ2WW",
          symptomId: "door-will-not-close",
        })
      ).structuredContent["nextTools"],
    ).toContain("start_diagnosis");
    expect(
      (await execute("start_diagnosis", { symptomId: "door-will-not-close" })).structuredContent[
        "nextTools"
      ],
    ).toContain("record_observation");

    await execute("record_observation", { checkId: "safety-check", resultId: "safe-ready" });
    const result = await execute("record_observation", {
      checkId: "inspect-door-strike",
      resultId: "strike-broken",
    });
    expect(result.structuredContent["nextTools"]).toContain("find_compatible_part");
    const outcome = await execute("find_compatible_part");
    expect(outcome.structuredContent).toMatchObject({
      task: { outcome: { status: "exact", part: { sku: "WE01M10007" } } },
    });
  });

  it("keeps terminal tools discoverable but rejects unsafe post-hazard advancement", async () => {
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
    );
    expect(tools.map((tool) => tool.name)).toEqual(COMPLETE_TOOL_INVENTORY);

    const stateTool = tools.find((tool) => tool.name === "get_repair_state")!;
    const terminalState = (await stateTool.execute({})) as {
      structuredContent: Record<string, unknown>;
    };
    expect(outputContract.safeParse(terminalState.structuredContent).success).toBe(true);
    expect(terminalState.structuredContent["nextTools"]).toEqual([
      "get_repair_state",
      "search_supported_appliances",
      "select_appliance",
    ]);

    const findPart = tools.find((tool) => tool.name === "find_compatible_part")!;
    const rejected = (await findPart.execute({})) as {
      isError: boolean;
      structuredContent: Record<string, unknown>;
    };
    expect(outputContract.safeParse(rejected.structuredContent).success).toBe(true);
    expect(rejected).toMatchObject({ isError: true, structuredContent: { ok: false } });
  });
});
