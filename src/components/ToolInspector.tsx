import { ChevronDown, Play } from "lucide-react";

import type { RepairToolName } from "@/domain/types";
import { REPAIR_TOOL_CONTRACTS } from "@/webmcp/contracts";

export function ToolInspector({
  activeTools,
  onRun,
}: {
  activeTools: RepairToolName[];
  onRun: (name: RepairToolName, input: Record<string, unknown>) => void;
}) {
  const visibleContracts = REPAIR_TOOL_CONTRACTS.filter((contract) =>
    activeTools.includes(contract.name),
  );
  return (
    <section className="tool-inspector" aria-labelledby="tool-inspector-title" role="region">
      <div className="section-heading">
        <h2 id="tool-inspector-title">WebMCP tools</h2>
        <span className="tool-count">{visibleContracts.length} active · 8 total</span>
      </div>
      <p className="tool-intro">
        This list mirrors the tools registered for the current page state. Run the same bounded
        actions an agent can call; each result updates the shared bench.
      </p>
      <div className="tool-list">
        {visibleContracts.map((contract) => (
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
