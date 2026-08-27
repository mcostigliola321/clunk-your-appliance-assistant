export type ApplianceId = string;
export type ApplianceKind = "washer" | "dishwasher" | "dryer" | "refrigerator";
export type SymptomId = string;
export type ComponentId = string;
export type CheckId = string;
export type ResultId = string;
export type CauseId = string;
export type PartId = string;

export type BrandName =
  "LG" | "Samsung" | "GE" | "Whirlpool" | "Maytag" | "Electrolux" | "Bosch" | "KitchenAid";

export type DiagramTopology =
  | "front-filter"
  | "drawer-filter"
  | "hose-only"
  | "washer-front-filter"
  | "washer-drawer-filter"
  | "washer-top-load"
  | "dishwasher"
  | "electric-dryer"
  | "side-by-side-refrigerator";

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
  location?: string;
  installBoundary: "user-replaceable" | "professional-only";
  source: SourceReference;
  purchase: {
    seller: string;
    url: string;
    priceAtVerification: string;
    availabilityAtVerification: string;
    lastVerified: string;
  };
}

export type RepairProfile =
  | "washer-front-drain"
  | "washer-hose-only"
  | "dishwasher-drain"
  | "dryer-door-strike"
  | "refrigerator-water-filter";

export interface ApplianceCatalogEntry {
  id: ApplianceId;
  kind: ApplianceKind;
  brand: BrandName;
  model: string;
  label: string;
  aliases: string[];
  verifiedProductCodes: string[];
  productCodePrompt: string;
  profile: RepairProfile;
  loadStyle?: WasherLoadStyle;
  topology?: DiagramTopology;
  checkProfile?: "filter-access" | "hose-then-service";
  modelSource: SourceReference;
  troubleshootingSources: SourceReference[];
  exactPart?: RepairPackPart;
}

export type EscalationReason =
  "electrical" | "burning-smell" | "hot-water" | "active-leak" | "internal-access" | "unresolved";

export type ActivitySource = "agent" | "human" | "manual" | "system" | "example";
export type ActivityOutcome = "accepted" | "rejected";
export type WebMcpStatus = "detecting" | "ready" | "unavailable" | "partial" | "failed";
export type RepairPhase = "catalog" | "idle" | "preparing" | "checking" | "result" | "escalated";
export type ResultEffect =
  "continue" | "no-part-needed" | "part-candidate" | "professional-only" | "hazard";

export interface RepairPackResult {
  id: ResultId;
  label: string;
  effect: ResultEffect;
  nextCheckId?: CheckId;
  focusComponentId?: ComponentId;
  escalationReason?: EscalationReason;
  outcomeTitle?: string;
  outcomeMessage?: string;
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
  hotspot: { x: number; y: number };
}

export interface RepairPackCause {
  id: CauseId;
  label: string;
  componentId: ComponentId;
  baseRank: number;
  defaultExplanation: string;
  resultScores?: Record<ResultId, number>;
  resultExplanations?: Record<ResultId, string>;
}

export interface RepairPack {
  id: ApplianceId;
  schemaVersion: number;
  appliance: {
    kind: ApplianceKind;
    kindLabel: string;
    noun: string;
    brand: BrandName;
    model: string;
    type: string;
    loadStyle?: WasherLoadStyle;
    topology: DiagramTopology;
    illustration: { src: string; width: number; height: number; alt: string };
    diagramNote: string;
  };
  symptom: { id: SymptomId; label: string; shortLabel: string };
  productCodePrompt: string;
  verifiedProductCodes: string[];
  components: RepairPackComponent[];
  checks: RepairPackCheck[];
  causes: RepairPackCause[];
  parts: RepairPackPart[];
  sources: SourceReference[];
  example: {
    title: string;
    summary: string;
    productCode: string;
    observations: Array<{ checkId: CheckId; resultId: ResultId }>;
  } | null;
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
  catalogKind: ApplianceKind | null;
  catalogResultIds: ApplianceId[];
  symptomId: SymptomId | null;
  phase: RepairPhase;
  currentStepId: CheckId | null;
  highlightedComponentId: ComponentId;
  completedChecks: Partial<Record<CheckId, ResultId>>;
  selectedPartId: PartId | null;
  partOutcomeRevealed: boolean;
  exampleMode: boolean;
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
  applianceNoun: string;
  part: RepairPackPart | null;
  requiredProductCode: string | null;
  source: SourceReference | null;
}

export interface RepairSnapshot {
  catalogQuery: string;
  catalogKind: ApplianceKind | null;
  catalogResults: Array<
    Pick<ApplianceCatalogEntry, "id" | "kind" | "brand" | "model" | "label" | "productCodePrompt">
  >;
  appliance: string | null;
  applianceKind: ApplianceKind | null;
  applianceKindLabel: string | null;
  applianceNoun: string;
  productCode: string | null;
  verificationLabel: string | null;
  symptom: string | null;
  symptomShortLabel: string | null;
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
  exampleMode: boolean;
  exampleSummary: string | null;
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
