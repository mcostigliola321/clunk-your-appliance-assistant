import { getRepairPack } from "@/domain/repairPack";
import type { ApplianceId, ComponentId } from "@/domain/types";

interface ApplianceDiagramProps {
  packId: ApplianceId | null;
  highlightedComponentId: ComponentId;
  overviewMode?: boolean;
  onHighlight: (componentId: ComponentId) => void;
}

export function ApplianceDiagram({
  packId,
  highlightedComponentId,
  overviewMode = false,
  onHighlight,
}: ApplianceDiagramProps) {
  const pack = packId ? getRepairPack(packId) : null;
  if (!pack) return null;
  const active =
    pack.components.find((item) => item.id === highlightedComponentId) ?? pack.components[0]!;

  return (
    <section className="workbench" aria-labelledby="workbench-title">
      <div className="workbench__header">
        <div>
          <h2 id="workbench-title">
            {overviewMode
              ? `Look at the whole ${pack.appliance.noun}`
              : `Look at the ${active.label.toLowerCase()}`}
          </h2>
          <p>
            {overviewMode
              ? `First, make the ${pack.appliance.noun} safe. Clunk will point to the first place to check next.`
              : active.description}
          </p>
        </div>
        <div className="diagram-legend">
          <span className="diagram-legend__swatch" aria-hidden="true" />
          {overviewMode ? "Whole appliance" : "Current location"}
        </div>
      </div>

      <div className="appliance-canvas">
        <div className={`appliance-stage appliance-stage--${pack.appliance.kind}`}>
          <img
            className="appliance-render"
            src={pack.appliance.illustration.src}
            alt={pack.appliance.illustration.alt}
            width={pack.appliance.illustration.width}
            height={pack.appliance.illustration.height}
          />
          {!overviewMode &&
            pack.components.map((item) => {
              const isActive = item.id === highlightedComponentId;
              return (
                <button
                  className={`appliance-component component-hotspot ${item.hotspot.x > 65 ? "is-right" : ""} ${isActive ? "is-active" : ""}`}
                  style={{ left: `${item.hotspot.x}%`, top: `${item.hotspot.y}%` }}
                  type="button"
                  key={item.id}
                  aria-label={`Show ${item.label}`}
                  aria-pressed={isActive}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => onHighlight(item.id)}
                >
                  <span className="component-hotspot__dot" aria-hidden="true" />
                  <span className="component-hotspot__label" aria-hidden="true">
                    {item.label}
                  </span>
                </button>
              );
            })}
        </div>
        <p className="diagram-note">{pack.appliance.diagramNote}</p>
      </div>
    </section>
  );
}
