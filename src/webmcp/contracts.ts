import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import { REPAIR_PACKS } from "@/domain/repairPack";
import type { RepairToolName } from "@/domain/types";

export interface RepairToolContract {
  name: RepairToolName;
  title: string;
  purpose: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  sampleInput: Record<string, unknown>;
  mutatesDiagnosis: boolean;
}

const empty = { type: "object", properties: {}, additionalProperties: false };
const brands = [...new Set(APPLIANCE_CATALOG.map((entry) => entry.brand))];
const kinds = [...new Set(APPLIANCE_CATALOG.map((entry) => entry.kind))];
const packs = [...REPAIR_PACKS.values()];
const symptomIds = [...new Set(packs.map((pack) => pack.symptom.id))];

const repairToolNames: RepairToolName[] = [
  "search_supported_appliances",
  "select_appliance",
  "get_repair_state",
  "start_diagnosis",
  "show_component",
  "record_observation",
  "find_compatible_part",
  "stop_and_escalate",
];

const nullableString = { type: ["string", "null"] };
const capability = {
  type: "string",
  enum: ["purchase-ready", "guided-checks", "verified-part-unavailable"],
};

function stateDerivedId(description: string) {
  return {
    type: "string",
    minLength: 1,
    maxLength: 128,
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    description,
  };
}

const nullableEscalation = {
  anyOf: [
    {
      type: "object",
      properties: {
        reason: {
          type: "string",
          enum: [
            "electrical",
            "burning-smell",
            "hot-water",
            "active-leak",
            "internal-access",
            "unresolved",
          ],
        },
        message: { type: "string" },
      },
      required: ["reason", "message"],
      additionalProperties: false,
    },
    { type: "null" },
  ],
};

const nullableOutcome = {
  anyOf: [
    {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["not-ready", "no-part-needed", "exact", "variant-needed", "professional-only"],
        },
        title: { type: "string" },
        message: { type: "string" },
        part: {
          anyOf: [
            {
              type: "object",
              properties: {
                sku: { type: "string" },
                name: { type: "string" },
                compatibleModel: { type: "string" },
                source: { type: "string" },
                seller: { type: "string" },
                purchaseUrl: { type: "string" },
                price: { type: "string" },
                availability: { type: "string" },
                checkedOn: { type: "string" },
                commerceHandoff: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        provider: { type: "string", const: "Shopify Global Catalog" },
                        protocol: { type: "string", const: "UCP" },
                        endpoint: { type: "string" },
                        agentProfile: { type: "string" },
                        query: { type: "string" },
                        exactSku: { type: "string" },
                        exactOfferCountAtVerification: { type: "integer", minimum: 0 },
                        checkedOn: { type: "string" },
                        liveAvailability: { type: "boolean" },
                        rule: { type: "string" },
                        humanAction: { type: "string" },
                      },
                      required: [
                        "provider",
                        "protocol",
                        "endpoint",
                        "agentProfile",
                        "query",
                        "exactSku",
                        "exactOfferCountAtVerification",
                        "checkedOn",
                        "liveAvailability",
                        "rule",
                        "humanAction",
                      ],
                      additionalProperties: false,
                    },
                    { type: "null" },
                  ],
                },
              },
              required: ["sku", "name", "compatibleModel", "source", "commerceHandoff"],
              additionalProperties: false,
            },
            { type: "null" },
          ],
        },
      },
      required: ["status", "title", "message", "part"],
      additionalProperties: false,
    },
    { type: "null" },
  ],
};

