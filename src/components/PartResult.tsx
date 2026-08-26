import {
  BadgeCheck,
  CircleCheck,
  ExternalLink,
  ShieldAlert,
  ShoppingCart,
  Wrench,
} from "lucide-react";

import type { PartOutcome } from "@/domain/types";

export function PartResult({ outcome }: { outcome: PartOutcome | null }) {
  if (!outcome) return null;
  const exact = outcome.status === "exact" && outcome.part;
  const purchase = outcome.part?.purchase;
  const available = purchase?.availabilityAtVerification === "In stock";
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
          <>
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
            <div className="purchase-handoff">
              <div className="purchase-handoff__summary">
                <span>
                  <small>{purchase?.seller}</small>
                  <strong>{purchase?.priceAtVerification}</strong>
                </span>
                <span
                  className={`purchase-availability${available ? "" : " purchase-availability--unavailable"}`}
                >
                  {purchase?.availabilityAtVerification}
                </span>
              </div>
              <a
                className="button button--purchase"
                href={purchase?.url}
                target="_blank"
                rel="noreferrer"
              >
                <ShoppingCart size={17} aria-hidden="true" />
                {available ? "View product" : "Review listing"} at {purchase?.seller}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              <small className="purchase-verified">
                Price and stock checked {purchase?.lastVerified}; seller controls live availability
                and checkout.
              </small>
            </div>
          </>
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
          A compatibility match is not a confirmed diagnosis. Clunk does not sell parts or provide
          an internal installation procedure.
        </p>
      </div>
    </section>
  );
}
