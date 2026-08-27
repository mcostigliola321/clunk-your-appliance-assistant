import { ArrowRight, CircleCheck, OctagonAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";

import type { RepairSnapshot, ResultId } from "@/domain/types";

interface NextCheckPanelProps {
  snapshot: RepairSnapshot;
  onStart: () => void;
  onResult: (resultId: ResultId) => void;
  onFindPart: () => void;
  onUseProductCode: (productCode: string) => void;
  exactPartAvailable: boolean;
  exampleProductCode: string | null;
}

function ModelCodeStep({
  snapshot,
  onStart,
  onUseProductCode,
  exactPartAvailable,
  exampleProductCode,
}: NextCheckPanelProps) {
  const [productCode, setProductCode] = useState("");
  if (!exactPartAvailable) {
    return (
      <section className="next-check" aria-labelledby="next-check-title">
        <div className="next-check__status">
          <ShieldCheck size={17} aria-hidden="true" /> Guided checks
        </div>
        <h2 id="next-check-title">We can show you what to check.</h2>
        <p>
          This model does not have a verified part link yet. Clunk will still show safe locations
          and a clear stopping point.
        </p>
        <button className="button button--primary button--wide" type="button" onClick={onStart}>
          Start the checks <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>
    );
  }
  return (
    <section className="next-check" aria-labelledby="next-check-title">
      <div className="next-check__status">
        <CircleCheck size={17} aria-hidden="true" /> Purchase-ready model
      </div>
      <h2 id="next-check-title">Confirm the full model number.</h2>
      <p>
        Use the complete number on the appliance label. That is what makes the final part link
        specific.
      </p>
      <form
        className="product-code-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (productCode.trim()) onUseProductCode(productCode.trim());
        }}
      >
        <label htmlFor="product-code">Full model number</label>
        <input
          id="product-code"
          value={productCode}
          onChange={(event) => setProductCode(event.target.value)}
          placeholder={exampleProductCode ?? "Complete model number"}
          required
        />
        <button className="button button--primary button--wide" type="submit">
          Start diagnosis <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>
      {exampleProductCode ? (
        <button
          className="demo-code-button"
          type="button"
          onClick={() => onUseProductCode(exampleProductCode)}
        >
          Use verified demo model {exampleProductCode}
        </button>
      ) : null}
      <small className="model-code-hint">
        Look inside the door or fresh-food compartment for the label.
      </small>
    </section>
  );
}

export function NextCheckPanel(props: NextCheckPanelProps) {
  const { snapshot, onStart, onResult, onFindPart } = props;
  if (!snapshot.appliance) return null;
  if (!snapshot.symptom) return <ModelCodeStep {...props} />;
  if (snapshot.escalation) {
    return (
      <section className="next-check next-check--stop" aria-labelledby="next-check-title">
        <div className="next-check__status">
          <OctagonAlert size={17} aria-hidden="true" /> Stop here
        </div>
        <h2 id="next-check-title">A professional should continue.</h2>
        <p>{snapshot.escalation.message}</p>
        <div className="safety-boundary">Do not move the appliance or remove another panel.</div>
      </section>
    );
  }
  if (snapshot.partOutcome) return null;
  if (!snapshot.currentStep) {
    return (
      <section className="next-check next-check--result" aria-labelledby="next-check-title">
        <div className="next-check__status">
          <CircleCheck size={17} aria-hidden="true" /> Answer ready
        </div>
        <h2 id="next-check-title">Here is the best next step.</h2>
        <p>{snapshot.likelyCauses[0]?.explanation}</p>
        <button className="button button--primary button--wide" type="button" onClick={onFindPart}>
          Show the part or fix <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>
    );
  }
  const check = snapshot.currentStep;
  return (
    <section className="next-check" aria-labelledby="next-check-title">
      <div className="next-check__status">
        <ShieldCheck size={17} aria-hidden="true" />{" "}
        {check.id === "safety-check" ? "Make it safe" : "Look here"}
      </div>
      <div className="step-count">Step {Object.keys(snapshot.completedChecks).length + 1}</div>
      <h2 id="next-check-title">{check.label}</h2>
      <p className="instruction">{check.instruction}</p>
      <p className="stop-copy">
        <strong>Stop if:</strong> {check.stop}
      </p>
      <fieldset className="observation-options">
        <legend>What do you see?</legend>
        {check.results.map((item, index) => {
          const isHazard = item.effect === "hazard";
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
