import { z } from "zod";

const applianceKindSchema = z.enum(["washer", "dishwasher", "dryer", "refrigerator"]);
const capabilitySchema = z.enum(["purchase-ready", "guided-checks", "verified-part-unavailable"]);

const sourceReferenceSchema = z.object({
  id: z.string(),
  kind: z.enum([
    "manufacturer-model",
    "manufacturer-troubleshooting",
    "manufacturer-part",
    "authorized-parts",
  ]),
  title: z.string(),
  url: z.url(),
  publisher: z.string(),
  appliesTo: z.string(),
  lastVerified: z.string(),
});

const catalogCoverageSchema = z.object({
  symptomId: z.string(),
  capability: capabilitySchema,
  capabilityLabel: z.string(),
});

export const searchAppliancesOutputSchema = {
  status: z.string(),
  guidance: z.string(),
  matchCount: z.number().int().nonnegative(),
  results: z.array(
    z.object({
      applianceId: z.string(),
      kind: applianceKindSchema,
      brand: z.string(),
      model: z.string(),
      label: z.string(),
      verifiedProductCodes: z.array(z.string()),
      productCodePrompt: z.string(),
      coverage: z.array(catalogCoverageSchema),
    }),
  ),
};

export const applianceCoverageOutputSchema = {
  applianceId: z.string(),
  kind: applianceKindSchema,
  brand: z.string(),
  model: z.string(),
  label: z.string(),
  verifiedProductCodes: z.array(z.string()),
  productCodePrompt: z.string(),
  modelSource: sourceReferenceSchema,
  coverage: z.array(
    z.object({
      symptomId: z.string(),
      title: z.string(),
      description: z.string(),
      capability: capabilitySchema,
      capabilityLabel: z.string(),
    }),
  ),
};

export const repairGuideOutputSchema = {
  packId: z.string(),
  appliance: z.object({
    kind: applianceKindSchema,
    brand: z.string(),
    model: z.string(),
    noun: z.string(),
    capability: capabilitySchema,
  }),
  symptom: z.object({ id: z.string(), label: z.string(), shortLabel: z.string() }),
  productCodePrompt: z.string(),
  verifiedProductCodes: z.array(z.string()),
  components: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string(),
      access: z.enum(["visible", "user-accessible", "professional-only"]),
    }),
  ),
  checks: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      componentId: z.string(),
      instruction: z.string(),
      why: z.string(),
      stop: z.string(),
      safetyTags: z.array(z.string()),
      results: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          effect: z.enum([
            "continue",
            "no-part-needed",
            "part-candidate",
            "professional-only",
            "hazard",
          ]),
          nextCheckId: z.string().nullable(),
        }),
      ),
    }),
  ),
  sources: z.array(sourceReferenceSchema),
};

export const modelNumberOutputSchema = {
  kind: applianceKindSchema,
  title: z.string(),
  safety: z.string(),
  locations: z.array(z.object({ id: z.string(), label: z.string(), instruction: z.string() })),
  examples: z.array(z.string()),
  brandHint: z.string().nullable(),
  sources: z.array(z.object({ title: z.string(), url: z.url(), retrieved: z.string() })),
};

export const diagnosisOutputSchema = {
  phase: z.enum(["catalog", "idle", "preparing", "checking", "result", "escalated"]),
  summary: z.string(),
  transcript: z.array(
    z.object({
      tool: z.enum([
        "search_supported_appliances",
        "select_appliance",
        "get_repair_state",
        "start_diagnosis",
        "show_component",
        "record_observation",
        "find_compatible_part",
        "stop_and_escalate",
      ]),
      ok: z.boolean(),
      message: z.string(),
    }),
  ),
  nextCheck: z
    .object({
      id: z.string(),
      label: z.string(),
      instruction: z.string(),
      results: z.array(z.object({ id: z.string(), label: z.string() })),
    })
    .nullable(),
  outcome: z
    .object({
      status: z.enum([
        "not-ready",
        "no-part-needed",
        "exact",
        "variant-needed",
        "professional-only",
      ]),
      title: z.string(),
      message: z.string(),
      requiredProductCode: z.string().nullable(),
      source: sourceReferenceSchema.nullable(),
    })
    .nullable(),
  part: z
    .object({
      name: z.string(),
      sku: z.string(),
      compatibleModel: z.string(),
      location: z.string().nullable(),
      installBoundary: z.enum(["user-replaceable", "professional-only"]),
      source: sourceReferenceSchema,
      commerce: z
        .object({
          provider: z.literal("shopify-global-catalog"),
          protocol: z.literal("UCP"),
          query: z.string(),
          exactSku: z.string(),
          offerCountAtVerification: z.number().int().nonnegative(),
          lastVerified: z.string(),
        })
        .nullable(),
    })
    .nullable(),
  escalation: z
    .object({
      reason: z.enum([
        "electrical",
        "burning-smell",
        "hot-water",
        "active-leak",
        "internal-access",
        "unresolved",
      ]),
      message: z.string(),
    })
    .nullable(),
  likelyCauses: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      componentId: z.string(),
      confidence: z.enum(["possible", "likely", "strong match"]),
      explanation: z.string(),
      score: z.number(),
    }),
  ),
  sources: z.array(sourceReferenceSchema),
  disclaimer: z.string(),
};
