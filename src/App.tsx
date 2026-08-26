import { BadgeCheck, ChevronDown, RotateCcw } from "lucide-react";

import { ActivityLog } from "@/components/ActivityLog";
import { ApplianceDiagram } from "@/components/ApplianceDiagram";
import { CauseStack } from "@/components/CauseStack";
import { DiagnosticRail } from "@/components/DiagnosticRail";
import { ModelFinder } from "@/components/ModelFinder";
import { NextCheckPanel } from "@/components/NextCheckPanel";
import { PartResult } from "@/components/PartResult";
import { RepairContext } from "@/components/RepairContext";
import { SourcePanel } from "@/components/SourcePanel";
import { StatusPill } from "@/components/StatusPill";
import { ToolInspector } from "@/components/ToolInspector";
import { getCatalogEntry, normalizeModel } from "@/domain/repairPack";
import type { BrandName, ComponentId, RepairToolName, ResultId } from "@/domain/types";
import { useRepair } from "@/state/RepairProvider";

export function App() {
  const { state, snapshot, invokeTool, reset } = useRepair();
  const latestMessage = state.activity.at(-1)?.message ?? "Repair catalog ready.";
  const hasSession = Boolean(state.applianceId || state.catalogQuery || state.activity.length > 1);

  const searchModels = (modelQuery: string, brand: BrandName | null) => {
    invokeTool("search_supported_appliances", { modelQuery, ...(brand ? { brand } : {}) }, "human");
  };

  const selectModel = (applianceId: string) => {
    const entry = getCatalogEntry(applianceId);
    const exactCode = entry.verifiedProductCodes.find(
      (code) => normalizeModel(code) === normalizeModel(state.catalogQuery),
    );
    invokeTool(
      "select_appliance",
      { applianceId, ...(exactCode ? { productCode: exactCode } : {}) },
      "human",
    );
  };

  const startDiagnosis = () => {
    if (!state.applianceId) return;
    invokeTool("start_diagnosis", { symptomId: "will-not-drain" }, "human");
  };

  const recordResult = (resultId: ResultId) => {
    if (!state.currentStepId) return;
    invokeTool("record_observation", { checkId: state.currentStepId, resultId }, "human");
  };

  const highlightComponent = (componentId: ComponentId) => {
    invokeTool("show_component", { componentId }, "human");
  };

  const runManualTool = (name: RepairToolName, input: Record<string, unknown>) => {
    invokeTool(name, input, "manual");
  };

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
          <span className="model-badge">{snapshot.appliance ?? "12 real model families"}</span>
          <StatusPill status={state.webMcpStatus} />
          {hasSession ? (
            <button className="reset-button" type="button" onClick={reset}>
              <RotateCcw size={16} aria-hidden="true" />
              Reset
            </button>
          ) : null}
        </div>
      </header>

      <main id="main-content">
        {!snapshot.appliance ? (
          <>
            <section className="intro-band" aria-labelledby="intro-title">
              <div className="intro-copy">
                <h1 id="intro-title">Tell it what&apos;s broken.</h1>
                <p>
                  It shows you what to check and finds the exact part—only when the evidence is
                  exact.
                </p>
                <div className="hero-proof">
                  <BadgeCheck size={17} aria-hidden="true" />
                  <span>Official support sources · deterministic safety · no login</span>
                </div>
              </div>
              <figure className="intro-machine">
                <img
                  src="/assets/clunk-washer-cutaway-v2.png"
                  alt="Generalized cutaway of a front-load washer showing its drum and drain path"
                  width="1100"
                  height="1100"
                />
                <figcaption>Interactive cutaway opens after model selection</figcaption>
              </figure>
              <ModelFinder
                snapshot={snapshot}
                selectedId={state.applianceId}
                onSearch={searchModels}
                onSelect={selectModel}
              />
            </section>

            <ol className="onboarding-line" aria-label="How Clunk works">
              <li>
                <span>1</span>
                <div>
                  <strong>Find your washer</strong>
                  <small>A complete model code unlocks exact evidence.</small>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Report what you see</strong>
                  <small>Clunk reveals one safe check at a time.</small>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Act on evidence</strong>
                  <small>Clean it, match the exact part, or stop safely.</small>
                </div>
              </li>
            </ol>
          </>
        ) : (
          <>
            <section className="selected-appliance" aria-label="Selected appliance">
              <div>
                <span className="section-kicker">Selected repair pack</span>
                <strong>{snapshot.appliance}</strong>
                <small>
                  {snapshot.productCode ??
                    "Family selected · complete product code still needed for exact compatibility"}
                </small>
              </div>
              <div className="selected-appliance__action">
                <span>
                  <small>Symptom</small>
                  <strong>Will not drain</strong>
                </span>
                {!snapshot.symptom ? (
                  <button className="button button--dark" type="button" onClick={startDiagnosis}>
                    Start safe diagnosis
                  </button>
                ) : (
                  <span className="diagnosis-active">In progress · {snapshot.progress}%</span>
                )}
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
              aria-label="Shared appliance repair bench"
            >
              <DiagnosticRail state={state} />
              <ApplianceDiagram
                packId={state.packId}
                highlightedComponentId={state.highlightedComponentId}
                onHighlight={highlightComponent}
              />
              <aside className="decision-column" aria-label="Diagnosis actions and results">
                <NextCheckPanel
                  snapshot={snapshot}
                  onStart={startDiagnosis}
                  onResult={recordResult}
                  onFindPart={() => invokeTool("find_compatible_part", {}, "human")}
                />
                <PartResult outcome={snapshot.partOutcome} />
                <CauseStack causes={snapshot.likelyCauses} visible={Boolean(snapshot.symptom)} />
                <SourcePanel sources={snapshot.sources} />
                {snapshot.phase === "result" || snapshot.phase === "escalated" ? (
                  <RepairContext />
                ) : null}
              </aside>
            </section>
          </>
        )}

        <details className="protocol-disclosure">
          <summary>
            <span>
              <strong>Agent activity &amp; WebMCP tools</strong>
              <small>{latestMessage}</small>
            </span>
            <span>
              {state.activity.length} events · {snapshot.validNextActions.length} active tools
              <ChevronDown size={18} aria-hidden="true" />
            </span>
          </summary>
          <section className="protocol-band" aria-label="Agent activity and tool inspector">
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
