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
        <h2 id="part-title">{outcome.title}</h2>
        {exact ? (
          <>
            <div className="part-name">{outcome.part?.name}</div>
            <div className="part-sku">Part #{outcome.part?.sku}</div>
          </>
        ) : null}
        <p className="part-message">{outcome.message}</p>
        {exact ? (
          <>
            <dl className="part-details">
              <div>
                <dt>Fits</dt>
                <dd>
                  <BadgeCheck size={15} aria-hidden="true" /> {outcome.part?.compatibleModel}
                </dd>
              </div>
              <div>
                <dt>Where it is</dt>
                <dd>Lower front of the washer, behind the filter area</dd>
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
                {available ? "Buy this part" : "View this part"}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              <small className="purchase-verified">
                Opens {purchase?.seller} in a new tab. Price and stock were checked{" "}
                {purchase?.lastVerified}.
              </small>
            </div>
          </>
        ) : null}
        {outcome.requiredProductCode ? (
          <div className="product-code-needed">
            <strong>We need the full model number</strong>
            <span>{outcome.requiredProductCode}</span>
          </div>
        ) : null}
        {outcome.source ? (
          <a className="part-source" href={outcome.source.url} target="_blank" rel="noreferrer">
            Read the {outcome.source.publisher} instructions{" "}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ) : null}
        {exact ? (
          <p className="part-disclaimer">
            Confirm the full model number again on the seller page before ordering. Replacing an
            internal pump is a job for a qualified appliance technician.
          </p>
        ) : null}
      </div>
    </section>
  );
}
