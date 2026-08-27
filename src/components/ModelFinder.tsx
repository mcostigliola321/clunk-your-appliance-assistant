import { ArrowRight, BadgeCheck, Search, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";

import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import { isPurchaseReadyAvailability } from "@/domain/purchase";
import type { ApplianceKind, BrandName, RepairSnapshot } from "@/domain/types";

const KINDS: Array<{ id: ApplianceKind; label: string; problem: string; glyph: string }> = [
  { id: "washer", label: "Washer", problem: "Won't drain", glyph: "01" },
  { id: "dishwasher", label: "Dishwasher", problem: "Won't drain", glyph: "02" },
  { id: "dryer", label: "Electric dryer", problem: "Door won't close", glyph: "03" },
  { id: "refrigerator", label: "Refrigerator", problem: "Water is slow", glyph: "04" },
];

interface ModelFinderProps {
  snapshot: RepairSnapshot;
  selectedId: string | null;
  onSearch: (query: string, brand: BrandName | null, kind: ApplianceKind) => void;
  onSelect: (applianceId: string, productCode?: string) => void;
  onExample: (applianceId: string) => void;
}

export function ModelFinder({
  snapshot,
  selectedId,
  onSearch,
  onSelect,
  onExample,
}: ModelFinderProps) {
  const [query, setQuery] = useState(snapshot.catalogQuery);
  const [brand, setBrand] = useState<BrandName | null>(null);
  const [kind, setKind] = useState<ApplianceKind>(snapshot.catalogKind ?? "dryer");
  const activeKind = KINDS.find((item) => item.id === kind)!;
  const categoryEntries = APPLIANCE_CATALOG.filter((entry) => entry.kind === kind);
  const brands = [...new Set(categoryEntries.map((entry) => entry.brand))];
  const flagship = categoryEntries.find((entry) =>
    isPurchaseReadyAvailability(entry.exactPart?.purchase.availabilityAtVerification),
  );
  const results = useMemo(
    () => snapshot.catalogResults.filter((item) => item.kind === kind),
    [kind, snapshot.catalogResults],
  );

  const chooseKind = (next: ApplianceKind) => {
    setKind(next);
    setBrand(null);
    setQuery("");
    onSearch("", null, next);
  };

  return (
    <section className="model-finder" aria-labelledby="model-finder-title">
      <div className="model-finder__heading">
        <span className="section-kicker">Start with what is broken</span>
        <h2 id="model-finder-title">Choose an appliance</h2>
      </div>

      <div className="category-grid" aria-label="Appliance category">
        {KINDS.map((item) => (
          <button
            className={`category-card ${kind === item.id ? "is-active" : ""}`}
            type="button"
            aria-pressed={kind === item.id}
            key={item.id}
            onClick={() => chooseKind(item.id)}
          >
            <span className="category-card__number">{item.glyph}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.problem}</small>
            </span>
          </button>
        ))}
      </div>

      {flagship ? (
        <article className="flagship-answer">
          <div className="flagship-answer__copy">
            <div className="flagship-answer__eyebrow">
              <BadgeCheck size={16} aria-hidden="true" /> Purchase-ready example
            </div>
            <h3>{activeKind.problem}</h3>
            <p>
              {flagship.brand} {flagship.verifiedProductCodes[0] ?? flagship.model} · exact model,
              part, price, and seller
            </p>
          </div>
          <button
            className="button button--example"
            type="button"
            onClick={() => onExample(flagship.id)}
          >
            See the full answer <ArrowRight size={18} aria-hidden="true" />
          </button>
          <small className="flagship-answer__promise">
            <ShoppingBag size={14} aria-hidden="true" /> One click ends at the part link
          </small>
        </article>
      ) : null}

      <div className="diagnose-divider">
        <span>or diagnose yours</span>
      </div>

      <form
        className="model-search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(query, brand, kind);
        }}
      >
        <label htmlFor="model-query">{activeKind.label} model number</label>
        <div className="model-search__row">
          <Search size={18} aria-hidden="true" />
          <input
            id="model-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Example: ${flagship?.verifiedProductCodes[0] ?? categoryEntries[0]?.model ?? "model number"}`}
          />
          <button type="submit">Find model</button>
        </div>
      </form>

      <details className="model-browser" open={Boolean(snapshot.catalogQuery || brand)}>
        <summary>
          Browse {categoryEntries.length} supported {activeKind.label.toLowerCase()} models{" "}
          <ArrowRight size={17} aria-hidden="true" />
        </summary>
        <div className="brand-filters" aria-label="Filter by brand">
          {brands.map((name) => (
            <button
              className={brand === name ? "is-active" : ""}
              type="button"
              aria-pressed={brand === name}
              key={name}
              onClick={() => {
                const next = brand === name ? null : name;
                setBrand(next);
                onSearch(query, next, kind);
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="model-results" aria-live="polite">
          {results.length ? (
            results.slice(0, 8).map((item) => {
              const entry = APPLIANCE_CATALOG.find((candidate) => candidate.id === item.id)!;
              const purchaseReady = Boolean(
                isPurchaseReadyAvailability(entry.exactPart?.purchase.availabilityAtVerification),
              );
              const evidenceLabel = purchaseReady
                ? "Purchase-ready"
                : entry.exactPart
                  ? "Verified part unavailable"
                  : "Guided checks only";
              return (
                <button
                  className={selectedId === item.id ? "model-result is-selected" : "model-result"}
                  type="button"
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                >
                  <span>
                    <strong>
                      {item.brand} {item.model}
                    </strong>
                    <small>{evidenceLabel}</small>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              );
            })
          ) : (
            <div className="model-empty">
              <strong>That model is not in Clunk yet.</strong>
              <span>Check the label and try the complete number.</span>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
