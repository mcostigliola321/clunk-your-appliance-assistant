import { getRepairPack } from "@/domain/repairPack";
import type { ApplianceId, ComponentId } from "@/domain/types";

interface ApplianceDiagramProps {
  packId: ApplianceId | null;
  highlightedComponentId: ComponentId;
  onHighlight: (componentId: ComponentId) => void;
}

const INTERACTIVE_COMPONENTS: ComponentId[] = [
  "machine",
  "drum",
  "sump",
  "pump-filter",
  "drain-pump",
  "drain-hose",
  "control-module",
];

export function ApplianceDiagram({
  packId,
  highlightedComponentId,
  onHighlight,
}: ApplianceDiagramProps) {
  const pack = packId ? getRepairPack(packId) : null;
  const topology = pack?.appliance.topology ?? "front-filter";
  const loadStyle = pack?.appliance.loadStyle ?? "front-load";
  const illustration =
    loadStyle === "top-load"
      ? "/assets/clunk-washer-top-load-cutaway-v1.png"
      : "/assets/clunk-washer-cutaway-v2.png";
  const applianceName = pack
    ? `${pack.appliance.brand} ${pack.appliance.model}`
    : "front-load washer";
  const visibleComponents = INTERACTIVE_COMPONENTS.filter(
    (id) => topology !== "hose-only" || id !== "pump-filter",
  );
  const componentLabel = (id: ComponentId) =>
    pack?.components.find((item) => item.id === id)?.label ?? id.replace("-", " ");

  return (
    <section className="workbench" aria-labelledby="workbench-title">
      <div className="workbench__header">
        <div>
          <div className="section-kicker">Shared repair bench</div>
          <h2 id="workbench-title">{applianceName}</h2>
        </div>
        <div className="diagram-legend">
          <span className="diagram-legend__swatch" aria-hidden="true" />
          Current focus
        </div>
      </div>

      <div className="appliance-canvas">
        <div className={`appliance-stage appliance-stage--${loadStyle}`}>
          <img
            className="appliance-render"
            src={illustration}
            alt={`Generalized cutaway illustration representing ${applianceName}`}
            width="1100"
            height="1100"
          />
          {visibleComponents.map((id) => {
            const label = componentLabel(id);
            const isActive = highlightedComponentId === id;
            return (
              <button
                className={`appliance-component component-hotspot component-hotspot--${id} ${isActive ? "is-active" : ""}`}
                type="button"
                key={id}
                aria-label={`Focus ${label}`}
                aria-pressed={isActive}
                onClick={() => onHighlight(id)}
              >
                <span className="component-hotspot__dot" aria-hidden="true" />
                <span className="component-hotspot__label" aria-hidden="true">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="diagram-note">
          Generalized interactive cutaway—not a manufacturer service diagram.
        </p>
      </div>

      <div className="component-selector" aria-label="Diagram components">
        {visibleComponents.map((id) => {
          return (
            <button
              className={highlightedComponentId === id ? "is-active" : ""}
              type="button"
              key={id}
              aria-pressed={highlightedComponentId === id}
              onClick={() => onHighlight(id)}
            >
              {componentLabel(id)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
