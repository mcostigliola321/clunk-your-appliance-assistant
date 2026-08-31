import { ArrowLeft, ArrowRight, CircleCheck, OctagonAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";

import type { CapabilityTier, RepairSnapshot, ResultId } from "@/domain/types";

interface NextCheckPanelProps {
  snapshot: RepairSnapshot;
  onStart: () => void;
  onResult: (resultId: ResultId) => void;
  onFindPart: () => void;
  onUseProductCode: (productCode: string) => { ok: boolean; message: string } | null;
  onBack: () => void;
  canUndo: boolean;
  capability: CapabilityTier;
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button className="diagnosis-back" type="button" onClick={onBack}>
      <ArrowLeft size={17} aria-hidden="true" /> Change the last answer
    </button>
  );
}

function ModelCodeStep({ snapshot, onStart, onUseProductCode, capability }: NextCheckPanelProps) {
  const [productCode, setProductCode] = useState("");
  const [modelError, setModelError] = useState<string | null>(null);
  if (capability === "guided-checks") {
    return (
      <section className="next-check" aria-labelledby="next-check-title">
        <div className="next-check__status">
          <ShieldCheck size={17} aria-hidden="true" /> Safe checks
        </div>
        <h2 id="next-check-title" tabIndex={-1}>
          We can show you what to check.
        </h2>
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
  const unavailable = capability === "verified-part-unavailable";
  return (
    <section className="next-check" aria-labelledby="next-check-title">
      <div className="next-check__status">
        <CircleCheck size={17} aria-hidden="true" />
        {unavailable ? "Exact part currently unavailable" : "Exact part available"}
      </div>
      <h2 id="next-check-title" tabIndex={-1}>
        Confirm the full model number.
      </h2>
      <p>
        {unavailable
          ? "Clunk has a model match for the part, but no current seller listing. The full model number keeps that answer specific."
          : "Use the complete number on the appliance label. That is what makes the final part link specific."}
      </p>
      <form
        className="product-code-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (productCode.trim()) {
            const result = onUseProductCode(productCode.trim());
            setModelError(result && !result.ok ? result.message : null);
          }
        }}
      >
        <label htmlFor="product-code">Full model number</label>
        <input
          id="product-code"
          value={productCode}
          onChange={(event) => setProductCode(event.target.value)}
          placeholder="Complete model number"
          required
        />
        <button className="button button--primary button--wide" type="submit">
          {unavailable ? "Start the checks" : "Start diagnosis"}{" "}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        {modelError ? (
          <p className="product-code-error" role="alert">
            {modelError}
          </p>
        ) : null}
      </form>
      <small className="model-code-hint">
        Look inside the door or fresh-food compartment for the label.
      </small>
    </section>
  );
}

export function NextCheckPanel(props: NextCheckPanelProps) {
  const { snapshot, onStart, onResult, onFindPart, onBack, canUndo } = props;
  if (!snapshot.appliance) return null;
  if (snapshot.phase === "idle") return <ModelCodeStep {...props} />;
  if (snapshot.escalation) {
    return (
      <section className="next-check next-check--stop" aria-labelledby="next-check-title">
        <div className="next-check__status">
          <OctagonAlert size={17} aria-hidden="true" /> Stop here
        </div>
        <h2 id="next-check-title" tabIndex={-1}>
          A professional should continue.
        </h2>
        <p>{snapshot.escalation.message}</p>
        <div className="safety-boundary">Do not move the appliance or remove another panel.</div>
        <p className="service-next-step">
          Contact an independent qualified appliance technician and share the complete model number
          plus what you observed. Clunk does not assign or endorse a service company.
        </p>
      </section>
    );
  }
  if (snapshot.partOutcome)
    return canUndo ? (
      <div className="result-back">
        <BackButton onBack={onBack} />
      </div>
    ) : null;
  if (!snapshot.currentStep) {
    return (
      <section className="next-check next-check--result" aria-labelledby="next-check-title">
        <div className="next-check__status">
          <CircleCheck size={17} aria-hidden="true" /> Answer ready
        </div>
        {canUndo ? <BackButton onBack={onBack} /> : null}
        <h2 id="next-check-title" tabIndex={-1}>
          Here is the best next step.
        </h2>
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
      {canUndo ? <BackButton onBack={onBack} /> : null}
      <div className="next-check__status">
        <ShieldCheck size={17} aria-hidden="true" />{" "}
        {check.id === "safety-check" ? "Make it safe" : "Look here"}
      </div>
      <div className="step-count">Step {Object.keys(snapshot.completedChecks).length + 1}</div>
      <h2 id="next-check-title" tabIndex={-1}>
        {check.label}
      </h2>
      <p className="instruction">{check.instruction}</p>
      <p className="stop-copy">
        <strong>Stop if:</strong> {check.stop}
      </p>
      <fieldset className="observation-options">
        <legend>What do you see?</legend>
        {check.results.slice(0, 4).map((item) => {
          const isHazard = item.effect === "hazard";
          return (
            <button
              className="observation-button"
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
