import { ChevronDown, RotateCcw } from "lucide-react";

import { ActivityLog } from "@/components/ActivityLog";
import { ApplianceDiagram } from "@/components/ApplianceDiagram";
import { CauseStack } from "@/components/CauseStack";
import { ModelFinder } from "@/components/ModelFinder";
import { NextCheckPanel } from "@/components/NextCheckPanel";
import { PartResult } from "@/components/PartResult";
import { SourcePanel } from "@/components/SourcePanel";
import { StatusPill } from "@/components/StatusPill";
import { ToolInspector } from "@/components/ToolInspector";
import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
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
    if (selection.ok && exactCode) {
      invokeTool("start_diagnosis", { symptomId: "will-not-drain" }, "human");
    }
  };

  const startDiagnosis = () => {
    if (!state.applianceId) return;
    invokeTool("start_diagnosis", { symptomId: "will-not-drain" }, "human");
  };

  const recordResult = (resultId: ResultId) => {
    if (!state.currentStepId) return;
    const observation = invokeTool(
      "record_observation",
      { checkId: state.currentStepId, resultId },
      "human",
    );
    if (observation.ok && observation.state.phase === "result") {
      invokeTool("find_compatible_part", {}, "human");
    }
  };

  const continueWithProductCode = (productCode: string) => {
    if (!state.applianceId) return;
    const selection = invokeTool(
      "select_appliance",
      { applianceId: state.applianceId, productCode },
      "human",
    );
    if (selection.ok) {
      invokeTool("start_diagnosis", { symptomId: "will-not-drain" }, "human");
    }
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
          <span className="model-badge">
            {snapshot.appliance ?? `${APPLIANCE_CATALOG.length} washers supported`}
          </span>
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
                <h1 id="intro-title">Your washer won&apos;t drain. Let&apos;s fix that.</h1>
                <p>
                  Find your model. Clunk shows where to look and gives you the exact replacement
                  part when you need one.
                </p>
                <div className="hero-proof">
                  <span>Clear checks · real part links · no login</span>
                </div>
              </div>
              <figure className="intro-machine">
                <img
                  src="/assets/clunk-washer-front-load-topology-v3.png"
                  alt="Front-load washer interior showing the drain path"
                  width="1305"
                  height="1205"
                />
                <figcaption>Clunk points to each place to check.</figcaption>
              </figure>
              <ModelFinder
                snapshot={snapshot}
                selectedId={state.applianceId}
                onSearch={searchModels}
                onSelect={selectModel}
              />
            </section>
          </>
        ) : (
          <>
            <section className="selected-appliance" aria-label="Selected appliance">
              <div>
                <h1>{snapshot.appliance} won&apos;t drain</h1>
                <p>
                  {snapshot.productCode
                    ? `Full model number: ${snapshot.productCode}`
                    : "Add the full model number to get the right part."}
                </p>
              </div>
              <div className="selected-appliance__action">
                <span>
                  <small>Problem</small>
                  <strong>Water stays in the washer</strong>
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
              aria-label="Washer check and answer"
            >
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
                      Why Clunk gave this answer
                      <ChevronDown size={18} aria-hidden="true" />
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
              <strong>Behind the scenes</strong>
              <small>{latestMessage}</small>
            </span>
            <span>
              View activity
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
