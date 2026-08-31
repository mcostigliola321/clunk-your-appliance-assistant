import { ArrowRight, CheckCircle2, CircleDot, Eye, LockKeyhole, ShieldAlert } from "lucide-react";

import type { RepairSnapshot, RepairToolName } from "@/domain/types";

function ToolState({
  name,
  label,
  state,
}: {
  name: RepairToolName;
  label: string;
  state: "available" | "complete" | "locked";
}) {
  return (
    <span className={`handoff-tool is-${state}`}>
      {state === "complete" ? (
        <CheckCircle2 size={14} aria-hidden="true" />
      ) : state === "available" ? (
        <CircleDot size={14} aria-hidden="true" />
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
  const hasAnswer = Boolean(snapshot.partOutcome);

  if (snapshot.exampleMode) {
    return (
      <section className="handoff-status handoff-status--example" aria-labelledby="handoff-title">
        <div className="handoff-status__eyebrow">Preview, not an agent run</div>
        <h2 id="handoff-title">The sample answers were filled in beforehand.</h2>
        <p>
          They show a finished outcome without pretending that a browser observed the appliance.
          Start over to use your own.
        </p>
        <div className="handoff-transition" aria-label="Preview tool sequence">
          <ToolState name="record_observation" label="Preview observation" state="complete" />
          <ArrowRight size={17} aria-hidden="true" />
          <ToolState name="find_compatible_part" label="Preview part lookup" state="complete" />
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
          <ToolState name="record_observation" label="Inspection ended" state="locked" />
          <ArrowRight size={17} aria-hidden="true" />
          <ToolState name="find_compatible_part" label="Part lookup unavailable" state="locked" />
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
        Person + browser agent
      </div>
      <h2 id="handoff-title">
        {waitingForHuman
          ? "Clunk is waiting for what you see."
          : hasAnswer
            ? "Your observation led to this answer."
            : "Your observation unlocked the next step."}
      </h2>
      <p>
        {waitingForHuman
          ? "Complete the visible check above, then choose only what is actually there. A browser agent cannot supply this answer for you."
          : hasAnswer
            ? "Clunk used the observation you supplied, then completed only the lookup the repair state allowed."
            : "The answer changed what the browser agent is allowed to do. A part lookup is now available."}
      </p>
      <div className="handoff-transition" aria-label="Current WebMCP tool handoff">
        <ToolState
          name="record_observation"
          label={recordActive ? "Waiting for your observation" : "Observation recorded"}
          state={recordActive ? "available" : "complete"}
        />
        <ArrowRight size={17} aria-hidden="true" />
        <ToolState
          name="find_compatible_part"
          label={
            hasAnswer
              ? "Part lookup used"
              : partActive
                ? "Part lookup available"
                : "Locked until you answer"
          }
          state={hasAnswer ? "complete" : partActive ? "available" : "locked"}
        />
      </div>
    </section>
  );
}
