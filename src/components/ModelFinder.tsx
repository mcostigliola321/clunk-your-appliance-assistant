import { ArrowRight, BadgeCheck, MapPin, Search, ShoppingBag } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { ModelNumberGuide } from "@/components/ModelNumberGuide";
import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import { analyzeModelQuery, capabilityLabel } from "@/domain/modelSearch";
import type { ApplianceKind, BrandName, RepairSnapshot, WasherLoadStyle } from "@/domain/types";

const KINDS: Array<{ id: ApplianceKind; label: string; problem: string; glyph: string }> = [
  { id: "washer", label: "Washer", problem: "Won't drain", glyph: "01" },
  { id: "dishwasher", label: "Dishwasher", problem: "Won't drain", glyph: "02" },
  { id: "dryer", label: "Electric dryer", problem: "Door won't close", glyph: "03" },
  { id: "refrigerator", label: "Refrigerator", problem: "Water is slow", glyph: "04" },
];

const FLAGSHIP_IDS: Record<ApplianceKind, string> = {
  washer: "ge-gfw550ssnww",
  dishwasher: "whirlpool-wdt750sakz1",
  dryer: "ge-gtd42easj2ww",
  refrigerator: "ge-gss25gypfs",
};

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
  const [showGuide, setShowGuide] = useState(false);
  const [washerStyle, setWasherStyle] = useState<WasherLoadStyle>("front-load");
  const inputRef = useRef<HTMLInputElement>(null);
  const activeKind = KINDS.find((item) => item.id === kind)!;
  const categoryEntries = APPLIANCE_CATALOG.filter((entry) => entry.kind === kind);
  const brands = [...new Set(categoryEntries.map((entry) => entry.brand))];
  const flagship = categoryEntries.find((entry) => entry.id === FLAGSHIP_IDS[kind]);
  const analysis = useMemo(() => analyzeModelQuery(query, brand, kind), [brand, kind, query]);
  const results = analysis.matches;
  const tierCounts = categoryEntries.reduce(
    (counts, entry) => ({ ...counts, [entry.capability]: counts[entry.capability] + 1 }),
    { "purchase-ready": 0, "guided-checks": 0, "verified-part-unavailable": 0 },
  );

  const chooseKind = (next: ApplianceKind) => {
    setKind(next);
    setBrand(null);
    setQuery("");
    setShowGuide(false);
    onSearch("", null, next);
  };

  const focusModelInput = () => {
    inputRef.current?.focus();
    setShowGuide(false);
    requestAnimationFrame(() => inputRef.current?.focus());
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

      <div className="model-entry-paths" aria-label="How do you want to identify the model?">
        <button
          className={!showGuide ? "is-active" : ""}
          type="button"
          aria-pressed={!showGuide}
          onClick={focusModelInput}
        >
          <Search size={18} aria-hidden="true" />
          <span>
            <strong>I have the number</strong>
            <small>Type all or part of it</small>
          </span>
        </button>
        <button
          className={showGuide ? "is-active" : ""}
          type="button"
          aria-pressed={showGuide}
          aria-expanded={showGuide}
          aria-controls="model-number-guide"
          onClick={() => setShowGuide(true)}
        >
          <MapPin size={18} aria-hidden="true" />
          <span>
            <strong>Find my model number</strong>
            <small>Show me where the label is</small>
          </span>
        </button>
      </div>

      {showGuide ? (
        <ModelNumberGuide
          kind={kind}
          brand={brand}
          brands={brands}
          onBrandChange={setBrand}
          washerStyle={washerStyle}
          onWasherStyleChange={setWasherStyle}
          onReady={focusModelInput}
        />
      ) : null}

      {flagship ? (
        <article className="flagship-answer">
          <div className="flagship-answer__copy">
            <div className="flagship-answer__eyebrow">
              <BadgeCheck size={16} aria-hidden="true" /> Purchase-ready example
            </div>
            <h3>{activeKind.problem}</h3>
            <p>
              {flagship.brand} {flagship.verifiedProductCodes[0] ?? flagship.model} · exact model,
              part, and live Shopify offers
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
            ref={inputRef}
            id="model-query"
            value={query}
            role="combobox"
            aria-autocomplete="list"
            aria-controls="model-suggestions"
            aria-expanded={Boolean(query && results.length)}
            aria-describedby="model-search-guidance"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Example: ${flagship?.verifiedProductCodes[0] ?? categoryEntries[0]?.model ?? "model number"}`}
          />
          <button type="submit">Find model</button>
        </div>
        <p
          id="model-search-guidance"
          className={`model-search__guidance is-${analysis.status}`}
          role={analysis.status === "serial-number" ? "alert" : "status"}
        >
          {analysis.guidance}
        </p>
        {analysis.candidateProductCodes.length ? (
          <p className="model-search__variants">
            Known complete codes: {analysis.candidateProductCodes.join(" · ")}
          </p>
        ) : null}
      </form>

      <details className="model-browser" open={Boolean(query || brand)}>
        <summary>
          Browse {categoryEntries.length} supported {activeKind.label.toLowerCase()} models{" "}
          <ArrowRight size={17} aria-hidden="true" />
        </summary>
        <p className="model-browser__tiers">
          {tierCounts["purchase-ready"]} purchase-ready · {tierCounts["guided-checks"]} guided
          {tierCounts["verified-part-unavailable"] > 0
            ? ` · ${tierCounts["verified-part-unavailable"]} checked unavailable`
            : ""}
        </p>
        <div className="brand-filters" aria-label="Filter by brand">
          {brands.map((name) => (
            <button
              className={brand === name ? "is-active" : ""}
              type="button"
              aria-pressed={brand === name}
              key={name}
              onClick={() => setBrand(brand === name ? null : name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="model-results" id="model-suggestions" aria-live="polite">
          {results.length ? (
            results.slice(0, 10).map((entry) => (
              <button
                className={selectedId === entry.id ? "model-result is-selected" : "model-result"}
                type="button"
                key={entry.id}
                onClick={() =>
                  onSelect(
                    entry.id,
                    analysis.status === "exact-code" && analysis.exactEntryId === entry.id
                      ? query
                      : undefined,
                  )
                }
              >
                <span>
                  <strong>
                    {entry.brand} {entry.model}
                  </strong>
                  <small>{capabilityLabel(entry.capability)}</small>
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            ))
          ) : (
            <div className="model-empty">
              <strong>
                {analysis.status === "serial-number"
                  ? "That looks like the serial line."
                  : "That model is not in Clunk yet."}
              </strong>
              <span>{analysis.guidance}</span>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
