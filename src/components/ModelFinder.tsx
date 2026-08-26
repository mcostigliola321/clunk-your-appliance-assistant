import { ArrowRight, BadgeCheck, Search } from "lucide-react";
import { useState } from "react";

import type { BrandName, RepairSnapshot } from "@/domain/types";

const BRANDS: BrandName[] = ["LG", "Samsung", "GE", "Whirlpool", "Maytag", "Electrolux"];

interface ModelFinderProps {
  snapshot: RepairSnapshot;
  selectedId: string | null;
  onSearch: (query: string, brand: BrandName | null) => void;
  onSelect: (applianceId: string) => void;
}

export function ModelFinder({ snapshot, selectedId, onSearch, onSelect }: ModelFinderProps) {
  const [query, setQuery] = useState(snapshot.catalogQuery);
  const [brand, setBrand] = useState<BrandName | null>(null);
  const results =
    snapshot.catalogQuery || brand
      ? snapshot.catalogResults
      : BRANDS.map((name) => snapshot.catalogResults.find((item) => item.brand === name)).filter(
          (item): item is RepairSnapshot["catalogResults"][number] => Boolean(item),
        );

  return (
    <section className="model-finder" aria-labelledby="model-finder-title">
      <div className="model-finder__heading">
        <div>
          <span>12 model families · 6 brands</span>
          <h2 id="model-finder-title">Find your washer</h2>
        </div>
        <BadgeCheck size={20} aria-label="Source backed" />
      </div>
      <form
        className="model-search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(query, brand);
        }}
      >
        <label htmlFor="model-query">Model or complete product code</label>
        <div className="model-search__row">
          <Search size={18} aria-hidden="true" />
          <input
            id="model-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try WM3400CW.ABWEVUS"
          />
          <button type="submit">Search</button>
        </div>
        <div className="brand-filters" aria-label="Filter by brand">
          {BRANDS.map((name) => (
            <button
              className={brand === name ? "is-active" : ""}
              type="button"
              aria-pressed={brand === name}
              key={name}
              onClick={() => {
                const next = brand === name ? null : name;
                setBrand(next);
                onSearch(query, next);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </form>

      <div className="model-results" aria-live="polite">
        {results.length ? (
          results.slice(0, 6).map((item) => (
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
                <small>{item.label}</small>
              </span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          ))
        ) : (
          <div className="model-empty">
            <strong>No supported match.</strong>
            <span>
              Clunk will not substitute a similar model. Use the manufacturer support link on your
              appliance label.
            </span>
          </div>
        )}
      </div>
      {!snapshot.catalogQuery && !brand ? (
        <p className="model-finder__note">
          Showing one family per brand. Search to see exact matches.
        </p>
      ) : null}
    </section>
  );
}
