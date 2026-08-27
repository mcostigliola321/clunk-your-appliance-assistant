import { ChevronDown, RotateCcw } from "lucide-react";

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
import { getCatalogEntry, getRepairPack, normalizeModel } from "@/domain/repairPack";
import type {
  ApplianceKind,
  BrandName,
  ComponentId,
  RepairToolName,
  ResultId,
} from "@/domain/types";
import { useRepair } from "@/state/RepairProvider";

export function App() {
  const { state, snapshot, invokeTool, reset } = useRepair();
  const latestMessage = getActivityMilestone(state.activity.at(-1));
  const hasSession = Boolean(state.applianceId || state.activity.length > 1);

  const searchModels = (modelQuery: string, brand: BrandName | null, kind: ApplianceKind) => {
    invokeTool(
      "search_supported_appliances",
      { modelQuery, kind, ...(brand ? { brand } : {}) },
      "human",
    );
  };

  const selectModel = (applianceId: string, suppliedProductCode?: string) => {
    const entry = getCatalogEntry(applianceId);
    const exactCode =
      suppliedProductCode ??
      entry.verifiedProductCodes.find(
        (code) => normalizeModel(code) === normalizeModel(state.catalogQuery),
      );
    const selection = invokeTool(
      "select_appliance",
      { applianceId, ...(exactCode ? { productCode: exactCode } : {}) },
      "human",
    );
    if (selection.ok && exactCode)
      invokeTool("start_diagnosis", { symptomId: getRepairPack(applianceId).symptom.id }, "human");
  };

  const showExample = (applianceId: string) => {
    const pack = getRepairPack(applianceId);
    if (!pack.example) return;
    invokeTool(
      "select_appliance",
      { applianceId, productCode: pack.example.productCode },
      "example",
    );
    invokeTool("start_diagnosis", { symptomId: pack.symptom.id }, "example");
    for (const observation of pack.example.observations) {
      invokeTool("record_observation", observation, "example");
    }
    invokeTool("find_compatible_part", {}, "example");
    requestAnimationFrame(() => {
      const bench = document.getElementById("repair-bench");
      bench?.focus({ preventScroll: true });
      if (typeof bench?.scrollIntoView === "function")
        bench.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const startDiagnosis = () => {
    if (!state.applianceId) return;
    invokeTool(
      "start_diagnosis",
      { symptomId: getRepairPack(state.applianceId).symptom.id },
      "human",
    );
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
      { applianceId: state.applianceId, productCode },
      "human",
    );
    if (selection.ok)
      invokeTool(
        "start_diagnosis",
        { symptomId: getRepairPack(state.applianceId).symptom.id },
        "human",
      );
    return selection;
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
        <div className="topbar__meta">
          <span className="model-badge">
            {snapshot.appliance ?? `${APPLIANCE_CATALOG.length} supported models`}
          </span>
          <StatusPill status={state.webMcpStatus} />
          {hasSession ? (
            <button className="reset-button" type="button" onClick={reset}>
              <RotateCcw size={16} aria-hidden="true" /> Reset
            </button>
          ) : null}
        </div>
      </header>

      <main id="main-content">
        {!snapshot.appliance ? (
          <section className="intro-band" aria-labelledby="intro-title">
            <div className="intro-copy intro-copy--centered">
              <span className="hero-kicker">A visual appliance diagnosis an AI can operate</span>
              <h1 id="intro-title">
                Tell Clunk what broke.
                <br />
                Get the part to buy.
              </h1>
              <p>
                Clunk shows the exact place to look, records what you see, and ends with a verified
                part link when the evidence supports one.
              </p>
              <div className="hero-flow" aria-label="How Clunk works">
                <span>
                  <b>1</b> Pick the problem
                </span>
                <i aria-hidden="true">→</i>
                <span>
                  <b>2</b> Look where shown
                </span>
                <i aria-hidden="true">→</i>
                <span>
                  <b>3</b> Open the part
                </span>
              </div>
            </div>
            <ModelFinder
              snapshot={snapshot}
              selectedId={state.applianceId}
              onSearch={searchModels}
              onSelect={selectModel}
              onExample={showExample}
            />
          </section>
        ) : (
          <>
            {snapshot.exampleMode ? (
              <div className="example-banner" role="status">
                <strong>Example answer</strong>
                <span>
                  {snapshot.exampleSummary}. These observations are prefilled so you can see the
                  complete deterministic fixture immediately. This is not an agent run.
                </span>
              </div>
            ) : null}
            <section className="selected-appliance" aria-label="Selected appliance">
              <div>
                <span className="section-kicker">{snapshot.applianceKindLabel}</span>
                <h1>{snapshot.appliance}</h1>
                <p>
                  {snapshot.verificationLabel === "Full model number confirmed"
                    ? `Confirmed model code: ${snapshot.productCode}`
                    : snapshot.productCode
                      ? `Label text recorded: ${snapshot.productCode}. Exact compatibility is not confirmed.`
                      : "Model family selected. Confirm the complete label code before ordering a part."}
                </p>
              </div>
              <div className="selected-appliance__action">
                <span>
                  <small>Problem</small>
                  <strong>
                    {snapshot.symptomShortLabel ??
                      getRepairPack(state.applianceId!).symptom.shortLabel}
                  </strong>
                </span>
              </div>
            </section>

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

            <section
              className="repair-bench"
              id="repair-bench"
              aria-label="Appliance location and answer"
              tabIndex={-1}
            >
              <ApplianceDiagram
                packId={state.packId}
                highlightedComponentId={state.highlightedComponentId}
                onHighlight={highlightComponent}
              />
              <aside className="decision-column" aria-label="Diagnosis actions and results">
                <HandoffStatus snapshot={snapshot} />
                <NextCheckPanel
                  snapshot={snapshot}
                  onStart={startDiagnosis}
                  onResult={recordResult}
                  onFindPart={() => invokeTool("find_compatible_part", {}, "human")}
                  onUseProductCode={continueWithProductCode}
                  exactPartAvailable={Boolean(
                    state.applianceId && getCatalogEntry(state.applianceId).exactPart,
                  )}
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
                      Why this answer <ChevronDown size={18} aria-hidden="true" />
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
              <strong>Human + agent activity</strong>
              <small>{latestMessage}</small>
            </span>
            <span>
              View WebMCP calls <ChevronDown size={18} aria-hidden="true" />
            </span>
          </summary>
          <section
            className="protocol-band"
            aria-label="Human and agent activity and tool inspector"
          >
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
