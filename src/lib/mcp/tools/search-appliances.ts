import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import { analyzeModelQuery, capabilityLabel } from "@/domain/modelSearch";
import { getSymptomCoverage } from "@/domain/repairPack";
import type { ApplianceKind, BrandName, SupportedSymptomId } from "@/domain/types";
import { searchAppliancesOutputSchema } from "@/lib/mcp/outputSchemas";

const KINDS = ["washer", "dishwasher", "dryer", "refrigerator"] as const;

export default defineTool({
  name: "search_appliances",
  title: "Search supported appliances",
  description:
    "Search Clunk's bounded catalog of source-backed U.S. appliance models by model text, category, or brand. Returns catalog IDs, verified model codes, and per-problem capability. Never guesses a nearest model.",
  inputSchema: {
    query: z
      .string()
      .max(64)
      .optional()
      .describe("Model text from the appliance rating label, e.g. 'WM3400CW' or 'GTD42EASJ2WW'."),
    kind: z.enum(KINDS).optional().describe("Restrict results to one appliance category."),
    brand: z.string().max(40).optional().describe("Restrict results to one brand name."),
    symptomId: z
      .string()
      .max(64)
      .optional()
      .describe("Only return models that Clunk covers for this observable problem."),
  },
  outputSchema: searchAppliancesOutputSchema,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, kind, brand, symptomId }) => {
    const analysis = analyzeModelQuery(
      (query ?? "").trim(),
      (brand as BrandName | undefined) ?? null,
      (kind as ApplianceKind | undefined) ?? null,
    );
    if (analysis.status === "serial-number") {
      return { content: [{ type: "text", text: analysis.guidance }], isError: true };
    }
    const matches = symptomId
      ? analysis.matches.filter((entry) =>
          getSymptomCoverage(entry.id, symptomId as SupportedSymptomId),
        )
      : analysis.matches;
    const results = matches.slice(0, 25).map((entry) => ({
      applianceId: entry.id,
      kind: entry.kind,
      brand: entry.brand,
      model: entry.model,
      label: entry.label,
      verifiedProductCodes: entry.verifiedProductCodes,
      productCodePrompt: entry.productCodePrompt,
      coverage: entry.symptomCoverage.map((coverage) => ({
        symptomId: coverage.symptomId,
        capability: coverage.capability,
        capabilityLabel: capabilityLabel(coverage.capability),
      })),
    }));
    return {
      content: [
        {
          type: "text",
          text: `${results.length} of ${matches.length} matches shown out of ${APPLIANCE_CATALOG.length} supported models. ${analysis.guidance}`,
        },
      ],
      structuredContent: {
        status: analysis.status,
        guidance: analysis.guidance,
        matchCount: matches.length,
        results,
      },
    };
  },
});
