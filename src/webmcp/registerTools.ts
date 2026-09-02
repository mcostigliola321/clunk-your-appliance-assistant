import type { RepairToolName, ToolExecutionResult, WebMcpStatus } from "@/domain/types";
import { getWebMcpTaskSnapshot } from "@/domain/selectors";

import { getRepairToolContract } from "./contracts";

type InvokeTool = (
  name: RepairToolName,
  input: Record<string, unknown>,
  source: "agent",
) => ToolExecutionResult;

function asToolOutput(execution: ToolExecutionResult) {
  return {
    content: [{ type: "text" as const, text: execution.message }],
    structuredContent: { ok: execution.ok, ...getWebMcpTaskSnapshot(execution.state) },
    isError: !execution.ok,
  };
}

export function registerClunkTools(
  invokeTool: InvokeTool,
  onStatus: (status: WebMcpStatus) => void,
): AbortController | null {
  if (!document.modelContext) {
    onStatus("unavailable");
    return null;
  }

  const controller = new AbortController();
  const options = { signal: controller.signal };
  const registrations: Promise<void>[] = [];

  const search = getRepairToolContract("search_supported_appliances");
  registrations.push(
    document.modelContext.registerTool(
      {
        name: search.name,
        title: search.title,
        description: search.purpose,
        inputSchema: search.inputSchema,
        outputSchema: search.outputSchema,
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: async (input) => {
          return asToolOutput(invokeTool("search_supported_appliances", input, "agent"));
        },
      },
      options,
    ),
  );

  const select = getRepairToolContract("select_appliance");
  registrations.push(
    document.modelContext.registerTool(
      {
        name: select.name,
        title: select.title,
        description: select.purpose,
        inputSchema: select.inputSchema,
        outputSchema: select.outputSchema,
        execute: async (input) => {
          return asToolOutput(invokeTool("select_appliance", input, "agent"));
        },
      },
      options,
    ),
  );

  const getState = getRepairToolContract("get_repair_state");
  registrations.push(
    document.modelContext.registerTool(
      {
        name: getState.name,
        title: getState.title,
        description: getState.purpose,
        inputSchema: getState.inputSchema,
        outputSchema: getState.outputSchema,
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: async (input) => {
          return asToolOutput(invokeTool("get_repair_state", input, "agent"));
        },
      },
      options,
    ),
  );

  const start = getRepairToolContract("start_diagnosis");
  registrations.push(
    document.modelContext.registerTool(
      {
        name: start.name,
        title: start.title,
        description: start.purpose,
        inputSchema: start.inputSchema,
        outputSchema: start.outputSchema,
        execute: async (input) => {
          return asToolOutput(invokeTool("start_diagnosis", input, "agent"));
        },
      },
      options,
    ),
  );

  const show = getRepairToolContract("show_component");
  registrations.push(
    document.modelContext.registerTool(
      {
        name: show.name,
        title: show.title,
        description: show.purpose,
        inputSchema: show.inputSchema,
        outputSchema: show.outputSchema,
        execute: async (input) => {
          return asToolOutput(invokeTool("show_component", input, "agent"));
        },
      },
      options,
    ),
  );

  const record = getRepairToolContract("record_observation");
  registrations.push(
    document.modelContext.registerTool(
      {
        name: record.name,
        title: record.title,
        description: record.purpose,
        inputSchema: record.inputSchema,
        outputSchema: record.outputSchema,
        execute: async (input) => {
          return asToolOutput(invokeTool("record_observation", input, "agent"));
        },
      },
      options,
    ),
  );

  const findPart = getRepairToolContract("find_compatible_part");
  registrations.push(
    document.modelContext.registerTool(
      {
        name: findPart.name,
        title: findPart.title,
        description: findPart.purpose,
        inputSchema: findPart.inputSchema,
        outputSchema: findPart.outputSchema,
        execute: async (input) => {
          return asToolOutput(invokeTool("find_compatible_part", input, "agent"));
        },
      },
      options,
    ),
  );

  const escalate = getRepairToolContract("stop_and_escalate");
  registrations.push(
    document.modelContext.registerTool(
      {
        name: escalate.name,
        title: escalate.title,
        description: escalate.purpose,
        inputSchema: escalate.inputSchema,
        outputSchema: escalate.outputSchema,
        execute: async (input) => {
          return asToolOutput(invokeTool("stop_and_escalate", input, "agent"));
        },
      },
      options,
    ),
  );

  void Promise.allSettled(registrations).then((settled) => {
    if (controller.signal.aborted) return;
    const registered = settled.filter((item) => item.status === "fulfilled").length;
    if (registered === registrations.length) onStatus("ready");
    else if (registered > 0) onStatus("partial");
    else onStatus("failed");
  });
  return controller;
}
