import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { createInitialRepairState, executeRepairTool } from "@/domain/engine";
import { getPartOutcome, getRepairSnapshot } from "@/domain/selectors";
import type { RepairState, RepairToolName } from "@/domain/types";
import { diagnosisOutputSchema } from "@/lib/mcp/outputSchemas";

export default defineTool({
  name: "run_diagnosis",
  title: "Run diagnosis",
  description:
    "Replay a person's reported observations through Clunk's deterministic repair engine and return the outcome: no part needed, an exact source-backed part, a request for the complete model code, or a professional-service stop. Only pass results the person actually observed.",
  inputSchema: {
    applianceId: z.string().min(1).max(128).describe("Catalog ID returned by search_appliances."),
    symptomId: z.string().min(1).max(64).describe("Observable problem ID covered for that model."),
    productCode: z
      .string()
      .max(64)
      .optional()
      .describe(
        "The complete model code the person read from the rating label. Required for an exact-part answer.",
      ),
    observations: z
      .array(
        z.object({
          checkId: z.string().min(1).max(128).describe("Check ID from get_repair_guide."),
          resultId: z
            .string()
            .min(1)
            .max(128)
            .describe("Result ID the person observed for that check."),
        }),
      )
      .min(1)
      .max(12)
      .describe("Ordered observations, starting with the guide's first check."),
  },
  outputSchema: diagnosisOutputSchema,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ applianceId, symptomId, productCode, observations }) => {
    let state: RepairState = createInitialRepairState("unavailable");
    const transcript: Array<{ tool: RepairToolName; ok: boolean; message: string }> = [];

    const step = (tool: RepairToolName, input: Record<string, unknown>) => {
      const execution = executeRepairTool(state, tool, input, "agent");
      state = execution.state;
      transcript.push({ tool, ok: execution.ok, message: execution.message });
      return execution.ok;
    };

    if (
      !step("select_appliance", {
        applianceId,
        symptomId,
        ...(productCode ? { productCode } : {}),
      })
    ) {
      return {
        content: [{ type: "text", text: transcript[transcript.length - 1]!.message }],
        structuredContent: { transcript },
        isError: true,
      };
    }
    if (!step("start_diagnosis", { symptomId })) {
      return {
        content: [{ type: "text", text: transcript[transcript.length - 1]!.message }],
        structuredContent: { transcript },
        isError: true,
      };
    }
    for (const observation of observations) {
      if (!state.currentStepId) {
        const message =
          "The diagnosis already reached a terminal result; do not send additional observations.";
        return {
          content: [{ type: "text", text: message }],
          structuredContent: { transcript },
          isError: true,
        };
      }
      if (!step("record_observation", observation)) {
        return {
          content: [{ type: "text", text: transcript[transcript.length - 1]!.message }],
          structuredContent: { transcript },
          isError: true,
        };
      }
    }
    if (state.phase === "result") step("find_compatible_part", {});

    const snapshot = getRepairSnapshot(state);
    const outcome = getPartOutcome(state);
    const part = outcome?.part ?? null;
    const summary = state.escalation
      ? state.escalation.message
      : outcome
        ? `${outcome.title}. ${outcome.message}`
        : snapshot.currentStep
          ? `Next check: ${snapshot.currentStep.label}. ${snapshot.currentStep.instruction}`
          : "Diagnosis in progress.";

    return {
      content: [{ type: "text", text: summary }],
      structuredContent: {
        phase: state.phase,
        summary,
        transcript,
        nextCheck: snapshot.currentStep
          ? {
              id: snapshot.currentStep.id,
              label: snapshot.currentStep.label,
              instruction: snapshot.currentStep.instruction,
              results: snapshot.currentStep.results.map((result) => ({
                id: result.id,
                label: result.label,
              })),
            }
          : null,
        outcome: outcome
          ? {
              status: outcome.status,
              title: outcome.title,
              message: outcome.message,
              requiredProductCode: outcome.requiredProductCode,
              source: outcome.source,
            }
          : null,
        part: part
          ? {
              name: part.name,
              sku: part.sku,
              compatibleModel: part.compatibleModel,
              location: part.location ?? null,
              installBoundary: part.installBoundary,
              source: part.source,
              commerce: part.commerce ?? null,
            }
          : null,
        escalation: state.escalation,
        likelyCauses: snapshot.likelyCauses,
        sources: snapshot.sources,
        disclaimer: snapshot.disclaimer,
      },
    };
  },
});
