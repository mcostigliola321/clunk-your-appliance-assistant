import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import { REPAIR_PACKS } from "@/domain/repairPack";
import type { RepairToolName } from "@/domain/types";

import { WEBMCP_TOOL_OUTPUT_SCHEMAS } from "./toolOutputs";

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

function stateDerivedId(description: string) {
  return {
    type: "string",
    minLength: 1,
    maxLength: 128,
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    description,
  };
}

export const REPAIR_TOOL_CONTRACTS: RepairToolContract[] = [
  {
    name: "search_supported_appliances",
    title: "Search supported appliances",
    purpose:
      "Search Clunk's visible source-backed catalog by appliance kind, brand, full/partial model text, or observable problem. Results include capability and ambiguity guidance. If the person cannot find the number, read modelNumberHandoff, ask them to inspect the common label locations, and reject serial text rather than guessing a suffix.",
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
            "Optional observable problem used to filter models before selection. The selected problem is preserved for start_diagnosis.",
        },
      },
      additionalProperties: false,
    },
    outputSchema: WEBMCP_TOOL_OUTPUT_SCHEMAS.search_supported_appliances,
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
      "Select an applianceId returned by catalog search. Include productCode only when the human read the complete model value from the label. symptomId binds the selection to a supported problem when search did not already filter by one.",
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
        symptomId: {
          type: "string",
          enum: symptomIds,
          description:
            "Use only when catalog search did not already set the intended problem; otherwise omit it.",
        },
      },
      required: ["applianceId"],
      additionalProperties: false,
    },
    outputSchema: WEBMCP_TOOL_OUTPUT_SCHEMAS.select_appliance,
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
      "Read the complete current catalog task or diagnosis step, including bounded observation choices and the tools available next.",
    inputSchema: empty,
    outputSchema: WEBMCP_TOOL_OUTPUT_SCHEMAS.get_repair_state,
    sampleInput: {},
    mutatesDiagnosis: false,
  },
  {
    name: "start_diagnosis",
    title: "Start the selected diagnosis",
    purpose:
      "When start_diagnosis appears in nextTools, begin the already-selected model and problem at its safety check. Call select_appliance first; this tool does not choose or change the problem.",
    inputSchema: empty,
    outputSchema: WEBMCP_TOOL_OUTPUT_SCHEMAS.start_diagnosis,
    sampleInput: {},
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
    outputSchema: WEBMCP_TOOL_OUTPUT_SCHEMAS.show_component,
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
    outputSchema: WEBMCP_TOOL_OUTPUT_SCHEMAS.record_observation,
    sampleInput: { checkId: "safety-check", resultId: "safe-ready" },
    mutatesDiagnosis: true,
  },
  {
    name: "find_compatible_part",
    title: "Resolve the part outcome",
    purpose:
      "When find_compatible_part appears in nextTools, resolve the completed observations to one evidence-bounded outcome: no part needed, exact verified part, complete product code required, or professional diagnosis required. Exact outcomes may include a Shopify UCP handoff for live offers; accept only the exact part number Clunk returns.",
    inputSchema: empty,
    outputSchema: WEBMCP_TOOL_OUTPUT_SCHEMAS.find_compatible_part,
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
    outputSchema: WEBMCP_TOOL_OUTPUT_SCHEMAS.stop_and_escalate,
    sampleInput: { reason: "unresolved" },
    mutatesDiagnosis: true,
  },
];

export function getRepairToolContract(name: RepairToolName): RepairToolContract {
  const contract = REPAIR_TOOL_CONTRACTS.find((item) => item.name === name);
  if (!contract) throw new Error(`Missing contract for ${name}.`);
  return contract;
}
