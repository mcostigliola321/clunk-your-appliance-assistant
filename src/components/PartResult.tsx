import {
  BadgeCheck,
  CircleCheck,
  ExternalLink,
  ShieldAlert,
  ShoppingCart,
  Wrench,
} from "lucide-react";

import { LivePartOffers } from "@/components/LivePartOffers";
import type { PartOutcome } from "@/domain/types";
import { isPurchaseReadyAvailability } from "@/domain/purchase";

export function PartResult({ outcome }: { outcome: PartOutcome | null }) {
  if (!outcome) return null;
  const exact = outcome.status === "exact" && outcome.part;
  const purchase = outcome.part?.purchase;
  const available = isPurchaseReadyAvailability(purchase?.availabilityAtVerification);
  const Icon = exact ? Wrench : outcome.status === "no-part-needed" ? CircleCheck : ShieldAlert;

  return (
    <section className={`part-result part-result--${outcome.status}`} aria-labelledby="part-title">
      <div className="part-result__icon" aria-hidden="true">
        <Icon size={20} />
      </div>
      <div className="part-result__body">
        <h2 id="part-title" tabIndex={-1}>
          {outcome.title}
        </h2>
        {exact ? (
          <>
            <p className="part-fit-proof">
              <BadgeCheck size={16} aria-hidden="true" /> Clunk confirmed the fit for the complete
              model number
            </p>
            <div className="part-name">{outcome.part?.name}</div>
            <div className="part-sku">Part #{outcome.part?.sku}</div>
          </>
        ) : null}
        <p className="part-message">{outcome.message}</p>
        {outcome.status === "professional-only" ? (
          <div className="result-next-step">
            <strong>What to do next</strong>
            <p>
              Stop the inspection and contact an independent qualified appliance technician. Share
              the complete model number and the observations above; Clunk does not assign or endorse
              a service company.
            </p>
          </div>
        ) : null}
        {outcome.status === "variant-needed" ? (
          <div className="result-next-step">
            <strong>No substitute will be shown</strong>
            <p>
              Return to the appliance label and copy the full code. If this model is checks-only,
              use the manufacturer source below when speaking with a qualified technician.
            </p>
          </div>
        ) : null}
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
                <dd>
                  {outcome.part?.location ??
                    `Inside the highlighted area of the ${outcome.applianceNoun}`}
                </dd>
              </div>
            </dl>
            {outcome.part?.commerce ? <LivePartOffers part={outcome.part} /> : null}
            {purchase && !outcome.part?.commerce ? (
              <div className="purchase-handoff">
                <div className="purchase-handoff__summary">
                  <span>
                    <small>{purchase.seller}</small>
                    <strong>{purchase.priceAtVerification}</strong>
                  </span>
                  <span
                    className={`purchase-availability${available ? "" : " purchase-availability--unavailable"}`}
                  >
                    {purchase.availabilityAtVerification}
                  </span>
                </div>
                <a
                  className="button button--purchase"
                  href={purchase.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ShoppingCart size={17} aria-hidden="true" />
                  {available ? "Buy this part" : "View this part"}
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
                <small className="purchase-verified">
                  Opens {purchase.seller} in a new tab. Price and availability were checked{" "}
                  {purchase.lastVerified}.
                </small>
              </div>
            ) : null}
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
            Confirm the full model number again on the seller page before ordering.{" "}
            {outcome.part?.installBoundary === "professional-only"
              ? "This is an internal repair for a qualified appliance technician."
              : "Follow the manufacturer or seller instructions and stop if the visible part does not match."}
          </p>
        ) : null}
      </div>
    </section>
  );
}
