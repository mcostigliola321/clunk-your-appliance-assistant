import { Check, Circle, OctagonAlert } from "lucide-react";

import { repairPack } from "@/domain/repairPack";
import type { CheckId, RepairState } from "@/domain/types";

function getStepState(state: RepairState, checkId: CheckId) {
  if (state.escalation) return state.completedChecks[checkId] ? "complete" : "stopped";
  if (state.completedChecks[checkId]) return "complete";
  if (state.currentStepId === checkId) return "current";
  return "upcoming";
}

export function DiagnosticRail({ state }: { state: RepairState }) {
  return (
    <nav className="diagnostic-rail" aria-label="Diagnostic progress">
      <div className="section-kicker">Diagnosis</div>
      <ol className="diagnostic-steps">
        {repairPack.checks.map((check, index) => {
          const stepState = getStepState(state, check.id);
          return (
            <li className={`diagnostic-step diagnostic-step--${stepState}`} key={check.id}>
              <span className="diagnostic-step__marker" aria-hidden="true">
                {stepState === "complete" ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : stepState === "stopped" ? (
                  <OctagonAlert size={14} strokeWidth={2.25} />
                ) : (
                  <Circle size={11} fill="currentColor" strokeWidth={0} />
                )}
              </span>
              <span>
                <span className="diagnostic-step__number">0{index + 1}</span>
                <span className="diagnostic-step__label">{check.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="rail-note">Visible checks only. Clunk never asks you to remove a panel.</p>
    </nav>
  );
}
