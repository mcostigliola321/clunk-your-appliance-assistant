import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import { REPAIR_PACKS } from "@/domain/repairPack";
import type { RepairToolName } from "@/domain/types";

export interface RepairToolContract {
  name: RepairToolName;
  title: string;
  purpose: string;
  inputSchema: Record<string, unknown>;
  sampleInput: Record<string, unknown>;
  mutatesDiagnosis: boolean;
}

const empty = { type: "object", properties: {}, additionalProperties: false };
const brands = [...new Set(APPLIANCE_CATALOG.map((entry) => entry.brand))];
const kinds = [...new Set(APPLIANCE_CATALOG.map((entry) => entry.kind))];
const packs = [...REPAIR_PACKS.values()];
const symptomIds = [...new Set(packs.map((pack) => pack.symptom.id))];
const componentIds = [...new Set(packs.flatMap((pack) => pack.components.map((item) => item.id)))];
const checkIds = [...new Set(packs.flatMap((pack) => pack.checks.map((item) => item.id)))];
const resultIds = [
  ...new Set(
    packs.flatMap((pack) => pack.checks.flatMap((check) => check.results.map((item) => item.id))),
  ),
];

export const REPAIR_TOOL_CONTRACTS: RepairToolContract[] = [
  {
    name: "search_supported_appliances",
    title: "Search supported appliances",
    purpose:
      "Search Clunk's visible source-backed catalog by appliance kind, brand, or model text. Use a returned applianceId for exact selection; an empty result means the model is unsupported.",
    inputSchema: {
      type: "object",
      properties: {
        modelQuery: {
          type: "string",
          maxLength: 64,
          description: "Full or partial model text, such as GTD42EASJ2WW or GFW550SSN0WW.",
        },
        brand: { type: "string", enum: brands },
        kind: { type: "string", enum: kinds },
      },
      additionalProperties: false,
    },
    sampleInput: { modelQuery: "GTD42EASJ2WW", kind: "dryer" },
    mutatesDiagnosis: false,
  },
  {
    name: "select_appliance",
    title: "Select an exact appliance model",
    purpose:
      "Select an applianceId returned by catalog search. Include the complete productCode exactly as the human read it from the appliance label when available.",
    inputSchema: {
      type: "object",
      properties: {
        applianceId: { type: "string", enum: APPLIANCE_CATALOG.map((entry) => entry.id) },
        productCode: {
          type: "string",
          maxLength: 64,
          description: "Optional complete product code read by the human from the rating label.",
        },
      },
      required: ["applianceId"],
      additionalProperties: false,
    },
    sampleInput: { applianceId: "ge-gtd42easj2ww", productCode: "GTD42EASJ2WW" },
    mutatesDiagnosis: true,
  },
  {
    name: "get_repair_state",
    title: "Get repair state",
    purpose:
      "Read only the current catalog task or diagnosis step, including bounded observation choices and the tools available next.",
    inputSchema: empty,
    sampleInput: {},
    mutatesDiagnosis: false,
  },
  {
    name: "start_diagnosis",
    title: "Start the selected diagnosis",
    purpose:
      "Begin the selected model's supported symptom path. This always starts with a deterministic safety boundary.",
    inputSchema: {
      type: "object",
      properties: { symptomId: { type: "string", enum: symptomIds } },
      required: ["symptomId"],
      additionalProperties: false,
    },
    sampleInput: { symptomId: "will-not-drain" },
    mutatesDiagnosis: true,
  },
  {
    name: "show_component",
    title: "Show a diagram component",
    purpose:
      "Focus a labeled component in the shared diagram so the human can inspect the correct visible location.",
    inputSchema: {
      type: "object",
      properties: {
        componentId: {
          type: "string",
          enum: componentIds,
        },
      },
      required: ["componentId"],
      additionalProperties: false,
    },
    sampleInput: { componentId: "drain-hose" },
    mutatesDiagnosis: false,
  },
  {
    name: "record_observation",
    title: "Record a human observation",
    purpose:
      "Record one bounded physical observation explicitly reported by the human for the current check. Hazard results stop the workflow immediately.",
    inputSchema: {
      type: "object",
      properties: {
        checkId: {
          type: "string",
          enum: checkIds,
        },
        resultId: {
          type: "string",
          enum: resultIds,
        },
      },
      required: ["checkId", "resultId"],
      additionalProperties: false,
    },
    sampleInput: { checkId: "safety-check", resultId: "safe-ready" },
    mutatesDiagnosis: true,
  },
  {
    name: "find_compatible_part",
    title: "Resolve the part outcome",
    purpose:
      "Resolve the completed observations to one evidence-bounded outcome: no part needed, exact verified part, complete product code required, or professional diagnosis required.",
    inputSchema: empty,
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
    sampleInput: { reason: "unresolved" },
    mutatesDiagnosis: true,
  },
];

export function getRepairToolContract(name: RepairToolName): RepairToolContract {
  const contract = REPAIR_TOOL_CONTRACTS.find((item) => item.name === name);
  if (!contract) throw new Error(`Missing contract for ${name}.`);
  return contract;
}
