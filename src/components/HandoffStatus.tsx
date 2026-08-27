import { ArrowRight, CheckCircle2, Eye, LockKeyhole, ShieldAlert } from "lucide-react";

import type { RepairSnapshot, RepairToolName } from "@/domain/types";

function ToolState({
  name,
  label,
  active,
}: {
  name: RepairToolName;
  label: string;
  active: boolean;
}) {
  return (
    <span className={`handoff-tool${active ? " is-active" : " is-locked"}`}>
      {active ? (
        <CheckCircle2 size={14} aria-hidden="true" />
      ) : (
        <LockKeyhole size={14} aria-hidden="true" />
      )}
      <span>
        <strong>{label}</strong>
        <code>{name}</code>
      </span>
    </span>
  );
}

export function HandoffStatus({ snapshot }: { snapshot: RepairSnapshot }) {
  if (!snapshot.symptom) return null;

  const recordActive = snapshot.validNextActions.includes("record_observation");
  const partActive = snapshot.validNextActions.includes("find_compatible_part");

  if (snapshot.exampleMode) {
    return (
      <section className="handoff-status handoff-status--example" aria-labelledby="handoff-title">
        <div className="handoff-status__eyebrow">Deterministic example fixture</div>
        <h2 id="handoff-title">Example replay complete — no live observation was supplied.</h2>
        <p>
          The fixture uses labeled sample observations to preview a finished outcome. It is not an
          agent run.
        </p>
        <div className="handoff-transition" aria-label="Fixture tool sequence">
          <ToolState name="record_observation" label="Sample observation replayed" active />
          <ArrowRight size={17} aria-hidden="true" />
          <ToolState name="find_compatible_part" label="Part lookup replayed" active />
        </div>
      </section>
    );
  }

  if (snapshot.escalation) {
    return (
      <section
        className="handoff-status handoff-status--stop"
        aria-labelledby="handoff-title"
        role="status"
      >
        <div className="handoff-status__eyebrow">
          <ShieldAlert size={15} aria-hidden="true" /> Safety boundary
        </div>
        <h2 id="handoff-title">Safety stop recorded — part lookup stays unavailable.</h2>
        <p>Clunk ended the workflow at the reported hazard. No purchase path is offered.</p>
        <div className="handoff-transition" aria-label="Tools unavailable after the safety stop">
          <ToolState name="record_observation" label="Inspection ended" active={false} />
          <ArrowRight size={17} aria-hidden="true" />
          <ToolState name="find_compatible_part" label="Part lookup unavailable" active={false} />
        </div>
      </section>
    );
  }

  const waitingForHuman = Boolean(snapshot.currentStep);
  return (
    <section className="handoff-status" aria-labelledby="handoff-title" role="status">
      <div className="handoff-status__eyebrow">
        {waitingForHuman ? (
          <Eye size={15} aria-hidden="true" />
        ) : (
          <CheckCircle2 size={15} aria-hidden="true" />
        )}
        Human + agent handoff
      </div>
      <h2 id="handoff-title">
        {waitingForHuman
          ? "Your turn — Clunk cannot see this."
          : "Observation recorded — part lookup unlocked."}
      </h2>
      <p>
        {waitingForHuman
          ? `Inspect the highlighted ${snapshot.highlightedComponent.label.toLowerCase()}, then choose only what you actually observe.`
          : "The physical observation changed the tools available on the page. Clunk can now resolve the evidence-bounded outcome."}
      </p>
      <div className="handoff-transition" aria-label="Current WebMCP tool handoff">
        <ToolState
          name="record_observation"
          label={recordActive ? "Waiting for your observation" : "Observation recorded"}
          active={recordActive}
        />
        <ArrowRight size={17} aria-hidden="true" />
        <ToolState
          name="find_compatible_part"
          label={partActive ? "Part lookup available" : "Locked until you answer"}
          active={partActive}
        />
      </div>
    </section>
  );
}
