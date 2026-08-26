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
      ? "/assets/clunk-washer-top-load-topology-v2.png"
      : "/assets/clunk-washer-front-load-topology-v3.png";
  const illustrationSize =
    loadStyle === "top-load" ? { width: 1254, height: 1254 } : { width: 1305, height: 1205 };
  const applianceName = pack
    ? `${pack.appliance.brand} ${pack.appliance.model}`
    : "front-load washer";
  const visibleComponents = INTERACTIVE_COMPONENTS.filter(
    (id) => topology !== "hose-only" || id !== "pump-filter",
  );
  const componentLabel = (id: ComponentId) =>
    pack?.components.find((item) => item.id === id)?.label ?? id.replace("-", " ");
  const activeComponent = pack?.components.find((item) => item.id === highlightedComponentId);

  return (
    <section className="workbench" aria-labelledby="workbench-title">
      <div className="workbench__header">
        <div>
          <h2 id="workbench-title">Look here: {componentLabel(highlightedComponentId)}</h2>
          <p>{activeComponent?.description}</p>
        </div>
        <div className="diagram-legend">
          <span className="diagram-legend__swatch" aria-hidden="true" />
          Current check
        </div>
      </div>

      <div className="appliance-canvas">
        <div className={`appliance-stage appliance-stage--${loadStyle}`}>
          <img
            className="appliance-render"
            src={illustration}
            alt={`Cutaway view of a ${loadStyle} washer with ${componentLabel(highlightedComponentId)} highlighted for ${applianceName}`}
            width={illustrationSize.width}
            height={illustrationSize.height}
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
          General layout shown. Parts may sit in a slightly different place on your washer.
        </p>
      </div>
    </section>
  );
}
