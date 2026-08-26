import { ChevronDown, Play } from "lucide-react";

import type { RepairToolName } from "@/domain/types";
import { REPAIR_TOOL_CONTRACTS } from "@/webmcp/contracts";

export function ToolInspector({
  onRun,
}: {
  onRun: (name: RepairToolName, input: Record<string, unknown>) => void;
}) {
  return (
    <section className="tool-inspector" aria-labelledby="tool-inspector-title" role="region">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Judge mode</div>
          <h2 id="tool-inspector-title">Tool inspector</h2>
        </div>
        <span className="tool-count">8 WebMCP tools</span>
      </div>
      <p className="tool-intro">
        Run the same bounded actions an agent can call. Accepted and rejected calls update the
        shared log above.
      </p>
      <div className="tool-list">
        {REPAIR_TOOL_CONTRACTS.map((contract) => (
          <details key={contract.name}>
            <summary>
              <span>
                <code>{contract.name}</code>
                <span>{contract.title}</span>
              </span>
              <ChevronDown size={17} aria-hidden="true" />
            </summary>
            <div className="tool-detail">
              <p>{contract.purpose}</p>
              <div className="tool-sample">
                <span>Sample input</span>
                <code>{JSON.stringify(contract.sampleInput)}</code>
              </div>
              <button
                className="button button--secondary button--small"
                type="button"
                aria-label={`Run sample for ${contract.name}`}
                onClick={() => onRun(contract.name, contract.sampleInput)}
              >
                <Play size={15} aria-hidden="true" />
                Run sample
              </button>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
