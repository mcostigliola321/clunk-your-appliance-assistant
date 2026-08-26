import { RotateCcw } from "lucide-react";

import { ActivityLog } from "@/components/ActivityLog";
import { ApplianceDiagram } from "@/components/ApplianceDiagram";
import { CauseStack } from "@/components/CauseStack";
import { DiagnosticRail } from "@/components/DiagnosticRail";
import { NextCheckPanel } from "@/components/NextCheckPanel";
import { PartResult } from "@/components/PartResult";
import { RepairContext } from "@/components/RepairContext";
import { StatusPill } from "@/components/StatusPill";
import { ToolInspector } from "@/components/ToolInspector";
import type { ComponentId, RepairToolName, ResultId } from "@/domain/types";
import { useRepair } from "@/state/RepairProvider";

export function App() {
  const { state, snapshot, invokeTool, reset } = useRepair();
  const latestMessage = state.activity.at(-1)?.message ?? "Repair bench ready.";

  const startDiagnosis = () => {
    invokeTool("identify_appliance", { applianceId: "clunk-wm01" }, "human");
    invokeTool("start_diagnosis", { symptomId: "will-not-drain" }, "human");
  };

  const recordResult = (resultId: ResultId) => {
    if (!state.currentStepId) return;
    invokeTool("record_check_result", { checkId: state.currentStepId, resultId }, "human");
  };

  const highlightComponent = (componentId: ComponentId) => {
    invokeTool("highlight_component", { componentId }, "human");
  };

  const runManualTool = (name: RepairToolName, input: Record<string, unknown>) => {
    invokeTool(name, input, "manual");
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#repair-bench">
        Skip to repair bench
      </a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Clunk home">
          Clunk<span aria-hidden="true">.</span>
        </a>
        <div className="topbar__meta">
          <span className="model-badge">Fictional demo · WM-01</span>
          <StatusPill status={state.webMcpStatus} />
          <button className="reset-button" type="button" onClick={reset}>
            <RotateCcw size={16} aria-hidden="true" />
            Reset
          </button>
        </div>
      </header>

      <main id="top">
        <section
          className={`intro-band ${snapshot.appliance ? "intro-band--compact" : ""}`}
          aria-labelledby="intro-title"
        >
          <div>
            <div className="intro-eyebrow">
              <span className="intro-eyebrow__dot" aria-hidden="true" />
              One washer. One no-drain problem.
            </div>
            <h1 id="intro-title">Tell it what&apos;s broken.</h1>
            <p>It shows you what to check and finds the exact part.</p>
          </div>
          <div className="symptom-block">
            <span>Current symptom</span>
            <strong>Washer will not drain</strong>
            {!snapshot.appliance ? (
              <button className="button button--dark" type="button" onClick={startDiagnosis}>
                Diagnose this washer
              </button>
            ) : (
              <span className="diagnosis-active">Diagnosis in progress · {snapshot.progress}%</span>
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
          <span style={{ width: `${snapshot.progress}%` }} />
        </div>

        <section
          className="repair-bench"
          id="repair-bench"
          aria-label="Shared appliance repair bench"
        >
          <DiagnosticRail state={state} />
          <ApplianceDiagram
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
            <PartResult part={snapshot.selectedPart} />
            <CauseStack causes={snapshot.likelyCauses} visible={Boolean(snapshot.symptom)} />
            {snapshot.phase === "result" || snapshot.phase === "escalated" ? (
              <RepairContext />
            ) : null}
          </aside>
        </section>

        <section className="protocol-band" aria-label="Agent activity and tool inspector">
          <ActivityLog activity={state.activity} />
          <ToolInspector onRun={runManualTool} />
        </section>
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
