import { ArrowLeft, ArrowRight, BadgeCheck, ChevronDown, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ModelNumberGuide } from "@/components/ModelNumberGuide";
import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import {
  APPLIANCE_JOURNEYS,
  getApplianceJourney,
  getCatalogEntriesForSymptom,
  getCategoryCount,
  getSymptomCoverage,
  getSupportedSymptoms,
  SYMPTOM_PRESENTATION,
} from "@/data/journeyCatalog";
import { analyzeModelQuery, capabilityLabel } from "@/domain/modelSearch";
import type {
  ApplianceKind,
  BrandName,
  CapabilityTier,
  RepairSnapshot,
  SupportedSymptomId,
  WasherLoadStyle,
} from "@/domain/types";

type JourneyStage = "appliance" | "symptom" | "model";

interface ModelFinderProps {
  snapshot: RepairSnapshot;
  selectedId: string | null;
  onSearch: (
    query: string,
    brand: BrandName | null,
    kind: ApplianceKind,
    symptomId: SupportedSymptomId | null,
  ) => void;
  onSelect: (applianceId: string, symptomId: SupportedSymptomId, productCode?: string) => void;
  onExample: (applianceId: string) => void;
}

export function ModelFinder({
  snapshot,
  selectedId,
  onSearch,
  onSelect,
  onExample,
}: ModelFinderProps) {
  const [stage, setStage] = useState<JourneyStage>(
    snapshot.catalogSymptomId ? "model" : "appliance",
  );
  const [kind, setKind] = useState<ApplianceKind>(snapshot.catalogKind ?? "dryer");
  const [selectedSymptomId, setSelectedSymptomId] = useState<SupportedSymptomId | null>(
    snapshot.catalogSymptomId,
  );
  const [query, setQuery] = useState(snapshot.catalogQuery);
  const [brand, setBrand] = useState<BrandName | null>(null);
  const [capability, setCapability] = useState<CapabilityTier | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [washerStyle, setWasherStyle] = useState<WasherLoadStyle>("front-load");
  const inputRef = useRef<HTMLInputElement>(null);
  const stageTitleRef = useRef<HTMLHeadingElement>(null);
  const focusAfterGuideRef = useRef(false);
  const pendingStageFocusRef = useRef<"heading" | "input" | null>(null);

  const journey = getApplianceJourney(kind);
  const kindEntries = APPLIANCE_CATALOG.filter((entry) => entry.kind === kind);
  const categoryEntries = selectedSymptomId
    ? getCatalogEntriesForSymptom(kind, selectedSymptomId)
    : kindEntries;
  const brands = [...new Set(categoryEntries.map((entry) => entry.brand))];
  const flagship =
    categoryEntries.find((entry) => entry.id === journey.flagshipId) ??
    categoryEntries.find(
      (entry) =>
        selectedSymptomId &&
        getSymptomCoverage(entry, selectedSymptomId)?.capability === "purchase-ready",
    ) ??
    categoryEntries[0];
  const supportedSymptoms = getSupportedSymptoms(kind);
  const analysis = useMemo(() => analyzeModelQuery(query, brand, kind), [brand, kind, query]);
  const symptomMatches = selectedSymptomId
    ? analysis.matches.filter((entry) => getSymptomCoverage(entry, selectedSymptomId))
    : analysis.matches;
  const results = capability
    ? symptomMatches.filter(
        (entry) =>
          selectedSymptomId &&
          getSymptomCoverage(entry, selectedSymptomId)?.capability === capability,
      )
    : symptomMatches;
  const hasDifferentSymptomMatches = analysis.matches.length > 0 && symptomMatches.length === 0;
  const tierCounts = categoryEntries.reduce(
    (counts, entry) => {
      const tier = selectedSymptomId
        ? getSymptomCoverage(entry, selectedSymptomId)?.capability
        : null;
      return tier ? { ...counts, [tier]: counts[tier] + 1 } : counts;
    },
    { "purchase-ready": 0, "guided-checks": 0, "verified-part-unavailable": 0 },
  );

  const chooseKind = (next: ApplianceKind) => {
    setKind(next);
    setSelectedSymptomId(null);
    setBrand(null);
    setCapability(null);
    setQuery("");
    setShowGuide(false);
    onSearch("", null, next, null);
    pendingStageFocusRef.current = "heading";
    setStage("symptom");
  };

  const chooseSymptom = (symptomId: SupportedSymptomId) => {
    setSelectedSymptomId(symptomId);
    setBrand(null);
    setCapability(null);
    setQuery("");
    onSearch("", null, kind, symptomId);
    pendingStageFocusRef.current = "input";
    setStage("model");
  };

  const moveToStage = (next: JourneyStage, focus: "heading" | "input" = "heading") => {
    pendingStageFocusRef.current = focus;
    setStage(next);
  };

  const focusModelInput = () => {
    focusAfterGuideRef.current = true;
    setShowGuide(false);
    if (!showGuide) {
      inputRef.current?.focus();
      focusAfterGuideRef.current = false;
    }
  };

  useEffect(() => {
    if (!showGuide && focusAfterGuideRef.current) {
      inputRef.current?.focus();
      focusAfterGuideRef.current = false;
    }
  }, [showGuide]);

  useEffect(() => {
    const pending = pendingStageFocusRef.current;
    if (!pending) return;
    const frame = requestAnimationFrame(() => {
      if (pending === "input") inputRef.current?.focus();
      else stageTitleRef.current?.focus();
      pendingStageFocusRef.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  const selectEntry = (entryId: string) => {
    if (!selectedSymptomId) return;
    onSelect(
      entryId,
      selectedSymptomId,
      analysis.status === "exact-code" && analysis.exactEntryId === entryId ? query : undefined,
    );
  };

  if (stage === "appliance") {
    return (
      <section className="journey-start" aria-labelledby="journey-title">
        <div className="journey-start__intro">
          <h1 id="journey-title" ref={stageTitleRef} tabIndex={-1}>
            What are you fixing?
          </h1>
          <p>
            Choose the appliance, then pick the problem. Clunk will show one safe place to look at a
            time—and only name a part when the complete model number proves it fits.
          </p>
        </div>

        <div className="appliance-field" aria-label="Choose an appliance">
          {APPLIANCE_JOURNEYS.map((item, index) => {
            const symptoms = getSupportedSymptoms(item.id);
            return (
              <article className={`appliance-choice appliance-choice--${item.id}`} key={item.id}>
                <button
                  className="appliance-choice__primary"
                  type="button"
                  onClick={() => chooseKind(item.id)}
                  aria-label={`Choose ${item.label} — ${symptoms.length} supported problems`}
                >
                  <span className="appliance-choice__image">
                    <img
                      src={item.image.src}
                      srcSet={item.image.srcSet}
                      sizes="(max-width: 620px) 46vw, (min-width: 1100px) 22vw, (min-width: 720px) 46vw, 82vw"
                      alt={item.image.alt}
                      width="480"
                      height="480"
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                  </span>
                  <span className="appliance-choice__name">
                    <strong>{item.label}</strong>
                    <span>{symptoms.length} supported problems</span>
                  </span>
                  <ArrowRight size={22} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>

        <p className="appliance-roadmap" aria-label="Appliance research roadmap">
          <strong>More appliances are in the research queue.</strong> Vacuums and robot vacuums are
          next to evaluate.
        </p>

        <details className="completed-example-hub">
          <summary>
            <span>
              <BadgeCheck size={18} aria-hidden="true" /> See how Clunk works
            </span>
            <small>Four clearly labeled completed examples</small>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div>
            {APPLIANCE_JOURNEYS.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-label={`See completed ${item.noun} example`}
                onClick={() => onExample(item.flagshipId)}
              >
                <span>
                  <strong>{item.label}</strong>
                  <small>Completed example · prefilled observations</small>
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        </details>

        <details className="all-appliances">
          <summary>
            <span>All supported appliances</span>
            <span>{APPLIANCE_CATALOG.length} models across 4 types</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div className="all-appliances__list">
            {APPLIANCE_JOURNEYS.map((item) => (
              <button type="button" key={item.id} onClick={() => chooseKind(item.id)}>
                <span>{item.label}</span>
                <span>{getCategoryCount(item.id)} models</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </details>
      </section>
    );
  }

  if (stage === "symptom") {
    return (
      <section className="symptom-select" aria-labelledby="symptom-title">
        <button className="journey-back" type="button" onClick={() => moveToStage("appliance")}>
          <ArrowLeft size={17} aria-hidden="true" /> Change appliance
        </button>
        <div className="symptom-select__layout">
          <figure className="symptom-machine">
            <img
              src={journey.image.src}
              srcSet={journey.image.srcSet}
              sizes="(min-width: 900px) 48vw, 92vw"
              alt={journey.image.alt}
              width="480"
              height="480"
            />
            <figcaption>
              Recognizable cutaway · the exact location comes after model selection
            </figcaption>
          </figure>
          <div className="symptom-select__content">
            <p className="journey-step">{journey.label} selected</p>
            <h1 id="symptom-title" ref={stageTitleRef} tabIndex={-1}>
              What is it doing?
            </h1>
            <p className="symptom-select__lead">
              Choose the behavior you can observe. Coverage is checked separately for every model
              and problem.
            </p>
            <div className="symptom-options" aria-label={`Supported ${journey.noun} problems`}>
              {supportedSymptoms.map((symptomId) => {
                const symptom = SYMPTOM_PRESENTATION[symptomId];
                const coveredEntries = getCatalogEntriesForSymptom(kind, symptomId);
                const purchaseReadyCount = coveredEntries.filter(
                  (entry) => getSymptomCoverage(entry, symptomId)?.capability === "purchase-ready",
                ).length;
                return (
                  <button type="button" key={symptomId} onClick={() => chooseSymptom(symptomId)}>
                    <span>
                      <BadgeCheck size={18} aria-hidden="true" /> Supported now
                    </span>
                    <strong>{symptom.title}</strong>
                    <small>{symptom.description}</small>
                    <small className="symptom-options__coverage">
                      {coveredEntries.length} checked models
                      {purchaseReadyCount > 0
                        ? ` · ${purchaseReadyCount} purchase-ready`
                        : " · checks only"}
                    </small>
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
            <p className="coverage-note">
              Search results show only models checked for this problem. Clunk will not borrow
              coverage from another symptom or model.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="model-finder" aria-labelledby="model-finder-title">
      <button className="journey-back" type="button" onClick={() => moveToStage("symptom")}>
        <ArrowLeft size={17} aria-hidden="true" /> Back to the problem
      </button>

      <div className="model-finder__heading">
        <p className="journey-step">
          {journey.label} · {SYMPTOM_PRESENTATION[selectedSymptomId ?? supportedSymptoms[0]!].title}
        </p>
        <h1 id="model-finder-title" ref={stageTitleRef} tabIndex={-1}>
          Find the model label.
        </h1>
        <p>
          Search is the fastest path. Copy the complete model line—including every letter, slash,
          and suffix—so Clunk can keep an exact part separate from a family-level suggestion.
        </p>
      </div>

      <div className="model-entry-paths" aria-label="Find or enter a model number">
        <button
          className={!showGuide ? "is-active" : ""}
          type="button"
          aria-pressed={!showGuide}
          onClick={focusModelInput}
        >
          <Search size={19} aria-hidden="true" />
          <span>
            <strong>Search a model number</strong>
            <small>Enter the label exactly as printed</small>
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
          <MapPin size={19} aria-hidden="true" />
          <span>
            <strong>Show me where the label is</strong>
            <small>Visual guidance for common locations</small>
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

      <form
        className="model-search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(query, brand, kind, selectedSymptomId);
        }}
      >
        <label htmlFor="model-query">{journey.label} model number</label>
        <div className="model-search__row">
          <Search size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            id="model-query"
            type="search"
            value={query}
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

      <details className="model-browser" open={Boolean(query || brand || capability)}>
        <summary>
          <span>
            Browse by brand <small>{categoryEntries.length} supported models</small>
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <p className="model-browser__tiers">
          {tierCounts["purchase-ready"]} purchase-ready · {tierCounts["guided-checks"]} checks only
          {tierCounts["verified-part-unavailable"] > 0
            ? ` · ${tierCounts["verified-part-unavailable"]} verified part unavailable`
            : ""}
        </p>
        <div className="model-filter-group">
          <span>Outcome available today</span>
          <div className="capability-filters" aria-label="Filter by coverage">
            <button
              className={capability === null ? "is-active" : ""}
              type="button"
              aria-pressed={capability === null}
              onClick={() => setCapability(null)}
            >
              All {categoryEntries.length}
            </button>
            <button
              className={capability === "purchase-ready" ? "is-active" : ""}
              type="button"
              aria-pressed={capability === "purchase-ready"}
              onClick={() => setCapability("purchase-ready")}
            >
              Purchase-ready {tierCounts["purchase-ready"]}
            </button>
            <button
              className={capability === "guided-checks" ? "is-active" : ""}
              type="button"
              aria-pressed={capability === "guided-checks"}
              onClick={() => setCapability("guided-checks")}
            >
              Checks only {tierCounts["guided-checks"]}
            </button>
            {tierCounts["verified-part-unavailable"] > 0 ? (
              <button
                className={capability === "verified-part-unavailable" ? "is-active" : ""}
                type="button"
                aria-pressed={capability === "verified-part-unavailable"}
                onClick={() => setCapability("verified-part-unavailable")}
              >
                Verified part unavailable {tierCounts["verified-part-unavailable"]}
              </button>
            ) : null}
          </div>
        </div>

        {query ? (
          <div className="model-results" id="model-suggestions" aria-live="polite">
            {results.length ? (
              results.slice(0, 12).map((entry) => (
                <button
                  className={selectedId === entry.id ? "model-result is-selected" : "model-result"}
                  type="button"
                  key={entry.id}
                  onClick={() => selectEntry(entry.id)}
                >
                  <span>
                    <strong>
                      {entry.brand} {entry.model}
                    </strong>
                    <small>
                      {capabilityLabel(getSymptomCoverage(entry, selectedSymptomId!)!.capability)}
                    </small>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ))
            ) : (
              <div className="model-empty">
                <strong>
                  {symptomMatches.length > 0 && capability
                    ? `No ${capabilityLabel(capability).toLowerCase()} models in this view.`
                    : hasDifferentSymptomMatches
                      ? "That model is supported for a different problem."
                      : analysis.status === "serial-number"
                        ? "That looks like the serial line."
                        : "That model is not in Clunk yet."}
                </strong>
                <span>
                  {symptomMatches.length > 0 && capability
                    ? "Choose another coverage level."
                    : hasDifferentSymptomMatches
                      ? "Go back and choose the problem that matches what the appliance is doing."
                      : analysis.guidance}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="brand-directory" id="model-suggestions">
            {brands.map((name) => {
              const brandEntries = results.filter((entry) => entry.brand === name);
              if (!brandEntries.length) return null;
              return (
                <details className="model-brand-group" key={name} open={brand === name}>
                  <summary>
                    <span>{name}</span>
                    <span>{brandEntries.length} models</span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </summary>
                  <div>
                    {brandEntries.map((entry) => (
                      <button type="button" key={entry.id} onClick={() => selectEntry(entry.id)}>
                        <span>
                          <strong>{entry.model}</strong>
                          <small>
                            {capabilityLabel(
                              getSymptomCoverage(entry, selectedSymptomId!)!.capability,
                            )}
                          </small>
                        </span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </details>
              );
            })}
            {!results.length ? (
              <div className="model-empty">
                <strong>No models at this coverage level.</strong>
                <span>Choose another coverage filter to see supported models.</span>
              </div>
            ) : null}
          </div>
        )}
      </details>
    </section>
  );
}
