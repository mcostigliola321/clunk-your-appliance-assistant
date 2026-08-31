import { ArrowLeft, ArrowRight, BadgeCheck, ChevronDown, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ModelNumberGuide } from "@/components/ModelNumberGuide";
import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import {
  APPLIANCE_JOURNEYS,
  getApplianceJourney,
  getCatalogEntriesForSymptom,
  getCategoryCount,
  getMoreSymptoms,
  getPrimarySymptoms,
  getSymptomCoverage,
  getSupportedSymptoms,
  SYMPTOM_PRESENTATION,
} from "@/data/journeyCatalog";
import { analyzeModelQuery, capabilityLabel, normalizeModel } from "@/domain/modelSearch";
import type {
  ApplianceKind,
  BrandName,
  RepairSnapshot,
  SupportedSymptomId,
  WasherLoadStyle,
} from "@/domain/types";

type JourneyStage = "appliance" | "symptom" | "model";

interface ModelFinderProps {
  snapshot: RepairSnapshot;
  selectedId: string | null;
  isFreshSession: boolean;
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
  isFreshSession,
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
  const primarySymptoms = getPrimarySymptoms(kind);
  const moreSymptoms = getMoreSymptoms(kind);
  const analysis = useMemo(() => analyzeModelQuery(query, brand, kind), [brand, kind, query]);
  const symptomMatches = selectedSymptomId
    ? analysis.matches.filter((entry) => getSymptomCoverage(entry, selectedSymptomId))
    : analysis.matches;
  const results = symptomMatches;
  const hasDifferentSymptomMatches = analysis.matches.length > 0 && symptomMatches.length === 0;
  const exactMatch =
    analysis.status === "exact-code"
      ? symptomMatches.find((entry) => entry.id === analysis.exactEntryId)
      : null;
  const exactProductCode = exactMatch?.verifiedProductCodes.find(
    (code) => normalizeModel(code) === analysis.normalizedQuery,
  );

  const chooseKind = (next: ApplianceKind) => {
    setKind(next);
    setSelectedSymptomId(null);
    setBrand(null);
    setQuery("");
    setShowGuide(false);
    onSearch("", null, next, null);
    pendingStageFocusRef.current = "heading";
    setStage("symptom");
  };

  const chooseSymptom = (symptomId: SupportedSymptomId) => {
    setSelectedSymptomId(symptomId);
    setBrand(null);
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
    if (!isFreshSession) return;
    setStage("appliance");
    setSelectedSymptomId(null);
    setBrand(null);
    setQuery("");
    setShowGuide(false);
  }, [isFreshSession]);

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
            Pick the appliance and what it’s doing. Clunk points to one safe place at a time, then
            checks the full model number before showing a part.
          </p>
        </div>

        <div className="appliance-field" aria-label="Choose an appliance">
          {APPLIANCE_JOURNEYS.map((item, index) => {
            const symptoms = getPrimarySymptoms(item.id);
            const guideLabel = symptoms
              .map((symptomId) => SYMPTOM_PRESENTATION[symptomId].title)
              .join(" · ");
            return (
              <article className={`appliance-choice appliance-choice--${item.id}`} key={item.id}>
                <button
                  className="appliance-choice__primary"
                  type="button"
                  onClick={() => chooseKind(item.id)}
                  aria-label={`Choose ${item.label} — ${guideLabel}`}
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
                    <span>{guideLabel}</span>
                  </span>
                  <ArrowRight size={22} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>

        <details className="completed-example-hub">
          <summary>
            <span>
              <BadgeCheck size={18} aria-hidden="true" /> See a finished guide
            </span>
            <small>Four sample outcomes, ready to open</small>
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
                  <small>Open the finished path</small>
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        </details>

        <details className="all-appliances">
          <summary>
            <span>Browse all models</span>
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
            <figcaption>We’ll point to the exact spot after we know the model.</figcaption>
          </figure>
          <div className="symptom-select__content">
            <p className="journey-step">{journey.label} selected</p>
            <h1 id="symptom-title" ref={stageTitleRef} tabIndex={-1}>
              What is it doing?
            </h1>
            <p className="symptom-select__lead">
              Pick the closest description. We’ll only show models with guidance for that problem.
            </p>
            <div
              className="symptom-options"
              aria-label={`Broadly supported ${journey.noun} problems`}
            >
              {primarySymptoms.map((symptomId) => {
                const symptom = SYMPTOM_PRESENTATION[symptomId];
                const coveredEntries = getCatalogEntriesForSymptom(kind, symptomId);
                return (
                  <button type="button" key={symptomId} onClick={() => chooseSymptom(symptomId)}>
                    <strong>{symptom.title}</strong>
                    <small>{symptom.description}</small>
                    <small className="symptom-options__coverage">
                      {coveredEntries.length} models
                    </small>
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
            {moreSymptoms.length > 0 ? (
              <details className="limited-problems">
                <summary>
                  <span>
                    More problems
                    <small>
                      {moreSymptoms.length} more {moreSymptoms.length === 1 ? "option" : "options"}
                    </small>
                  </span>
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div aria-label={`More checked ${journey.noun} problems`}>
                  {moreSymptoms.map((symptomId) => {
                    const symptom = SYMPTOM_PRESENTATION[symptomId];
                    const coveredEntries = getCatalogEntriesForSymptom(kind, symptomId);
                    return (
                      <button
                        type="button"
                        key={symptomId}
                        onClick={() => chooseSymptom(symptomId)}
                      >
                        <span>
                          <small>{coveredEntries.length} models</small>
                          <strong>{symptom.title}</strong>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </details>
            ) : null}
            <p className="coverage-note">
              Don’t see the right description? Go back and choose the closest thing you can observe.
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
          Enter every letter and number on the Model line. The ending can change which part fits.
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
        {analysis.candidateProductCodes.length && analysis.status !== "exact-code" ? (
          <p className="model-search__variants">
            Known complete codes: {analysis.candidateProductCodes.join(" · ")}
          </p>
        ) : null}
      </form>

      {exactMatch ? (
        <section className="exact-model-match" aria-label="Exact model match" aria-live="polite">
          <span>Exact match</span>
          <button type="button" onClick={() => selectEntry(exactMatch.id)}>
            <span>
              <strong>{exactProductCode ?? query.trim().toUpperCase()}</strong>
              <small>
                {exactMatch.brand} {exactMatch.model} ·{" "}
                {capabilityLabel(getSymptomCoverage(exactMatch, selectedSymptomId!)!.capability)}
              </small>
            </span>
            <span>
              Choose this model <ArrowRight size={17} aria-hidden="true" />
            </span>
          </button>
        </section>
      ) : (
        <details className="model-browser" open={Boolean(query || brand)}>
          <summary>
            <span>
              Browse instead <small>{categoryEntries.length} models with guidance</small>
            </span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          {query ? (
            <div className="model-results" id="model-suggestions" aria-live="polite">
              {results.length ? (
                results.slice(0, 12).map((entry) => (
                  <button
                    className={
                      selectedId === entry.id ? "model-result is-selected" : "model-result"
                    }
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
                    {hasDifferentSymptomMatches
                      ? "That model is supported for a different problem."
                      : analysis.status === "serial-number"
                        ? "That looks like the serial line."
                        : "That model is not in Clunk yet."}
                  </strong>
                  <span>
                    {hasDifferentSymptomMatches
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
            </div>
          )}
        </details>
      )}
    </section>
  );
}
