import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";

import { deriveCauses } from "./diagnosis";
import {
  getCatalogEntry,
  getCheck,
  getComponent,
  getPart,
  getRepairPack,
  normalizeModel,
} from "./repairPack";
import type {
  PartOutcome,
  RepairPackResult,
  RepairSnapshot,
  RepairState,
  RepairToolName,
} from "./types";

export const REAL_DATA_DISCLAIMER =
  "Confirm the complete model number on the seller page before ordering. Clunk shows safe checks and purchase links—not a guaranteed diagnosis or a substitute for a qualified technician.";

function terminalResult(state: RepairState): RepairPackResult | null {
  if (!state.packId) return null;
  const pack = getRepairPack(state.packId);
  for (const check of [...pack.checks].reverse()) {
    const resultId = state.completedChecks[check.id];
    if (!resultId) continue;
    const match = check.results.find((item) => item.id === resultId);
    if (match && match.effect !== "continue") return match;
  }
  return null;
}

export function getPartOutcome(state: RepairState): PartOutcome | null {
  if (!state.packId || state.phase !== "result") return null;
  const pack = getRepairPack(state.packId);
  const observed = terminalResult(state);
  const noun = pack.appliance.noun;
  const source = pack.sources.find((item) => item.kind === "manufacturer-troubleshooting") ?? null;
  if (!observed) {
    return {
      status: "not-ready",
      title: "One more check needed",
      message: "Finish the check on screen and Clunk will show the next step.",
      applianceNoun: noun,
      part: null,
      requiredProductCode: null,
      source: null,
    };
  }
  if (observed.effect === "no-part-needed") {
    return {
      status: "no-part-needed",
      title: observed.outcomeTitle ?? "You probably do not need a part",
      message: observed.outcomeMessage ?? "The visible issue can explain the symptom.",
      applianceNoun: noun,
      part: null,
      requiredProductCode: null,
      source,
    };
  }
  if (observed.effect === "professional-only") {
    return {
      status: "professional-only",
      title: observed.outcomeTitle ?? "A professional should continue",
      message: observed.outcomeMessage ?? "The next check is beyond Clunk's user-safe boundary.",
      applianceNoun: noun,
      part: null,
      requiredProductCode: pack.productCodePrompt,
      source,
    };
  }
  if (observed.effect === "part-candidate") {
    const part = pack.parts[0] ?? null;
    const exact = Boolean(
      part &&
      state.productCode &&
      part.compatibleProductCodes.map(normalizeModel).includes(normalizeModel(state.productCode)),
    );
    if (exact && part) {
      return {
        status: "exact",
        title: `This is the part for your ${noun}`,
        message:
          observed.outcomeMessage ?? `The observations point to this ${part.name.toLowerCase()}.`,
        applianceNoun: noun,
        part,
        requiredProductCode: null,
        source: part.source,
      };
    }
    return {
      status: "variant-needed",
      title: part
        ? "Confirm the full model number"
        : "Clunk has not verified a part for this model yet",
      message: part
        ? "Small letters and engineering digits can change which part fits. Enter the complete number from the appliance label."
        : "The safe checks reached a likely component, but this model is currently guided checks only—there is no verified purchase link.",
      applianceNoun: noun,
      part: null,
      requiredProductCode: pack.productCodePrompt,
      source: pack.sources.find((item) => item.kind === "manufacturer-model") ?? null,
    };
  }
  return {
    status: "not-ready",
    title: "One more check needed",
    message: "Finish the check on screen and Clunk will show the next step.",
    applianceNoun: noun,
    part: null,
    requiredProductCode: null,
    source: null,
  };
}

export function getProgress(state: RepairState): number {
  if (state.escalation || state.partOutcomeRevealed) return 100;
  if (!state.packId) return 0;
  if (state.phase === "result") return 92;
  const pack = getRepairPack(state.packId);
  const completed = Object.keys(state.completedChecks).length;
  if (state.currentStepId)
    return Math.min(84, 20 + Math.round((completed / pack.checks.length) * 64));
  if (state.applianceId) return 10;
  return 0;
}

export function getValidNextActions(state: RepairState): RepairToolName[] {
  if (!state.applianceId)
    return ["get_repair_state", "search_supported_appliances", "select_appliance"];
  if (state.escalation)
    return ["get_repair_state", "search_supported_appliances", "select_appliance"];
  if (!state.symptomId)
    return [
      "get_repair_state",
      "search_supported_appliances",
      "select_appliance",
      "start_diagnosis",
    ];
  if (state.currentStepId)
    return ["get_repair_state", "show_component", "record_observation", "stop_and_escalate"];
  if (state.phase === "result")
    return ["get_repair_state", "show_component", "find_compatible_part", "stop_and_escalate"];
  return ["get_repair_state"];
}

export function getToolAvailabilityKey(state: RepairState): string {
  return getValidNextActions(state).join("|");
}

