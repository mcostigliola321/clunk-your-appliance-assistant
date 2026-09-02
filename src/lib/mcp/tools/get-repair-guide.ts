import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { resolveRepairPack } from "@/domain/repairPack";
import type { ApplianceId, SupportedSymptomId } from "@/domain/types";
import { repairGuideOutputSchema } from "@/lib/mcp/outputSchemas";

export default defineTool({
  name: "get_repair_guide",
  title: "Get repair guide",
  description:
    "Return the deterministic, source-backed guide for one model and problem: the ordered safe checks a person can perform, the possible results of each check, the visible components, and the official source references. Physical observation always stays with the person.",
  inputSchema: {
    applianceId: z.string().min(1).max(128).describe("Catalog ID returned by search_appliances."),
    symptomId: z
      .string()
      .min(1)
      .max(64)
      .describe("Observable problem ID returned by get_appliance_coverage."),
  },
  outputSchema: repairGuideOutputSchema,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ applianceId, symptomId }) => {
    const pack = resolveRepairPack(applianceId as ApplianceId, symptomId as SupportedSymptomId);
    if (!pack)
      throw new ToolError(
        `Clunk does not cover "${applianceId}" for "${symptomId}". Call get_appliance_coverage for the supported problems.`,
      );
    return {
      content: [
        {
          type: "text",
          text: `${pack.appliance.brand} ${pack.appliance.model} — ${pack.symptom.label}. ${pack.checks.length} ordered safe checks, starting with "${pack.checks[0]?.label}". Ask the person to perform each check and report the observed result ID, then call run_diagnosis.`,
        },
      ],
      structuredContent: {
        packId: pack.id,
        appliance: {
          kind: pack.appliance.kind,
          brand: pack.appliance.brand,
          model: pack.appliance.model,
          noun: pack.appliance.noun,
          capability: pack.appliance.capability,
        },
        symptom: pack.symptom,
        productCodePrompt: pack.productCodePrompt,
        verifiedProductCodes: pack.verifiedProductCodes,
        components: pack.components.map((component) => ({
          id: component.id,
          label: component.label,
          description: component.description,
          access: component.access,
        })),
        checks: pack.checks.map((check) => ({
          id: check.id,
          label: check.label,
          componentId: check.componentId,
          instruction: check.instruction,
          why: check.why,
          stop: check.stop,
          safetyTags: check.safetyTags,
          results: check.results.map((result) => ({
            id: result.id,
            label: result.label,
            effect: result.effect,
            nextCheckId: result.nextCheckId ?? null,
          })),
        })),
        sources: pack.sources,
      },
    };
  },
});
