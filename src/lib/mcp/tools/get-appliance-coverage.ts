import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import { SYMPTOM_PRESENTATION } from "@/data/symptomCatalog";
import { capabilityLabel } from "@/domain/modelSearch";
import type { SupportedSymptomId } from "@/domain/types";
import { applianceCoverageOutputSchema } from "@/lib/mcp/outputSchemas";

export default defineTool({
  name: "get_appliance_coverage",
  title: "Get appliance coverage",
  description:
    "List every observable problem Clunk covers for one catalog model, with its capability (exact part available, safe checks available, or exact part currently unavailable) and the model source reference.",
  inputSchema: {
    applianceId: z.string().min(1).max(128).describe("Catalog ID returned by search_appliances."),
  },
  outputSchema: applianceCoverageOutputSchema,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ applianceId }) => {
    const entry = APPLIANCE_CATALOG.find((item) => item.id === applianceId);
    if (!entry) throw new ToolError(`Unknown applianceId "${applianceId}".`);
    const coverage = entry.symptomCoverage.map((item) => {
      const presentation = SYMPTOM_PRESENTATION[item.symptomId as SupportedSymptomId];
      return {
        symptomId: item.symptomId,
        title: presentation?.title ?? item.symptomId,
        description: presentation?.description ?? "",
        capability: item.capability,
        capabilityLabel: capabilityLabel(item.capability),
      };
    });
    return {
      content: [
        {
          type: "text",
          text: `${entry.brand} ${entry.model} is covered for ${coverage.length} problem${
            coverage.length === 1 ? "" : "s"
          }: ${coverage.map((item) => item.title).join(", ")}.`,
        },
      ],
      structuredContent: {
        applianceId: entry.id,
        kind: entry.kind,
        brand: entry.brand,
        model: entry.model,
        label: entry.label,
        verifiedProductCodes: entry.verifiedProductCodes,
        productCodePrompt: entry.productCodePrompt,
        modelSource: entry.modelSource,
        coverage,
      },
    };
  },
});
