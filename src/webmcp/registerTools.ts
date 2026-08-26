import type { ToolExecutionResult, WebMcpStatus } from "@/domain/types";

import { getRepairToolContract } from "./contracts";

type InvokeTool = (
  name: Parameters<typeof getRepairToolContract>[0],
  input?: Record<string, unknown>,
  source?: "agent",
) => ToolExecutionResult;

function asToolOutput(execution: ToolExecutionResult) {
  return {
    ok: execution.ok,
    message: execution.message,
    repairState: execution.snapshot,
  };
}

function assertNotAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new DOMException("The WebMCP tool call was cancelled.", "AbortError");
  }
}

export function registerClunkTools(
  invokeTool: InvokeTool,
  onStatus: (status: WebMcpStatus) => void,
): AbortController | null {
  if (!document.modelContext) {
    onStatus("unavailable");
    return null;
  }

  const registrationController = new AbortController();
  const registrationOptions = { signal: registrationController.signal };
  const getState = getRepairToolContract("get_repair_state");
  const identify = getRepairToolContract("identify_appliance");
  const start = getRepairToolContract("start_diagnosis");
  const highlight = getRepairToolContract("highlight_component");
  const record = getRepairToolContract("record_check_result");
  const showStep = getRepairToolContract("show_repair_step");
  const findPart = getRepairToolContract("find_compatible_part");
  const escalate = getRepairToolContract("escalate_to_professional");

  const registrations = [
    document.modelContext.registerTool(
      {
        name: getState.name,
        title: getState.title,
        description: getState.purpose,
        inputSchema: getState.inputSchema,
        annotations: { readOnlyHint: true },
        execute: async (input, { signal }) => {
          assertNotAborted(signal);
          return asToolOutput(invokeTool("get_repair_state", input, "agent"));
        },
      },
      registrationOptions,
    ),
    document.modelContext.registerTool(
      {
        name: identify.name,
        title: identify.title,
        description: identify.purpose,
        inputSchema: identify.inputSchema,
        execute: async (input, { signal }) => {
          assertNotAborted(signal);
          return asToolOutput(invokeTool("identify_appliance", input, "agent"));
        },
      },
      registrationOptions,
    ),
    document.modelContext.registerTool(
      {
        name: start.name,
        title: start.title,
        description: start.purpose,
        inputSchema: start.inputSchema,
        execute: async (input, { signal }) => {
          assertNotAborted(signal);
          return asToolOutput(invokeTool("start_diagnosis", input, "agent"));
        },
      },
      registrationOptions,
    ),
    document.modelContext.registerTool(
      {
        name: highlight.name,
        title: highlight.title,
        description: highlight.purpose,
        inputSchema: highlight.inputSchema,
        execute: async (input, { signal }) => {
          assertNotAborted(signal);
          return asToolOutput(invokeTool("highlight_component", input, "agent"));
        },
      },
      registrationOptions,
    ),
    document.modelContext.registerTool(
      {
        name: record.name,
        title: record.title,
        description: record.purpose,
        inputSchema: record.inputSchema,
        execute: async (input, { signal }) => {
          assertNotAborted(signal);
          return asToolOutput(invokeTool("record_check_result", input, "agent"));
        },
      },
      registrationOptions,
    ),
    document.modelContext.registerTool(
      {
        name: showStep.name,
        title: showStep.title,
        description: showStep.purpose,
        inputSchema: showStep.inputSchema,
        execute: async (input, { signal }) => {
          assertNotAborted(signal);
          return asToolOutput(invokeTool("show_repair_step", input, "agent"));
        },
      },
      registrationOptions,
    ),
    document.modelContext.registerTool(
      {
        name: findPart.name,
        title: findPart.title,
        description: findPart.purpose,
        inputSchema: findPart.inputSchema,
        execute: async (input, { signal }) => {
          assertNotAborted(signal);
          return asToolOutput(invokeTool("find_compatible_part", input, "agent"));
        },
      },
      registrationOptions,
    ),
    document.modelContext.registerTool(
      {
        name: escalate.name,
        title: escalate.title,
        description: escalate.purpose,
        inputSchema: escalate.inputSchema,
        execute: async (input, { signal }) => {
          assertNotAborted(signal);
          return asToolOutput(invokeTool("escalate_to_professional", input, "agent"));
        },
      },
      registrationOptions,
    ),
  ];

  void Promise.allSettled(registrations).then((settled) => {
    if (registrationController.signal.aborted) return;
    const registeredCount = settled.filter((item) => item.status === "fulfilled").length;
    if (registeredCount === registrations.length) onStatus("ready");
    else if (registeredCount > 0) onStatus("partial");
    else onStatus("failed");
  });

  return registrationController;
}
