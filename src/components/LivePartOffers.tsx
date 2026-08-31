import { ChevronDown, ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import {
  formatShopifyPrice,
  searchShopifyPartOffers,
  type ShopifyPartOffer,
} from "@/domain/shopifyCatalog";
import type { RepairPackPart } from "@/domain/types";

type OfferState =
  | { status: "loading"; offers: ShopifyPartOffer[] }
  | { status: "ready"; offers: ShopifyPartOffer[] }
  | { status: "error"; offers: ShopifyPartOffer[] };

const OFFER_LABELS: Record<ShopifyPartOffer["kind"], string> = {
  "seller-listed-oem": "Seller says OEM",
  "exact-part-listing": "Exact part number shown",
  "compatible-replacement": "Seller says compatible",
};

export function LivePartOffers({ part }: { part: RepairPackPart }) {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<OfferState>({ status: "loading", offers: [] });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState({ status: "loading", offers: [] });
    searchShopifyPartOffers(part, { signal: controller.signal })
      .then((offers) => {
        if (active) setState({ status: "ready", offers });
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof Error && error.name === "AbortError")) return;
        setState({ status: "error", offers: [] });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [part, requestKey]);

  if (!part.commerce) return null;

  const hasPromotedOffer = state.offers.some((offer) => offer.promoted);
  const statusLabel =
    state.status === "loading"
      ? "Checking"
      : state.status === "error"
        ? "Unavailable"
        : state.offers.length === 0
          ? "None found"
          : `${state.offers.length} found`;

  return (
    <section className="live-offers" aria-labelledby="live-offers-title">
      <div className="live-offers__heading">
        <div>
          <h3 id="live-offers-title">Seller listings for this part</h3>
          <p>Exact part number {part.sku} · checked through Shopify</p>
        </div>
        <span className={`live-offers__status is-${state.status}`}>{statusLabel}</span>
      </div>

      <div
        className="live-offers__results"
        aria-live="polite"
        aria-busy={state.status === "loading"}
      >
        {state.status === "loading" ? (
          <p className="live-offers__notice">Checking current U.S. seller listings…</p>
        ) : state.status === "error" ? (
          <div className="live-offers__notice live-offers__notice--error">
            <span>Shopify’s live catalog is temporarily unavailable.</span>
            <button type="button" onClick={() => setRequestKey((key) => key + 1)}>
              <RefreshCw size={14} aria-hidden="true" /> Retry
            </button>
          </div>
        ) : state.offers.length === 0 ? (
          <p className="live-offers__notice">
            No in-stock listing with the exact part number was returned. Clunk will not substitute a
            nearby SKU.
          </p>
        ) : (
          <ul className="live-offers__list">
            {state.offers.map((offer) => (
              <li key={`${offer.productId}-${offer.variantId}`}>
                <div className="live-offers__seller">
                  <strong>{offer.seller}</strong>
                  <span>
                    {offer.promoted ? "Promoted · paid placement" : OFFER_LABELS[offer.kind]}
                  </span>
                </div>
                <strong className="live-offers__price">{formatShopifyPrice(offer)}</strong>
                <a
                  className="live-offers__link"
                  href={offer.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${offer.seller} ${offer.promoted ? "promoted listing" : "offer"} for part ${part.sku} in a new tab`}
                >
                  {offer.promoted ? "View promoted offer" : "View offer"}
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <details className="live-offers__details">
        <summary>
          About these listings <ChevronDown size={15} aria-hidden="true" />
        </summary>
        <p className="live-offers__disclosure">
          {hasPromotedOffer
            ? "Promoted offers are paid placements. Clunk may earn a commission when you purchase through one. "
            : "These listings are not paid placements, and Clunk does not earn a commission from them. "}
          Shopify supplies the seller, price, and destination. “OEM” and “compatible” are seller
          claims, so confirm the seller and exact part number before paying.
        </p>
      </details>
    </section>
  );
}