export function getRepairSnapshot(state: RepairState): RepairSnapshot {
  const pack = state.packId ? getRepairPack(state.packId) : null;
  const outcome = getPartOutcome(state);
  return {
    catalogQuery: state.catalogQuery,
    catalogKind: state.catalogKind,
    catalogResults: state.catalogResultIds.map((id) => {
      const entry = getCatalogEntry(id);
      return {
        id: entry.id,
        kind: entry.kind,
        brand: entry.brand,
        model: entry.model,
        label: entry.label,
        productCodePrompt: entry.productCodePrompt,
      };
    }),
    appliance: pack ? `${pack.appliance.brand} ${pack.appliance.model}` : null,
    applianceKind: pack?.appliance.kind ?? null,
    applianceKindLabel: pack?.appliance.kindLabel ?? null,
    applianceNoun: pack?.appliance.noun ?? "appliance",
    productCode: state.productCode,
    verificationLabel: pack
      ? state.productCode &&
        pack.verifiedProductCodes.map(normalizeModel).includes(normalizeModel(state.productCode))
        ? "Full model number confirmed"
        : `${pack.appliance.kindLabel} model found`
      : null,
    symptom: state.symptomId ? (pack?.symptom.label ?? null) : null,
    symptomShortLabel: state.symptomId ? (pack?.symptom.shortLabel ?? null) : null,
    phase: state.phase,
    progress: getProgress(state),
    currentStep:
      state.currentStepId && state.packId ? getCheck(state.packId, state.currentStepId) : null,
    highlightedComponent: getComponent(state.packId, state.highlightedComponentId),
    completedChecks: { ...state.completedChecks },
    likelyCauses: deriveCauses(state),
    partOutcome: state.partOutcomeRevealed ? outcome : null,
    selectedPart:
      state.selectedPartId && state.packId ? getPart(state.packId, state.selectedPartId) : null,
    sources: pack?.sources ?? [],
    escalation: state.escalation,
    exampleMode: state.exampleMode,
    exampleSummary: state.exampleMode ? (pack?.example?.summary ?? null) : null,
    webMcpStatus: state.webMcpStatus,
    validNextActions: getValidNextActions(state),
    disclaimer: REAL_DATA_DISCLAIMER,
  };
}

export function getWebMcpTaskSnapshot(state: RepairState) {
  const snapshot = getRepairSnapshot(state);
  const catalogActive = Boolean(state.catalogQuery || state.catalogKind || state.catalogBrand);
  const handoff = state.escalation
    ? "safety-stop"
    : state.currentStepId
      ? "human-observation-required"
      : state.phase === "result" && !state.partOutcomeRevealed
        ? "part-lookup-available"
        : state.partOutcomeRevealed
          ? "outcome-complete"
          : state.applianceId
            ? "start-diagnosis"
            : "select-model";

  return {
    phase: state.phase,
    handoff,
    catalog: {
      supportedModelCount: APPLIANCE_CATALOG.length,
      supportedKinds: ["washer", "dishwasher", "dryer", "refrigerator"],
      query: state.catalogQuery,
      kind: state.catalogKind,
      resultCount: state.catalogResultIds.length,
      results:
        !state.applianceId && catalogActive
          ? snapshot.catalogResults.slice(0, 10).map((item) => ({
              applianceId: item.id,
              brand: item.brand,
              model: item.model,
            }))
          : [],
    },
    task: state.applianceId
      ? {
          applianceId: state.applianceId,
          appliance: snapshot.appliance,
          productCode: snapshot.productCode,
          verification: snapshot.verificationLabel,
          symptomId: state.symptomId,
          symptom: snapshot.symptom,
          highlightedComponent: {
            id: snapshot.highlightedComponent.id,
            label: snapshot.highlightedComponent.label,
            access: snapshot.highlightedComponent.access,
          },
          currentCheck: snapshot.currentStep
            ? {
                checkId: snapshot.currentStep.id,
                label: snapshot.currentStep.label,
                instruction: snapshot.currentStep.instruction,
                stop: snapshot.currentStep.stop,
                observations: snapshot.currentStep.results.map((result) => ({
                  resultId: result.id,
                  label: result.label,
                })),
              }
            : null,
          completedObservations: snapshot.completedChecks,
          outcome: snapshot.partOutcome
            ? {
                status: snapshot.partOutcome.status,
                title: snapshot.partOutcome.title,
                message: snapshot.partOutcome.message,
                part: snapshot.partOutcome.part
                  ? {
                      sku: snapshot.partOutcome.part.sku,
                      name: snapshot.partOutcome.part.name,
                      compatibleModel: snapshot.partOutcome.part.compatibleModel,
                      source: snapshot.partOutcome.part.source.url,
                      seller: snapshot.partOutcome.part.purchase.seller,
                      purchaseUrl: snapshot.partOutcome.part.purchase.url,
                      price: snapshot.partOutcome.part.purchase.priceAtVerification,
                      availability: snapshot.partOutcome.part.purchase.availabilityAtVerification,
                      checkedOn: snapshot.partOutcome.part.purchase.lastVerified,
                    }
                  : null,
              }
            : null,
          escalation: snapshot.escalation,
        }
      : null,
    nextTools: snapshot.validNextActions,
  };
}
