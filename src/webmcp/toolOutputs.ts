import { getWebMcpTaskSnapshot } from "@/domain/selectors";
import type { RepairToolName, ToolExecutionResult } from "@/domain/types";

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
const phase = {
  type: "string",
  enum: ["catalog", "idle", "preparing", "checking", "result", "escalated"],
};
const handoff = {
  type: "string",
  enum: [
    "select-model",
    "start-diagnosis",
    "human-observation-required",
    "part-lookup-available",
    "outcome-complete",
    "safety-stop",
  ],
};
const nextTools = {
  type: "array",
  description: "Only these actions are valid in the returned phase.",
  items: { type: "string", enum: repairToolNames },
};

const highlightedComponent = {
  type: "object",
  properties: {
    id: { type: "string" },
    label: { type: "string" },
    access: { type: "string", enum: ["visible", "user-accessible", "professional-only"] },
  },
  required: ["id", "label", "access"],
  additionalProperties: false,
};
const nullableHighlightedComponent = {
  anyOf: [highlightedComponent, { type: "null" }],
};

const currentCheck = {
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
  required: ["checkId", "componentId", "label", "instruction", "stop", "observations"],
  additionalProperties: false,
};
const nullableCurrentCheck = { anyOf: [currentCheck, { type: "null" }] };

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

const supportedSymptoms = {
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
};

const selectionProperties = {
  applianceId: { type: "string" },
  appliance: { type: "string" },
  capability,
  supportedSymptoms,
  productCode: nullableString,
  verification: nullableString,
  symptomId: nullableString,
  symptom: nullableString,
};
const selectionRequired = [
  "applianceId",
  "appliance",
  "capability",
  "supportedSymptoms",
  "productCode",
  "verification",
  "symptomId",
  "symptom",
];
const selection = {
  type: "object",
  properties: selectionProperties,
  required: selectionRequired,
  additionalProperties: false,
};
const nullableSelection = { anyOf: [selection, { type: "null" }] };

const task = {
  type: "object",
  properties: {
    ...selectionProperties,
    highlightedComponent,
    currentCheck: nullableCurrentCheck,
    completedObservations: { type: "object", additionalProperties: { type: "string" } },
    outcome: nullableOutcome,
    escalation: nullableEscalation,
  },
  required: [
    ...selectionRequired,
    "highlightedComponent",
    "currentCheck",
    "completedObservations",
    "outcome",
    "escalation",
  ],
  additionalProperties: false,
};
const nullableTask = { anyOf: [task, { type: "null" }] };

const catalog = {
  type: "object",
  properties: {
    supportedModelCount: { type: "integer", minimum: 0 },
    counts: {
      type: "object",
      properties: {
        byKind: { type: "object", additionalProperties: { type: "integer", minimum: 0 } },
        byCapability: { type: "object", additionalProperties: { type: "integer", minimum: 0 } },
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
        required: ["applianceId", "brand", "model", "symptomCoverage", "fullCodeRule", "source"],
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
};

const commonProperties = {
  ok: { type: "boolean", description: "Whether Clunk accepted and applied the call." },
  phase,
  handoff,
  nextTools,
};
const commonRequired = ["ok", "phase", "handoff", "nextTools"];

function outputSchema(
  description: string,
  properties: Record<string, unknown>,
  required: string[],
): Record<string, unknown> {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    description,
    properties: { ...commonProperties, ...properties },
    required: [...commonRequired, ...required],
    additionalProperties: false,
  };
}

export const WEBMCP_TOOL_OUTPUT_SCHEMAS: Record<RepairToolName, Record<string, unknown>> = {
  search_supported_appliances: outputSchema(
    "Catalog matches and model-number guidance from this search.",
    { catalog },
    ["catalog"],
  ),
  select_appliance: outputSchema(
    "The selected catalog model and its supported problems, or null when selection was rejected.",
    { selection: nullableSelection },
    ["selection"],
  ),
  get_repair_state: outputSchema(
    "The complete current catalog and repair task snapshot.",
    { catalog, task: nullableTask },
    ["catalog", "task"],
  ),
  start_diagnosis: outputSchema(
    "The first safe check and diagram focus for the already-selected model and problem.",
    { currentCheck: nullableCurrentCheck, highlightedComponent: nullableHighlightedComponent },
    ["currentCheck", "highlightedComponent"],
  ),
  show_component: outputSchema(
    "The component now focused in the shared diagram.",
    { highlightedComponent: nullableHighlightedComponent },
    ["highlightedComponent"],
  ),
  record_observation: outputSchema(
    "The next check or terminal state after one person-reported observation.",
    {
      currentCheck: nullableCurrentCheck,
      completedObservations: { type: "object", additionalProperties: { type: "string" } },
      outcome: nullableOutcome,
      escalation: nullableEscalation,
    },
    ["currentCheck", "completedObservations", "outcome", "escalation"],
  ),
  find_compatible_part: outputSchema(
    "The evidence-bounded part, no-part, variant-needed, or professional outcome.",
    { outcome: nullableOutcome },
    ["outcome"],
  ),
  stop_and_escalate: outputSchema(
    "The terminal safety or professional-service escalation.",
    { escalation: nullableEscalation },
    ["escalation"],
  ),
};

function pickSelection(taskSnapshot: ReturnType<typeof getWebMcpTaskSnapshot>["task"]) {
  if (!taskSnapshot) return null;
  return {
    applianceId: taskSnapshot.applianceId,
    appliance: taskSnapshot.appliance,
    capability: taskSnapshot.capability,
    supportedSymptoms: taskSnapshot.supportedSymptoms,
    productCode: taskSnapshot.productCode,
    verification: taskSnapshot.verification,
    symptomId: taskSnapshot.symptomId,
    symptom: taskSnapshot.symptom,
  };
}

export function formatWebMcpToolOutput(name: RepairToolName, execution: ToolExecutionResult) {
  const snapshot = getWebMcpTaskSnapshot(execution.state);
  const common = {
    ok: execution.ok,
    phase: snapshot.phase,
    handoff: snapshot.handoff,
    nextTools: snapshot.nextTools,
  };
  const taskSnapshot = snapshot.task;

  let structuredContent: Record<string, unknown>;
  switch (name) {
    case "search_supported_appliances":
      structuredContent = { ...common, catalog: snapshot.catalog };
      break;
    case "select_appliance":
      structuredContent = { ...common, selection: pickSelection(taskSnapshot) };
      break;
    case "get_repair_state":
      structuredContent = { ...common, catalog: snapshot.catalog, task: taskSnapshot };
      break;
    case "start_diagnosis":
      structuredContent = {
        ...common,
        currentCheck: taskSnapshot?.currentCheck ?? null,
        highlightedComponent: taskSnapshot?.highlightedComponent ?? null,
      };
      break;
    case "show_component":
      structuredContent = {
        ...common,
        highlightedComponent: taskSnapshot?.highlightedComponent ?? null,
      };
      break;
    case "record_observation":
      structuredContent = {
        ...common,
        currentCheck: taskSnapshot?.currentCheck ?? null,
        completedObservations: taskSnapshot?.completedObservations ?? {},
        outcome: taskSnapshot?.outcome ?? null,
        escalation: taskSnapshot?.escalation ?? null,
      };
      break;
    case "find_compatible_part":
      structuredContent = { ...common, outcome: taskSnapshot?.outcome ?? null };
      break;
    case "stop_and_escalate":
      structuredContent = { ...common, escalation: taskSnapshot?.escalation ?? null };
      break;
  }

  return {
    content: [{ type: "text" as const, text: execution.message }],
    structuredContent,
    isError: !execution.ok,
  };
}
