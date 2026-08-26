export type ApplianceId = string;
export type SymptomId = "will-not-drain";

export type ComponentId =
  "machine" | "drum" | "sump" | "pump-filter" | "drain-pump" | "drain-hose" | "control-module";

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

export type CauseId = "blocked-filter" | "kinked-hose" | "drain-pump-failure" | "control-fault";
export type PartId = string;
export type BrandName = "LG" | "Samsung" | "GE" | "Whirlpool" | "Maytag" | "Electrolux";
export type DiagramTopology = "front-filter" | "drawer-filter" | "hose-only";
export type WasherLoadStyle = "front-load" | "top-load";

export type SourceKind =
  "manufacturer-model" | "manufacturer-troubleshooting" | "manufacturer-part" | "authorized-parts";

export interface SourceReference {
  id: string;
  kind: SourceKind;
  title: string;
  url: string;
  publisher: string;
  appliesTo: string;
  lastVerified: string;
}

export interface RepairPackPart {
  id: PartId;
  componentId: ComponentId;
  name: string;
  sku: string;
  compatibleProductCodes: string[];
  compatibleModel: string;
  installBoundary: "professional-only";
  source: SourceReference;
  purchase: {
    seller: string;
    url: string;
    priceAtVerification: string;
    availabilityAtVerification: string;
    lastVerified: string;
  };
}

export interface ApplianceCatalogEntry {
  id: ApplianceId;
  brand: BrandName;
  model: string;
  label: string;
  aliases: string[];
  verifiedProductCodes: string[];
  productCodePrompt: string;
  loadStyle: WasherLoadStyle;
  topology: DiagramTopology;
  checkProfile: "filter-access" | "hose-then-service";
  modelSource: SourceReference;
  troubleshootingSources: SourceReference[];
  exactPart?: RepairPackPart;
}

export type EscalationReason =
  "electrical" | "burning-smell" | "hot-water" | "active-leak" | "internal-access" | "unresolved";

export type ActivitySource = "agent" | "human" | "manual" | "system";
export type ActivityOutcome = "accepted" | "rejected";
export type WebMcpStatus = "detecting" | "ready" | "unavailable" | "partial" | "failed";
export type RepairPhase = "catalog" | "idle" | "preparing" | "checking" | "result" | "escalated";

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
  sourceIds: string[];
  results: RepairPackResult[];
}

export interface RepairPackComponent {
  id: ComponentId;
  label: string;
  description: string;
  access: "visible" | "user-accessible" | "professional-only";
}

export interface RepairPackCause {
  id: CauseId;
  label: string;
  componentId: ComponentId;
  baseRank: number;
}

export interface RepairPack {
  id: ApplianceId;
  schemaVersion: number;
  appliance: {
    brand: BrandName;
    model: string;
    type: "front-load washer" | "top-load washer";
    loadStyle: WasherLoadStyle;
    topology: DiagramTopology;
  };
  symptom: { id: SymptomId; label: string };
  productCodePrompt: string;
  verifiedProductCodes: string[];
  components: RepairPackComponent[];
  checks: RepairPackCheck[];
  causes: RepairPackCause[];
  parts: RepairPackPart[];
  sources: SourceReference[];
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
  packId: ApplianceId | null;
  applianceId: ApplianceId | null;
  productCode: string | null;
  catalogQuery: string;
  catalogBrand: BrandName | null;
  catalogResultIds: ApplianceId[];
  symptomId: SymptomId | null;
  phase: RepairPhase;
  currentStepId: CheckId | null;
  highlightedComponentId: ComponentId;
  completedChecks: Partial<Record<CheckId, ResultId>>;
  selectedPartId: PartId | null;
  partOutcomeRevealed: boolean;
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

export type PartOutcomeStatus =
  "not-ready" | "no-part-needed" | "exact" | "variant-needed" | "professional-only";

export interface PartOutcome {
  status: PartOutcomeStatus;
  title: string;
  message: string;
  part: RepairPackPart | null;
  requiredProductCode: string | null;
  source: SourceReference | null;
}

export interface RepairSnapshot {
  catalogQuery: string;
  catalogResults: Array<
    Pick<ApplianceCatalogEntry, "id" | "brand" | "model" | "label" | "productCodePrompt">
  >;
  appliance: string | null;
  productCode: string | null;
  verificationLabel: string | null;
  symptom: string | null;
  phase: RepairPhase;
  progress: number;
  currentStep: RepairPackCheck | null;
  highlightedComponent: RepairPackComponent;
  completedChecks: Partial<Record<CheckId, ResultId>>;
  likelyCauses: RankedCause[];
  partOutcome: PartOutcome | null;
  selectedPart: RepairPackPart | null;
  sources: SourceReference[];
  escalation: Escalation | null;
  webMcpStatus: WebMcpStatus;
  validNextActions: RepairToolName[];
  disclaimer: string;
}

export const REPAIR_TOOL_NAMES = [
  "search_supported_appliances",
  "select_appliance",
  "get_repair_state",
  "start_diagnosis",
  "show_component",
  "record_observation",
  "find_compatible_part",
  "stop_and_escalate",
] as const;

export type RepairToolName = (typeof REPAIR_TOOL_NAMES)[number];

export interface ToolExecutionResult {
  ok: boolean;
  state: RepairState;
  message: string;
  snapshot: RepairSnapshot;
}