/** The structuredContent shape returned by every in-page Clunk tool. */
export const WEBMCP_TASK_OUTPUT_SCHEMA: Record<string, unknown> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  description:
    "The current bounded repair task after the tool call. nextTools is the authoritative list of actions valid in this phase.",
  properties: {
    ok: { type: "boolean", description: "Whether Clunk accepted and applied the tool call." },
    phase: {
      type: "string",
      enum: ["catalog", "idle", "preparing", "checking", "result", "escalated"],
    },
    handoff: {
      type: "string",
      enum: [
        "select-model",
        "start-diagnosis",
        "human-observation-required",
        "part-lookup-available",
        "outcome-complete",
        "safety-stop",
      ],
    },
    catalog: {
      type: "object",
      properties: {
        supportedModelCount: { type: "integer", minimum: 0 },
        counts: {
          type: "object",
          properties: {
            byKind: { type: "object", additionalProperties: { type: "integer", minimum: 0 } },
            byCapability: {
              type: "object",
              additionalProperties: { type: "integer", minimum: 0 },
            },
          },
          required: ["byKind", "byCapability"],
          additionalProperties: false,
        },
        query: { type: "string" },
        kind: nullableString,
        symptomId: nullableString,
        supportedSymptoms: {
          type: "object",
          additionalProperties: { type: "array", items: { type: "string" } },
        },
        resultCount: { type: "integer", minimum: 0 },
        queryStatus: {
          type: "string",
          enum: ["empty", "serial-number", "exact-code", "exact-family", "partial", "unsupported"],
        },
        guidance: { type: "string" },
        needsCompleteCode: { type: "boolean" },
        variantAmbiguity: { type: "boolean" },
        candidateProductCodes: { type: "array", items: { type: "string" } },
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              applianceId: { type: "string" },
              brand: { type: "string" },
              model: { type: "string" },
              topology: { type: "string" },
              supportedSymptom: { type: "string" },
              capability,
              symptomCoverage: {
                type: "array",
                items: {
                  type: "object",
                  properties: { symptomId: { type: "string" }, capability },
                  required: ["symptomId", "capability"],
                  additionalProperties: false,
                },
              },
              fullCodeRule: { type: "string" },
              source: {
                type: "object",
                properties: { url: { type: "string" }, checkedOn: { type: "string" } },
                required: ["url", "checkedOn"],
                additionalProperties: false,
              },
            },
            required: [
              "applianceId",
              "brand",
              "model",
              "symptomCoverage",
              "fullCodeRule",
              "source",
            ],
            additionalProperties: false,
          },
        },
        modelNumberHandoff: {
          anyOf: [
            {
              type: "object",
              properties: {
                humanAction: { type: "string" },
                agentAction: { type: "string" },
                commonLocations: { type: "array", items: { type: "string" } },
                examples: { type: "array", items: { type: "string" } },
                brandHint: nullableString,
                rejectLabels: { type: "array", items: { type: "string" } },
              },
              required: [
                "humanAction",
                "agentAction",
                "commonLocations",
                "examples",
                "brandHint",
                "rejectLabels",
              ],
              additionalProperties: false,
            },
            { type: "null" },
          ],
        },
      },
      required: [
        "supportedModelCount",
        "query",
        "kind",
        "symptomId",
        "supportedSymptoms",
        "resultCount",
        "results",
        "modelNumberHandoff",
      ],
      additionalProperties: false,
    },
    task: {
      anyOf: [
        {
          type: "object",
          properties: {
            applianceId: { type: "string" },
            appliance: { type: "string" },
            capability,
            supportedSymptoms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  symptomId: { type: "string" },
                  capability,
                  repairPackId: { type: "string" },
                },
                required: ["symptomId", "capability", "repairPackId"],
                additionalProperties: false,
              },
            },
            productCode: nullableString,
            verification: nullableString,
            symptomId: nullableString,
            symptom: nullableString,
            highlightedComponent: {
              type: "object",
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                access: {
                  type: "string",
                  enum: ["visible", "user-accessible", "professional-only"],
                },
              },
              required: ["id", "label", "access"],
              additionalProperties: false,
            },
            currentCheck: {
              anyOf: [
                {
                  type: "object",
                  properties: {
                    checkId: { type: "string" },
                    componentId: { type: "string" },
                    label: { type: "string" },
                    instruction: { type: "string" },
                    stop: { type: "string" },
                    observations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: { resultId: { type: "string" }, label: { type: "string" } },
                        required: ["resultId", "label"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: [
                    "checkId",
                    "componentId",
                    "label",
                    "instruction",
                    "stop",
                    "observations",
                  ],
                  additionalProperties: false,
                },
                { type: "null" },
              ],
            },
            completedObservations: { type: "object", additionalProperties: { type: "string" } },
            outcome: nullableOutcome,
            escalation: nullableEscalation,
          },
          required: [
            "applianceId",
            "appliance",
            "capability",
            "supportedSymptoms",
            "productCode",
            "verification",
            "symptomId",
            "symptom",
            "highlightedComponent",
            "currentCheck",
            "completedObservations",
            "outcome",
            "escalation",
          ],
          additionalProperties: false,
        },
        { type: "null" },
      ],
    },
    nextTools: {
      type: "array",
      description: "Only these currently valid tools should be called next.",
      items: { type: "string", enum: repairToolNames },
    },
  },
  required: ["ok", "phase", "handoff", "catalog", "task", "nextTools"],
  additionalProperties: false,
};

