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
  onStart,
  onUseProductCode,
  exactPartAvailable,
  exampleProductCode,
}: Pick<
  NextCheckPanelProps,
  "onStart" | "onUseProductCode" | "exactPartAvailable" | "exampleProductCode"
>) {
  const [productCode, setProductCode] = useState("");

  if (!exactPartAvailable) {
    return (
      <section className="next-check" aria-labelledby="next-check-title">
        <h2 id="next-check-title">We can show you what to check.</h2>
        <p>
          Clunk does not have a verified part link for this washer yet. We&apos;ll tell you where to
          look and when to call a technician.
        </p>
        <button className="button button--primary button--wide" type="button" onClick={onStart}>
          Show me the checks <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>
    );
  }

  return (
    <section className="next-check" aria-labelledby="next-check-title">
      <div className="next-check__status">
        <CircleCheck size={17} aria-hidden="true" />
        One detail first
      </div>
      <h2 id="next-check-title">Enter the full model number.</h2>
      <p>Find it on the sticker inside the washer door. This makes sure the part actually fits.</p>
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
          placeholder={exampleProductCode ?? "Enter the full number from the label"}
          required
        />
        <button className="button button--primary button--wide" type="submit">
          Continue <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>
      {exampleProductCode ? (
        <button
          className="demo-code-button"
          type="button"
          onClick={() => onUseProductCode(exampleProductCode)}
        >
          Use demo model number {exampleProductCode}
        </button>
      ) : null}
    </section>
  );
}

export function NextCheckPanel({
  snapshot,
  onStart,
  onResult,
  onFindPart,
  onUseProductCode,
  exactPartAvailable,
  exampleProductCode,
}: NextCheckPanelProps) {
  if (!snapshot.appliance) return null;
  if (!snapshot.symptom)
    return (
      <ModelCodeStep
        onStart={onStart}
        onUseProductCode={onUseProductCode}
        exactPartAvailable={exactPartAvailable}
        exampleProductCode={exampleProductCode}
      />
    );

  if (snapshot.escalation) {
    return (
      <section className="next-check next-check--stop" aria-labelledby="next-check-title">
        <div className="next-check__status">
          <OctagonAlert size={17} aria-hidden="true" />
          Stop here
        </div>
        <h2 id="next-check-title">A professional should continue.</h2>
        <p>{snapshot.escalation.message}</p>
        <div className="safety-boundary">Do not continue taking the washer apart.</div>
      </section>
    );
  }

  if (snapshot.partOutcome) return null;

  if (!snapshot.currentStep) {
    return (
      <section className="next-check next-check--result" aria-labelledby="next-check-title">
        <div className="next-check__status">
          <CircleCheck size={17} aria-hidden="true" />
          Checks complete
        </div>
        <h2 id="next-check-title">Here&apos;s the best next step.</h2>
        <p>{snapshot.likelyCauses[0]?.explanation}</p>
        {!snapshot.partOutcome ? (
          <button
            className="button button--primary button--wide"
            type="button"
            onClick={onFindPart}
          >
            Show me the answer
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
        {check.id === "prepare-power" ? "Make it safe" : "Look here"}
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
