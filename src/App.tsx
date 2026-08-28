import { ChevronDown, RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { ActivityLog } from "@/components/ActivityLog";
import { ApplianceDiagram } from "@/components/ApplianceDiagram";
import { CauseStack } from "@/components/CauseStack";
import { HandoffStatus } from "@/components/HandoffStatus";
import { ModelFinder } from "@/components/ModelFinder";
import { NextCheckPanel } from "@/components/NextCheckPanel";
import { PartResult } from "@/components/PartResult";
import { SourcePanel } from "@/components/SourcePanel";
import { StatusPill } from "@/components/StatusPill";
import { ToolInspector } from "@/components/ToolInspector";
import { getActivityMilestone } from "@/components/activityMilestones";
import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import { capabilityLabel } from "@/domain/modelSearch";
import { getCatalogEntry, getRepairPack, normalizeModel } from "@/domain/repairPack";
import type {
  ApplianceKind,
  BrandName,
  ComponentId,
  RepairToolName,
  ResultId,
  SupportedSymptomId,
} from "@/domain/types";
import { useRepair } from "@/state/RepairProvider";

export function App() {
  const { state, snapshot, invokeTool, reset, undoLastObservation, canUndo } = useRepair();
  const latestMessage = getActivityMilestone(state.activity.at(-1));
  const hasSession = Boolean(state.applianceId || state.activity.length > 1);
  const pack = state.packId ? getRepairPack(state.packId) : null;
  const completedCount = Object.keys(snapshot.completedChecks).length;
  const hasPartOutcome = Boolean(snapshot.partOutcome);
  const decisionFocusKey =
    state.applianceId && !hasPartOutcome
      ? `${state.applianceId}:${snapshot.currentStep?.id ?? snapshot.escalation?.reason ?? snapshot.phase}`
      : null;

  useEffect(() => {
    if (!hasPartOutcome) return;
    const title = document.getElementById("part-title");
    const result = title?.closest(".part-result");
    if (!title) return;
    title.focus({ preventScroll: true });

    const alignResult = () => {
      if (typeof title.scrollIntoView === "function")
        title.scrollIntoView({ behavior: "auto", block: "start" });
    };
    alignResult();
    const frame = requestAnimationFrame(alignResult);
    const observer =
      result && "ResizeObserver" in window
        ? new ResizeObserver(() => requestAnimationFrame(alignResult))
        : null;
    if (result) observer?.observe(result);
    const settle = window.setTimeout(() => observer?.disconnect(), 600);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      observer?.disconnect();
    };
  }, [hasPartOutcome]);

  useEffect(() => {
    if (!decisionFocusKey) return;
    const frame = requestAnimationFrame(() =>
      document.getElementById("next-check-title")?.focus({ preventScroll: false }),
    );
    return () => cancelAnimationFrame(frame);
  }, [decisionFocusKey]);

  const searchModels = (
    modelQuery: string,
    brand: BrandName | null,
    kind: ApplianceKind,
    symptomId: SupportedSymptomId | null,
  ) => {
    invokeTool(
      "search_supported_appliances",
      { modelQuery, kind, ...(brand ? { brand } : {}), ...(symptomId ? { symptomId } : {}) },
      "human",
    );
  };

  const selectModel = (
    applianceId: string,
    symptomId: SupportedSymptomId,
    suppliedProductCode?: string,
  ) => {
    const entry = getCatalogEntry(applianceId);
    const exactCode =
      suppliedProductCode ??
      entry.verifiedProductCodes.find(
        (code) => normalizeModel(code) === normalizeModel(state.catalogQuery),
      );
    const selection = invokeTool(
      "select_appliance",
      { applianceId, symptomId, ...(exactCode ? { productCode: exactCode } : {}) },
      "human",
    );
    if (selection.ok && exactCode) invokeTool("start_diagnosis", { symptomId }, "human");
  };

  const showExample = (applianceId: string) => {
    const examplePack = getRepairPack(applianceId);
    if (!examplePack.example) return;
    invokeTool(
      "select_appliance",
      {
        applianceId,
        symptomId: examplePack.symptom.id,
        productCode: examplePack.example.productCode,
      },
      "example",
    );
    invokeTool("start_diagnosis", { symptomId: examplePack.symptom.id }, "example");
    for (const observation of examplePack.example.observations) {
      invokeTool("record_observation", observation, "example");
    }
    invokeTool("find_compatible_part", {}, "example");
  };

  const startDiagnosis = () => {
    if (!state.applianceId) return;
    invokeTool("start_diagnosis", { symptomId: state.symptomId ?? pack?.symptom.id }, "human");
  };

  const recordResult = (resultId: ResultId) => {
    if (!state.currentStepId) return;
    const observation = invokeTool(
      "record_observation",
      { checkId: state.currentStepId, resultId },
      "human",
    );
    if (observation.ok && observation.state.phase === "result")
      invokeTool("find_compatible_part", {}, "human");
  };

  const continueWithProductCode = (productCode: string) => {
    if (!state.applianceId) return null;
    const selection = invokeTool(
      "select_appliance",
      { applianceId: state.applianceId, symptomId: state.symptomId, productCode },
      "human",
    );
    if (selection.ok)
      invokeTool("start_diagnosis", { symptomId: state.symptomId ?? pack?.symptom.id }, "human");
    return selection;
  };

  const goBack = () => {
    if (!undoLastObservation()) return;
    requestAnimationFrame(() => document.getElementById("next-check-title")?.focus());
  };

  const highlightComponent = (componentId: ComponentId) =>
    invokeTool("show_component", { componentId }, "human");
  const runManualTool = (name: RepairToolName, input: Record<string, unknown>) =>
    invokeTool(name, input, "manual");

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="topbar">
        <a className="brand" href="#main-content" aria-label="Clunk home">
          Clunk<span aria-hidden="true">.</span>
        </a>
        <p>Visual appliance guidance for ordinary homeowners</p>
        <div className="topbar__meta">
          <span className="model-badge">
            {snapshot.appliance ?? `${APPLIANCE_CATALOG.length} supported models`}
          </span>
          {hasSession ? (
            <button className="reset-button" type="button" onClick={reset}>
              <RotateCcw size={16} aria-hidden="true" /> Start over
            </button>
          ) : null}
        </div>
      </header>

      <main id="main-content">
        {!snapshot.appliance ? (
          <ModelFinder
            snapshot={snapshot}
            selectedId={state.applianceId}
            isFreshSession={state.sequence === 0 && state.activity.length === 1}
            onSearch={searchModels}
            onSelect={selectModel}
            onExample={showExample}
          />
        ) : (
          <>
            {snapshot.exampleMode ? (
              <div className="example-banner" role="status">
                <strong>Completed example</strong>
                <span>
                  {snapshot.exampleSummary}. The answers are prefilled to show the finished path;
                  use Start over when you are ready to check your own appliance.
                </span>
              </div>
            ) : null}

            <section className="selected-appliance" aria-label="Selected appliance and problem">
              <div>
                <p>{snapshot.applianceKindLabel}</p>
                <h1>{snapshot.appliance}</h1>
                <span className="selected-appliance__details">
                  <span>
                    {snapshot.verificationLabel === "Full model number confirmed"
                      ? `Exact model confirmed · ${snapshot.productCode}`
                      : snapshot.productCode
                        ? `Label recorded · ${snapshot.productCode} · exact fit not confirmed`
                        : "Model family selected · full label still needed for an exact part"}
                  </span>
                  <strong>{pack ? capabilityLabel(pack.appliance.capability) : null}</strong>
                </span>
              </div>
              <div className="selected-appliance__problem">
                <span>Problem</span>
                <strong>{snapshot.symptomShortLabel ?? pack?.symptom.shortLabel}</strong>
              </div>
            </section>

            <div className="diagnosis-progress">
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Diagnosis progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={snapshot.progress}
              >
                <span style={{ transform: `scaleX(${snapshot.progress / 100})` }} />
              </div>
              <p>
                {snapshot.partOutcome
                  ? "Answer ready"
                  : snapshot.escalation
                    ? "Stopped safely"
                    : snapshot.currentStep
                      ? `Check ${completedCount + 1} of ${pack?.checks.length ?? 1}`
                      : "Ready to begin"}
              </p>
            </div>

            <section
              className={`repair-bench${snapshot.partOutcome ? " has-result" : ""}`}
              id="repair-bench"
              aria-label="Appliance location and next step"
              tabIndex={-1}
            >
              <ApplianceDiagram
                packId={state.packId}
                highlightedComponentId={state.highlightedComponentId}
                overviewMode={snapshot.currentStep?.id === "safety-check"}
                onHighlight={highlightComponent}
              />
              <aside className="decision-column" aria-label="Question or result">
                <NextCheckPanel
                  snapshot={snapshot}
                  onStart={startDiagnosis}
                  onResult={recordResult}
                  onFindPart={() => invokeTool("find_compatible_part", {}, "human")}
                  onUseProductCode={continueWithProductCode}
                  onBack={goBack}
                  canUndo={canUndo}
                  capability={pack?.appliance.capability ?? "guided-checks"}
                  exampleProductCode={
                    state.applianceId
                      ? (getCatalogEntry(state.applianceId).verifiedProductCodes[0] ?? null)
                      : null
                  }
                />
                <PartResult outcome={snapshot.partOutcome} />
                {snapshot.partOutcome ? (
                  <details className="answer-details">
                    <summary>
                      Evidence behind this answer <ChevronDown size={18} aria-hidden="true" />
                    </summary>
                    <CauseStack causes={snapshot.likelyCauses} visible />
                    <SourcePanel sources={snapshot.sources} />
                  </details>
                ) : null}
              </aside>
            </section>
          </>
        )}

        <details className="protocol-disclosure">
          <summary>
            <span>
              <strong>For judges and developers</strong>
              <small>Sources, WebMCP activity, and the current tool boundary</small>
            </span>
            <span>
              Open technical view <ChevronDown size={18} aria-hidden="true" />
            </span>
          </summary>
          <section className="protocol-band" aria-label="Technical evidence and WebMCP inspector">
            <div className="protocol-status">
              <StatusPill status={state.webMcpStatus} />
              <span>{latestMessage}</span>
            </div>
            <HandoffStatus snapshot={snapshot} />
            <ActivityLog activity={state.activity} />
            <ToolInspector activeTools={snapshot.validNextActions} onRun={runManualTool} />
          </section>
        </details>
      </main>

      <footer>
        <p>{snapshot.disclaimer}</p>
        <a
          href="https://github.com/mcostigliola321/clunk-your-appliance-assistant"
          target="_blank"
          rel="noreferrer"
        >
          Open source on GitHub
        </a>
      </footer>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {latestMessage}
      </div>
    </div>
  );
}
