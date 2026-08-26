export type ApplianceId = "clunk-wm01";
export type SymptomId = "will-not-drain";

export type ComponentId =
  | "machine"
  | "drum"
  | "sump"
  | "pump-filter"
  | "drain-pump"
  | "drain-hose"
  | "control-module";

export type CheckId = "prepare-power" | "inspect-drain-hose" | "inspect-pump-filter";

export type ResultId =
  | "acknowledged"
  | "hazard-burning"
  | "hazard-hot-water"
  | "hazard-active-leak"
  | "hose-kinked"
  | "hose-clear"
  | "hose-disconnected"
  | "unsafe-to-reach"
  | "filter-blocked"
  | "filter-clear"
  | "filter-damaged"
  | "unsafe-to-open";

export type CauseId =
  | "blocked-filter"
  | "kinked-hose"
  | "drain-pump-failure"
  | "control-fault";

export type PartId = "cl-pf-220" | "cl-dh-208" | "cl-dp-420";

export type EscalationReason =
  | "electrical"
  | "burning-smell"
  | "hot-water"
  | "active-leak"
  | "internal-access"
  | "unresolved";

export type ActivitySource = "agent" | "human" | "manual" | "system";
export type ActivityOutcome = "accepted" | "rejected";
export type WebMcpStatus = "detecting" | "ready" | "unavailable" | "partial" | "failed";

export type RepairPhase = "idle" | "preparing" | "checking" | "result" | "escalated";

export interface RepairPackResult {
  id: ResultId;
  label: string;
}

export interface RepairPackCheck {
  id: CheckId;
  label: string;
  componentId: ComponentId;
  instruction: string;
  why: string;
  stop: string;
  safetyTags: string[];
  results: RepairPackResult[];
}

export interface RepairPackComponent {
  id: ComponentId;
  label: string;
  description: string;
}

export interface RepairPackCause {
  id: CauseId;
  label: string;
  componentId: ComponentId;
  baseRank: number;
}

export interface RepairPackPart {
  id: PartId;
  componentId: ComponentId;
  name: string;
  sku: string;
  compatibleModel: string;
  effort: string;
  illustrativeCost: "Low" | "Medium" | "High";
  installBoundary: "user-cleanable" | "professional-only";
}

export interface RepairPack {
  id: ApplianceId;
  schemaVersion: number;
  appliance: {
    name: string;
    model: string;
    type: string;
    fictional: true;
  };
  symptom: {
    id: SymptomId;
    label: string;
  };
  components: RepairPackComponent[];
  checks: RepairPackCheck[];
  causes: RepairPackCause[];
  parts: RepairPackPart[];
}

export interface ActivityEvent {
  id: string;
  sequence: number;
  source: ActivitySource;
  action: string;
  arguments: Record<string, unknown>;
  outcome: ActivityOutcome;
  message: string;
}

export interface Escalation {
  reason: EscalationReason;
  message: string;
}

export interface RepairState {
  packId: ApplianceId;
  applianceId: ApplianceId | null;
  symptomId: SymptomId | null;
  phase: RepairPhase;
  currentStepId: CheckId | null;
  highlightedComponentId: ComponentId;
  completedChecks: Partial<Record<CheckId, ResultId>>;
  selectedPartId: PartId | null;
  escalation: Escalation | null;
  webMcpStatus: WebMcpStatus;
  activity: ActivityEvent[];
  sequence: number;
}

export interface RankedCause {
  id: CauseId;
  label: string;
  componentId: ComponentId;
  confidence: "possible" | "likely" | "strong match";
  explanation: string;
  score: number;
}

export interface RepairSnapshot {
  appliance: string | null;
  fictional: true;
  symptom: string | null;
  phase: RepairPhase;
  progress: number;
  currentStep: RepairPackCheck | null;
  highlightedComponent: RepairPackComponent;
  completedChecks: Partial<Record<CheckId, ResultId>>;
  likelyCauses: RankedCause[];
  availablePart: RepairPackPart | null;
  selectedPart: RepairPackPart | null;
  escalation: Escalation | null;
  webMcpStatus: WebMcpStatus;
  validNextActions: string[];
  disclaimer: string;
}

export const REPAIR_TOOL_NAMES = [
  "get_repair_state",
  "identify_appliance",
  "start_diagnosis",
  "highlight_component",
  "record_check_result",
  "show_repair_step",
  "find_compatible_part",
  "escalate_to_professional",
] as const;

export type RepairToolName = (typeof REPAIR_TOOL_NAMES)[number];

export interface ToolExecutionResult {
  ok: boolean;
  state: RepairState;
  message: string;
  snapshot: RepairSnapshot;
}
