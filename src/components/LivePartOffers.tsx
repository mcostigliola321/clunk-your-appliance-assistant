import { ExternalLink, RefreshCw, ShoppingCart } from "lucide-react";
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
  "seller-listed-oem": "Seller lists as OEM",
  "exact-part-listing": "Exact part-number listing",
  "compatible-replacement": "Compatible replacement listing",
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

  return (
    <section className="live-offers" aria-labelledby="live-offers-title">
      <div className="live-offers__heading">
        <div>
          <h3 id="live-offers-title">Live offers from Shopify</h3>
          <p>UCP catalog search · exact part number {part.sku} only</p>
        </div>
        <span className="live-offers__status">Live lookup</span>
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
                  <span>{OFFER_LABELS[offer.kind]}</span>
                </div>
                <strong className="live-offers__price">{formatShopifyPrice(offer)}</strong>
                <a
                  className="button button--purchase live-offers__cart"
                  href={offer.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${offer.seller} cart for part ${part.sku} in a new tab`}
                >
                  <ShoppingCart size={16} aria-hidden="true" />
                  Open cart
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="live-offers__disclosure">
        Clunk verified the model-to-part match. Shopify supplies live seller listings and checkout
        links. “OEM” and “compatible” are merchant claims; confirm the seller and exact part number
        before paying.
      </p>
    </section>
  );
}
