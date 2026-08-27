import { ArrowDown, ExternalLink, Tag } from "lucide-react";

import { getBrandIdentifierHint, getModelNumberGuide } from "@/data/modelNumberGuides";
import type { ApplianceKind, BrandName, WasherLoadStyle } from "@/domain/types";

interface ModelNumberGuideProps {
  kind: ApplianceKind;
  brand: BrandName | null;
  brands: BrandName[];
  onBrandChange: (brand: BrandName | null) => void;
  washerStyle: WasherLoadStyle;
  onWasherStyleChange: (style: WasherLoadStyle) => void;
  onReady: () => void;
}

function LocationSketch({
  kind,
  washerStyle,
}: Pick<ModelNumberGuideProps, "kind" | "washerStyle">) {
  const style = kind === "washer" ? washerStyle : kind;
  return (
    <svg
      className="label-sketch"
      viewBox="0 0 260 180"
      role="img"
      aria-label="Original Clunk illustration showing common label areas, not a model-specific diagram"
    >
      <rect className="label-sketch__frame" x="28" y="16" width="204" height="148" rx="18" />
      {style === "front-load" ? (
        <>
          <circle className="label-sketch__door" cx="130" cy="100" r="48" />
          <circle className="label-sketch__inner" cx="130" cy="100" r="33" />
          <rect className="label-sketch__tag" x="173" y="57" width="31" height="13" rx="2" />
        </>
      ) : style === "top-load" ? (
        <>
          <path className="label-sketch__door" d="M55 68 L205 68 L185 142 L75 142 Z" />
          <path className="label-sketch__inner" d="M70 80 L190 80 L177 126 L83 126 Z" />
          <rect className="label-sketch__tag" x="157" y="74" width="31" height="13" rx="2" />
        </>
      ) : style === "dishwasher" ? (
        <>
          <path className="label-sketch__door" d="M48 59 H212 V137 H48 Z" />
          <path className="label-sketch__inner" d="M61 72 H199 V125 H61 Z" />
          <rect className="label-sketch__tag" x="170" y="51" width="31" height="13" rx="2" />
        </>
      ) : style === "dryer" ? (
        <>
          <circle className="label-sketch__door" cx="130" cy="101" r="49" />
          <path className="label-sketch__inner" d="M130 52 C170 70 176 123 142 147" />
          <rect className="label-sketch__tag" x="72" y="66" width="31" height="13" rx="2" />
        </>
      ) : (
        <>
          <path className="label-sketch__door" d="M130 17 V163 M39 82 H221" />
          <rect className="label-sketch__inner" x="48" y="33" width="67" height="36" rx="4" />
          <rect className="label-sketch__inner" x="145" y="33" width="67" height="36" rx="4" />
          <rect className="label-sketch__tag" x="177" y="43" width="31" height="13" rx="2" />
        </>
      )}
      <path className="label-sketch__leader" d="M201 58 C225 54 231 43 237 30" />
      <circle className="label-sketch__pin" cx="237" cy="30" r="8" />
      <path className="label-sketch__pin-mark" d="M233 30 H241 M237 26 V34" />
    </svg>
  );
}

export function ModelNumberGuide({
  kind,
  brand,
  brands,
  onBrandChange,
  washerStyle,
  onWasherStyleChange,
  onReady,
}: ModelNumberGuideProps) {
  const guide = getModelNumberGuide(kind, kind === "washer" ? washerStyle : undefined);
  const brandHint = getBrandIdentifierHint(brand);
  const location = guide.locations[0]!;

  return (
    <section className="label-guide" id="model-number-guide" aria-labelledby="label-guide-title">
      <div className="label-guide__heading">
        <span className="label-guide__step">Physical-world handoff</span>
        <h3 id="label-guide-title">{guide.title}</h3>
        <p>
          Clunk can tell you where to look. You read the label and type the model—no photo, scan, or
          account needed.
        </p>
      </div>

      {kind === "washer" ? (
        <fieldset className="washer-style">
          <legend>What kind of washer is it?</legend>
          {(["front-load", "top-load"] as const).map((style) => (
            <button
              type="button"
              className={washerStyle === style ? "is-active" : ""}
              aria-pressed={washerStyle === style}
              key={style}
              onClick={() => onWasherStyleChange(style)}
            >
              {style === "front-load" ? "Door on front" : "Lid on top"}
            </button>
          ))}
        </fieldset>
      ) : null}

      <label className="guide-brand-select">
        <span>Brand (optional)</span>
        <select
          value={brand ?? ""}
          onChange={(event) => onBrandChange((event.target.value as BrandName) || null)}
        >
          <option value="">Show general locations</option>
          {brands.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <div className="label-guide__location">
        <LocationSketch kind={kind} washerStyle={washerStyle} />
        <div>
          <span className="label-guide__location-label">
            <Tag size={15} aria-hidden="true" /> Common label places
          </span>
          <h4>{location.label}</h4>
          <p>{location.instruction}</p>
          <small>{guide.safety}</small>
        </div>
      </div>

      <div className="identifier-card">
        <div>
          <span>Use this</span>
          <strong>Model · Model No. · E-Nr</strong>
          <p>The design code for your appliance. Copy every letter, number, slash, and suffix.</p>
        </div>
        <div>
          <span>Keep, but do not search</span>
          <strong>Serial · S/N</strong>
          <p>A code for your one machine. It does not prove which part fits.</p>
        </div>
        <div>
          <span>Helpful later</span>
          <strong>Product code</strong>
          <p>An extra version code used by some brands. Keep it with the full model.</p>
        </div>
        <div>
          <span>Good for suggestions only</span>
          <strong>Partial family code</strong>
          <p>Enough to narrow the list, never enough for an exact-part promise.</p>
        </div>
      </div>

      <div className="label-guide__examples">
        <span>Model examples</span>
        <div>
          {guide.examples.map((example) => (
            <code key={example}>{example}</code>
          ))}
        </div>
        {brandHint ? <p>{brandHint}</p> : null}
      </div>

      <details className="label-guide__sources">
        <summary>Why these locations?</summary>
        <p>Manufacturers list several possible positions. Your exact label may be elsewhere.</p>
        <ul>
          {guide.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.title} <ExternalLink size={12} aria-hidden="true" />
              </a>
              <small>Checked {source.retrieved}</small>
            </li>
          ))}
        </ul>
      </details>

      <button className="label-guide__ready" type="button" onClick={onReady}>
        I found the model line <ArrowDown size={17} aria-hidden="true" />
      </button>
    </section>
  );
}
