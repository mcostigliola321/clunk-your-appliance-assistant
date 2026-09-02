import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { getBrandIdentifierHint, getModelNumberGuide } from "@/data/modelNumberGuides";
import type { ApplianceKind, BrandName, WasherLoadStyle } from "@/domain/types";
import { modelNumberOutputSchema } from "@/lib/mcp/outputSchemas";

const KINDS = ["washer", "dishwasher", "dryer", "refrigerator"] as const;

export default defineTool({
  name: "find_model_number",
  title: "Find the model number",
  description:
    "Return manufacturer-backed rating-label locations, safety notes, example identifiers, and brand-specific suffix hints so the person can read their complete model code. Clunk never infers the code.",
  inputSchema: {
    kind: z.enum(KINDS).describe("Appliance category."),
    loadStyle: z
      .enum(["front-load", "top-load"])
      .optional()
      .describe("Washer load style, when known."),
    brand: z.string().max(40).optional().describe("Brand name, for suffix guidance."),
  },
  outputSchema: modelNumberOutputSchema,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ kind, loadStyle, brand }) => {
    const guide = getModelNumberGuide(kind as ApplianceKind, loadStyle as WasherLoadStyle);
    const brandHint = getBrandIdentifierHint((brand as BrandName | undefined) ?? null);
    return {
      content: [
        {
          type: "text",
          text: `${guide.title}. ${guide.safety} ${guide.locations
            .map((location) => `${location.label}: ${location.instruction}`)
            .join(" ")}${brandHint ? ` ${brandHint}` : ""}`,
        },
      ],
      structuredContent: {
        kind: guide.kind,
        title: guide.title,
        safety: guide.safety,
        locations: guide.locations,
        examples: guide.examples,
        brandHint,
        sources: guide.sources,
      },
    };
  },
});
