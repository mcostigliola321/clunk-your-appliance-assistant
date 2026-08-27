const PURCHASE_READY_LABELS = new Set(["in stock", "available to add to cart"]);

export function isPurchaseReadyAvailability(value: string | undefined): boolean {
  return Boolean(value && PURCHASE_READY_LABELS.has(value.trim().toLowerCase()));
}
