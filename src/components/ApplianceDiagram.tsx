import { repairPack } from "@/domain/repairPack";
import type { ComponentId } from "@/domain/types";

interface ApplianceDiagramProps {
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

export function ApplianceDiagram({ highlightedComponentId, onHighlight }: ApplianceDiagramProps) {
  const componentProps = (id: ComponentId) => ({
    className: `appliance-component ${highlightedComponentId === id ? "is-active" : ""}`,
    onClick: () => onHighlight(id),
  });

  return (
    <section className="workbench" aria-labelledby="workbench-title">
      <div className="workbench__header">
        <div>
          <div className="section-kicker">Shared repair bench</div>
          <h2 id="workbench-title">Clunk WM-01</h2>
        </div>
        <div className="diagram-legend">
          <span className="diagram-legend__swatch" aria-hidden="true" />
          Current focus
        </div>
      </div>

      <div className="appliance-canvas">
        <svg
          className="appliance-svg"
          viewBox="0 0 660 500"
          role="img"
          aria-labelledby="washer-diagram-title washer-diagram-desc"
        >
          <title id="washer-diagram-title">
            Exploded diagram of the fictional Clunk WM-01 washer
          </title>
          <desc id="washer-diagram-desc">
            Selectable technical illustration showing the machine cabinet, drum, sump, pump filter,
            drain pump, hose, and professional-only control module.
          </desc>

          <path className="diagram-floor" d="M72 438H593" />

          <g {...componentProps("machine")}>
            <path className="machine-shell" d="M116 54H436V423H116z" />
            <path className="machine-top" d="M116 54l24-18h320l-24 18z" />
            <path className="machine-side" d="M436 54l24-18v369l-24 18z" />
            <path className="machine-panel" d="M138 76h276v54H138z" />
            <circle className="machine-control" cx="382" cy="102" r="13" />
            <path className="machine-access" d="M139 363h94v42h-94z" />
            <path className="machine-foot" d="M137 423v15m278-15v15" />
          </g>

          <g {...componentProps("drum")}>
            <circle className="drum-back" cx="276" cy="247" r="106" />
            <circle className="drum-ring" cx="276" cy="247" r="89" />
            <circle className="drum-opening" cx="276" cy="247" r="70" />
            <path
              className="drum-detail"
              d="M222 203c27-29 79-35 112-7M215 289c31 32 88 40 124 5"
            />
          </g>

          <g {...componentProps("control-module")}>
            <path className="module-body" d="M30 82h68v67H30z" />
            <path className="module-tabs" d="M40 73v9m17-9v9m17-9v9m17-9v9" />
            <path className="module-circuit" d="M43 103h14v14h14v16h15m-44 0h11v-9h16" />
            <path className="exploded-line" d="M99 112h34" />
          </g>

          <g {...componentProps("sump")}>
            <path className="sump-body" d="M263 341v30l-31 22h80l-29-22v-30z" />
            <path className="sump-line" d="M274 371v22" />
          </g>

          <g {...componentProps("pump-filter")}>
            <path className="filter-body" d="M36 359h93v49H36z" />
            <circle className="filter-cap" cx="104" cy="383.5" r="17" />
            <path className="filter-grip" d="M96 383.5h16" />
            <path className="exploded-line" d="M129 384h32" />
          </g>

          <g {...componentProps("drain-pump")}>
            <circle className="pump-body" cx="493" cy="353" r="42" />
            <circle className="pump-hub" cx="493" cy="353" r="17" />
            <path className="pump-neck" d="M451 343h-28v25h31m81-15h31" />
            <path className="pump-bolts" d="M493 319v8m0 52v8m-34-34h8m52 0h8" />
            <path className="exploded-line" d="M414 353h-36" />
          </g>

          <g {...componentProps("drain-hose")}>
            <path className="hose-body" d="M566 353c55 0 41-67 41-113V118c0-28 18-41 34-41" />
            <path className="hose-end" d="M633 69l12 8-12 8" />
          </g>

          <g className="diagram-labels" aria-hidden="true">
            <path d="M61 164v41h67" />
            <text x="25" y="220">
              control
            </text>
            <path d="M210 166l-47-31" />
            <text x="123" y="128">
              drum
            </text>
            <path d="M105 419v18" />
            <text x="55" y="459">
              filter
            </text>
            <path d="M493 404v27" />
            <text x="470" y="452">
              pump
            </text>
            <path d="M598 204h35" />
            <text x="592" y="225">
              hose
            </text>
          </g>
        </svg>
      </div>

      <div className="component-selector" aria-label="Diagram components">
        {INTERACTIVE_COMPONENTS.map((id) => {
          const component = repairPack.components.find((item) => item.id === id);
          return (
            <button
              className={highlightedComponentId === id ? "is-active" : ""}
              type="button"
              key={id}
              aria-pressed={highlightedComponentId === id}
              onClick={() => onHighlight(id)}
            >
              {component?.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
