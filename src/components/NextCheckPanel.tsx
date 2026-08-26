import { ArrowRight, CircleCheck, OctagonAlert, ShieldCheck } from "lucide-react";

import type { RepairSnapshot, ResultId } from "@/domain/types";

interface NextCheckPanelProps {
  snapshot: RepairSnapshot;
  onStart: () => void;
  onResult: (resultId: ResultId) => void;
  onFindPart: () => void;
}

function EmptyCheck({ onStart, modelSelected }: { onStart: () => void; modelSelected: boolean }) {
  return (
    <section className="next-check" aria-labelledby="next-check-title">
      <div className="next-check__status">
        <ShieldCheck size={17} aria-hidden="true" />
        Guided, visible checks only
      </div>
      <h2 id="next-check-title">
        {modelSelected
          ? "Start with what you can safely see."
          : "Choose the model before the diagnosis."}
      </h2>
      <p>
        {modelSelected
          ? "Clunk will ask one question at a time, update the washer diagram, and narrow the likely cause."
          : "Search the rating-label model above. Clunk will not borrow steps or parts from a similar-looking washer."}
      </p>
      {modelSelected ? (
        <button className="button button--primary button--wide" type="button" onClick={onStart}>
          Start diagnosis <ArrowRight size={18} aria-hidden="true" />
        </button>
      ) : null}
      <p className="microcopy">About 2 minutes · no login · source backed</p>
    </section>
  );
}

export function NextCheckPanel({ snapshot, onStart, onResult, onFindPart }: NextCheckPanelProps) {
  if (!snapshot.appliance) return <EmptyCheck onStart={onStart} modelSelected={false} />;
  if (!snapshot.symptom) return <EmptyCheck onStart={onStart} modelSelected />;

  if (snapshot.escalation) {
    return (
      <section className="next-check next-check--stop" aria-labelledby="next-check-title">
        <div className="next-check__status">
          <OctagonAlert size={17} aria-hidden="true" />
          Stop here
        </div>
        <h2 id="next-check-title">A professional should continue.</h2>
        <p>{snapshot.escalation.message}</p>
        <div className="safety-boundary">No further repair steps are available in this demo.</div>
      </section>
    );
  }

  if (!snapshot.currentStep) {
    return (
      <section className="next-check next-check--result" aria-labelledby="next-check-title">
        <div className="next-check__status">
          <CircleCheck size={17} aria-hidden="true" />
          Checks complete
        </div>
        <h2 id="next-check-title">Clunk reached an evidence boundary.</h2>
        <p>{snapshot.likelyCauses[0]?.explanation}</p>
        {!snapshot.partOutcome ? (
          <button
            className="button button--primary button--wide"
            type="button"
            onClick={onFindPart}
          >
            Resolve the part outcome
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : null}
      </section>
    );
  }

  const check = snapshot.currentStep;
  return (
    <section className="next-check" aria-labelledby="next-check-title">
      <div className="next-check__status">
        <ShieldCheck size={17} aria-hidden="true" />
        {check.id === "prepare-power" ? "Required safety check" : "Safe observation"}
      </div>
      <div className="step-count">Next check</div>
      <h2 id="next-check-title">{check.label}</h2>
      <p className="instruction">{check.instruction}</p>
      <dl className="check-context">
        <div>
          <dt>Why</dt>
          <dd>{check.why}</dd>
        </div>
        <div className="check-context__stop">
          <dt>Stop if</dt>
          <dd>{check.stop}</dd>
        </div>
      </dl>
      <fieldset className="observation-options">
        <legend>What do you observe?</legend>
        {check.results.map((item, index) => {
          const isHazard = item.id.startsWith("hazard-") || item.id.startsWith("unsafe-");
          return (
            <button
              className={`observation-button ${index === 0 && !isHazard ? "observation-button--recommended" : ""}`}
              type="button"
              key={item.id}
              onClick={() => onResult(item.id)}
            >
              <span>{item.label}</span>
              {isHazard ? (
                <OctagonAlert size={17} aria-hidden="true" />
              ) : (
                <ArrowRight size={17} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </fieldset>
    </section>
  );
}
