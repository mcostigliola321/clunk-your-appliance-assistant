import type { RepairPackPart } from "./types";

const PURCHASE_READY_LABELS = new Set(["in stock", "available to add to cart"]);

export function isPurchaseReadyAvailability(value: string | undefined): boolean {
  return Boolean(value && PURCHASE_READY_LABELS.has(value.trim().toLowerCase()));
}

export function hasVerifiedLiveCommerce(part: RepairPackPart | undefined): boolean {
  if (!part?.commerce) return false;
  return (
    part.commerce.provider === "shopify-global-catalog" &&
    part.commerce.protocol === "UCP" &&
    part.commerce.exactSku.toUpperCase() === part.sku.toUpperCase() &&
    part.commerce.offerCountAtVerification > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(part.commerce.lastVerified)
  );
}

export function isPurchaseReadyPart(part: RepairPackPart | undefined): boolean {
  return (
    hasVerifiedLiveCommerce(part) ||
    isPurchaseReadyAvailability(part?.purchase?.availabilityAtVerification)
  );
}