export const REPAIR_TOOL_CONTRACTS: RepairToolContract[] = [
  {
    name: "search_supported_appliances",
    title: "Search supported appliances",
    purpose:
      "Search Clunk's visible source-backed catalog by appliance kind, brand, or full/partial model text. Results include capability and ambiguity guidance. If the person cannot find the number, read modelNumberHandoff, ask them to inspect the common label locations, and reject serial text rather than guessing a suffix.",
    inputSchema: {
      type: "object",
      properties: {
        modelQuery: {
          type: "string",
          maxLength: 64,
          description:
            "Full or partial model text, punctuation-insensitive. Never pass text labeled Serial or S/N.",
        },
        brand: { type: "string", enum: brands },
        kind: { type: "string", enum: kinds },
        symptomId: {
          type: "string",
          enum: symptomIds,
          description:
            "Optional observable problem. When present, return only models with explicit coverage for this problem.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: WEBMCP_TASK_OUTPUT_SCHEMA,
    sampleInput: {
      modelQuery: "GTD42EASJ2WW",
      kind: "dryer",
      symptomId: "not-heating",
    },
    mutatesDiagnosis: false,
  },
  {
    name: "select_appliance",
    title: "Select an exact appliance model",
    purpose:
      "Select an applianceId returned by catalog search for a supported symptom. Include productCode only when the human read the complete model value from the label. symptomId is optional for older callers and otherwise resolves to the catalog-selected or legacy flagship problem.",
    inputSchema: {
      type: "object",
      properties: {
        applianceId: stateDerivedId(
          "Exact catalog ID returned by search_supported_appliances. Do not invent or infer an ID.",
        ),
        productCode: {
          type: "string",
          maxLength: 64,
          description: "Optional complete product code read by the human from the rating label.",
        },
        symptomId: { type: "string", enum: symptomIds },
      },
      required: ["applianceId"],
      additionalProperties: false,
    },
    outputSchema: WEBMCP_TASK_OUTPUT_SCHEMA,
    sampleInput: {
      applianceId: "ge-gtd42easj2ww",
      symptomId: "not-heating",
      productCode: "GTD42EASJ2WW",
    },
    mutatesDiagnosis: true,
  },
  {
    name: "get_repair_state",
    title: "Get repair state",
    purpose:
      "Read only the current catalog task or diagnosis step, including bounded observation choices and the tools available next.",
    inputSchema: empty,
    outputSchema: WEBMCP_TASK_OUTPUT_SCHEMA,
    sampleInput: {},
    mutatesDiagnosis: false,
  },
  {
    name: "start_diagnosis",
    title: "Start the selected diagnosis",
    purpose:
      "When start_diagnosis appears in nextTools, resolve the selected model and observable problem to its exact repair pack, then begin at that pack's safety boundary. Unsupported model/problem combinations are rejected explicitly.",
    inputSchema: {
      type: "object",
      properties: { symptomId: { type: "string", enum: symptomIds } },
      required: ["symptomId"],
      additionalProperties: false,
    },
    outputSchema: WEBMCP_TASK_OUTPUT_SCHEMA,
    sampleInput: { symptomId: "will-not-drain" },
    mutatesDiagnosis: true,
  },
  {
    name: "show_component",
    title: "Show a diagram component",
    purpose:
      "When show_component appears in nextTools, focus a componentId from the current repair state in the shared diagram so the human can inspect the correct visible location.",
    inputSchema: {
      type: "object",
      properties: {
        componentId: stateDerivedId(
          "Component ID returned in the current repair state. Call only when show_component appears in nextTools.",
        ),
      },
      required: ["componentId"],
      additionalProperties: false,
    },
    outputSchema: WEBMCP_TASK_OUTPUT_SCHEMA,
    sampleInput: { componentId: "drain-hose" },
    mutatesDiagnosis: false,
  },
  {
    name: "record_observation",
    title: "Record a human observation",
    purpose:
      "When record_observation appears in nextTools, record task.currentCheck.checkId and one listed resultId explicitly reported by the human. Never infer a physical observation. Hazard results stop the workflow immediately.",
    inputSchema: {
      type: "object",
      properties: {
        checkId: stateDerivedId(
          "Exact task.currentCheck.checkId returned by get_repair_state. Never reuse an earlier check ID.",
        ),
        resultId: stateDerivedId(
          "One resultId from task.currentCheck.observations, reported by the person. Never infer a physical observation.",
        ),
      },
      required: ["checkId", "resultId"],
      additionalProperties: false,
    },
    outputSchema: WEBMCP_TASK_OUTPUT_SCHEMA,
    sampleInput: { checkId: "safety-check", resultId: "safe-ready" },
    mutatesDiagnosis: true,
  },
  {
    name: "find_compatible_part",
    title: "Resolve the part outcome",
    purpose:
      "When find_compatible_part appears in nextTools, resolve the completed observations to one evidence-bounded outcome: no part needed, exact verified part, complete product code required, or professional diagnosis required. Exact outcomes may include a Shopify UCP handoff for live offers; accept only the exact part number Clunk returns.",
    inputSchema: empty,
    outputSchema: WEBMCP_TASK_OUTPUT_SCHEMA,
    sampleInput: {},
    mutatesDiagnosis: true,
  },
  {
    name: "stop_and_escalate",
    title: "Stop and escalate",
    purpose:
      "End the diagnosis at a safety or evidence boundary and show professional-service guidance. Use immediately for reported hazards or unsafe access.",
    inputSchema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          enum: [
            "electrical",
            "burning-smell",
            "hot-water",
            "active-leak",
            "internal-access",
            "unresolved",
          ],
        },
      },
      required: ["reason"],
      additionalProperties: false,
    },
    outputSchema: WEBMCP_TASK_OUTPUT_SCHEMA,
    sampleInput: { reason: "unresolved" },
    mutatesDiagnosis: true,
  },
];

export function getRepairToolContract(name: RepairToolName): RepairToolContract {
  const contract = REPAIR_TOOL_CONTRACTS.find((item) => item.name === name);
  if (!contract) throw new Error(`Missing contract for ${name}.`);
  return contract;
}
