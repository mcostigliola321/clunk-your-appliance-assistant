import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";

import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import type { BrandName, RepairSnapshot } from "@/domain/types";

const BRANDS: BrandName[] = ["LG", "Samsung", "GE", "Whirlpool", "Maytag", "Electrolux"];

interface ModelFinderProps {
  snapshot: RepairSnapshot;
  selectedId: string | null;
  onSearch: (query: string, brand: BrandName | null) => void;
  onSelect: (applianceId: string, productCode?: string) => void;
}

export function ModelFinder({ snapshot, selectedId, onSearch, onSelect }: ModelFinderProps) {
  const [query, setQuery] = useState(snapshot.catalogQuery);
  const [brand, setBrand] = useState<BrandName | null>(null);
  const featuredEntry = APPLIANCE_CATALOG.find(
    (entry) => entry.exactPart?.purchase.availabilityAtVerification === "In stock",
  );
  const results =
    snapshot.catalogQuery || brand
      ? snapshot.catalogResults
      : BRANDS.map((name) => snapshot.catalogResults.find((item) => item.brand === name)).filter(
          (item): item is RepairSnapshot["catalogResults"][number] => Boolean(item),
        );

  return (
    <section className="model-finder" aria-labelledby="model-finder-title">
      <div className="model-finder__heading">
        <p>
          <span>Problem</span>
          <strong>Washer won&apos;t drain</strong>
        </p>
        <h2 id="model-finder-title">Which washer do you have?</h2>
      </div>
      <form
        className="model-search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(query, brand);
        }}
      >
        <label htmlFor="model-query">Model number</label>
        <div className="model-search__row">
          <Search size={18} aria-hidden="true" />
          <input
            id="model-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Example: WM3400CW.ABWEVUS"
          />
          <button type="submit">Find it</button>
        </div>
      </form>

      {featuredEntry ? (
        <button
          className="complete-demo"
          type="button"
          onClick={() => onSelect(featuredEntry.id, featuredEntry.verifiedProductCodes[0])}
        >
          <span>
            <small>See the complete answer</small>
            <strong>
              Try {featuredEntry.brand} {featuredEntry.verifiedProductCodes[0]}
            </strong>
            <span>Ends with an in-stock part link</span>
          </span>
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      ) : null}

      <details className="model-browser" open={Boolean(snapshot.catalogQuery || brand)}>
        <summary>
          Browse {APPLIANCE_CATALOG.length} supported washers
          <ArrowRight size={17} aria-hidden="true" />
        </summary>
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
        <div className="model-results" aria-live="polite">
          {results.length ? (
            results.slice(0, 6).map((item) => {
              const entry = APPLIANCE_CATALOG.find((candidate) => candidate.id === item.id);
              const hasPartLink = Boolean(entry?.exactPart);
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
                    <small>{hasPartLink ? "Part match available" : "Guided checks only"}</small>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              );
            })
          ) : (
            <div className="model-empty">
              <strong>We don&apos;t support that washer yet.</strong>
              <span>Check the model number on the appliance label and try again.</span>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
