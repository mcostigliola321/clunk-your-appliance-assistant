import { Check, Circle, OctagonAlert } from "lucide-react";

import { getRepairPack } from "@/domain/repairPack";
import type { CheckId, RepairState } from "@/domain/types";

function getStepState(state: RepairState, checkId: CheckId) {
  if (state.escalation) return state.completedChecks[checkId] ? "complete" : "stopped";
  if (state.completedChecks[checkId]) return "complete";
  if (state.currentStepId === checkId) return "current";
  return "upcoming";
}

export function DiagnosticRail({ state }: { state: RepairState }) {
  const pack = state.packId ? getRepairPack(state.packId) : null;
  return (
    <nav className="diagnostic-rail" aria-label="Diagnostic progress">
      <div className="section-kicker">Diagnosis</div>
      <ol className="diagnostic-steps">
        {(pack?.checks ?? []).map((check, index) => {
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
      {!pack ? (
        <p className="rail-empty">
          01 Select model
          <br />
          02 Report what you see
          <br />
          03 Resolve the next step
        </p>
      ) : null}
      <p className="rail-note">
        External and manufacturer-documented user access only. No energized or internal repair
        steps.
      </p>
    </nav>
  );
}
