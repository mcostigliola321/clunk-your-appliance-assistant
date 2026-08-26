import type { RepairToolName } from "@/domain/types";

export interface RepairToolContract {
  name: RepairToolName;
  title: string;
  purpose: string;
  inputSchema: Record<string, unknown>;
  sampleInput: Record<string, unknown>;
  mutatesDiagnosis: boolean;
}

const EMPTY_OBJECT_SCHEMA = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

export const REPAIR_TOOL_CONTRACTS: RepairToolContract[] = [
  {
    name: "get_repair_state",
    title: "Get repair state",
    purpose:
      "Read the visible Clunk WM-01 diagnosis state, current safe check, observations, ranked causes, matched fictional part, and valid next actions. Call this before choosing an action.",
    inputSchema: EMPTY_OBJECT_SCHEMA,
    sampleInput: {},
    mutatesDiagnosis: false,
  },
  {
    name: "identify_appliance",
    title: "Identify appliance",
    purpose:
      "Select the only appliance supported by this demo: the fictional Clunk WM-01 washer. Do not use this for a real appliance.",
    inputSchema: {
      type: "object",
      properties: {
        applianceId: {
          type: "string",
          enum: ["clunk-wm01"],
          description: "The fictional demo appliance identifier.",
        },
      },
      required: ["applianceId"],
      additionalProperties: false,
    },
    sampleInput: { applianceId: "clunk-wm01" },
    mutatesDiagnosis: true,
  },
  {
    name: "start_diagnosis",
    title: "Start no-drain diagnosis",
    purpose:
      "Start the bounded will-not-drain flow after identifying the fictional washer. This always begins with the required power and hazard check.",
    inputSchema: {
      type: "object",
      properties: {
        symptomId: {
          type: "string",
          enum: ["will-not-drain"],
          description: "The only symptom supported by the demo.",
        },
      },
      required: ["symptomId"],
      additionalProperties: false,
    },
    sampleInput: { symptomId: "will-not-drain" },
    mutatesDiagnosis: true,
  },
  {
    name: "highlight_component",
    title: "Highlight component",
    purpose:
      "Move the shared diagram highlight to a named fictional component for explanation. This is visual only and never advances the diagnosis.",
    inputSchema: {
      type: "object",
      properties: {
        componentId: {
          type: "string",
          enum: ["machine", "drum", "sump", "pump-filter", "drain-pump", "drain-hose", "control-module"],
          description: "A component in the Clunk WM-01 exploded diagram.",
        },
      },
      required: ["componentId"],
      additionalProperties: false,
    },
    sampleInput: { componentId: "pump-filter" },
    mutatesDiagnosis: false,
  },
  {
    name: "record_check_result",
    title: "Record human observation",
    purpose:
      "Record one physical observation explicitly reported by the human for the current check. Never infer, fabricate, or skip an observation. Hazard observations immediately stop the flow.",
    inputSchema: {
      type: "object",
      properties: {
        checkId: {
          type: "string",
          enum: ["prepare-power", "inspect-drain-hose", "inspect-pump-filter"],
          description: "Must exactly match the current check in get_repair_state.",
        },
        resultId: {
          type: "string",
          enum: [
            "acknowledged",
            "hazard-burning",
            "hazard-hot-water",
            "hazard-active-leak",
            "hose-kinked",
            "hose-clear",
            "hose-disconnected",
            "unsafe-to-reach",
            "filter-blocked",
            "filter-clear",
            "filter-damaged",
            "unsafe-to-open",
          ],
          description: "One listed observation for the current check, stated by the human.",
        },
      },
      required: ["checkId", "resultId"],
      additionalProperties: false,
    },
    sampleInput: { checkId: "prepare-power", resultId: "acknowledged" },
    mutatesDiagnosis: true,
  },
  {
    name: "show_repair_step",
    title: "Show safe check",
    purpose:
      "Show and highlight the current or already completed safe observation step. This cannot unlock future steps or return internal repair instructions.",
    inputSchema: {
      type: "object",
      properties: {
        checkId: {
          type: "string",
          enum: ["prepare-power", "inspect-drain-hose", "inspect-pump-filter"],
          description: "The current or already completed safe check.",
        },
      },
      required: ["checkId"],
      additionalProperties: false,
    },
    sampleInput: { checkId: "prepare-power" },
    mutatesDiagnosis: false,
  },
  {
    name: "find_compatible_part",
    title: "Find fictional compatible part",
    purpose:
      "Reveal the exact fictional Clunk WM-01 demo part supported by completed observations. This makes no real-world compatibility claim and cannot run before evidence exists.",
    inputSchema: EMPTY_OBJECT_SCHEMA,
    sampleInput: {},
    mutatesDiagnosis: true,
  },
  {
    name: "escalate_to_professional",
    title: "Stop and escalate",
    purpose:
      "End the diagnosis at a safe boundary and show professional-service guidance for a hazard, unsafe access, electrical concern, or unresolved internal cause.",
    inputSchema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          enum: ["electrical", "burning-smell", "hot-water", "active-leak", "internal-access", "unresolved"],
          description: "The observed safety or service boundary requiring escalation.",
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
  if (!contract) {
    throw new Error(`Missing WebMCP contract for ${name}.`);
  }
  return contract;
}
