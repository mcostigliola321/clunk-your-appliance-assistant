import { BadgeCheck, CircleCheck, ExternalLink, ShieldAlert, Wrench } from "lucide-react";

import type { PartOutcome } from "@/domain/types";

export function PartResult({ outcome }: { outcome: PartOutcome | null }) {
  if (!outcome) return null;
  const exact = outcome.status === "exact" && outcome.part;
  const Icon = exact ? Wrench : outcome.status === "no-part-needed" ? CircleCheck : ShieldAlert;

  return (
    <section className={`part-result part-result--${outcome.status}`} aria-labelledby="part-title">
      <div className="part-result__icon" aria-hidden="true">
        <Icon size={20} />
      </div>
      <div className="part-result__body">
        <div className="section-kicker">Compatibility outcome</div>
        <h2 id="part-title">{outcome.title}</h2>
        {exact ? <div className="part-sku">{outcome.part?.sku}</div> : null}
        <p className="part-message">{outcome.message}</p>
        {exact ? (
          <dl className="part-details">
            <div>
              <dt>Verified model code</dt>
              <dd>
                <BadgeCheck size={15} aria-hidden="true" /> {outcome.part?.compatibleModel}
              </dd>
            </div>
            <div>
              <dt>Install boundary</dt>
              <dd>Professional only</dd>
            </div>
          </dl>
        ) : null}
        {outcome.requiredProductCode ? (
          <div className="product-code-needed">
            <strong>Before buying anything</strong>
            <span>{outcome.requiredProductCode}</span>
          </div>
        ) : null}
        {outcome.source ? (
          <a className="part-source" href={outcome.source.url} target="_blank" rel="noreferrer">
            View {outcome.source.publisher} evidence <ExternalLink size={14} aria-hidden="true" />
          </a>
        ) : null}
        <p className="part-disclaimer">
          A compatibility match is not a confirmed diagnosis. No purchase link or installation
          procedure is provided.
        </p>
      </div>
    </section>
  );
}
