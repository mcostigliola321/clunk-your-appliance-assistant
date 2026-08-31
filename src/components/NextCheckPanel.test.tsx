import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createInitialRepairState, executeRepairTool } from "@/domain/engine";

import { NextCheckPanel } from "./NextCheckPanel";

describe("model × symptom capability introduction", () => {
  it("keeps verified-part-unavailable distinct from purchase-ready before checks", () => {
    const selected = executeRepairTool(createInitialRepairState(), "select_appliance", {
      applianceId: "ge-gtd42easj2ww",
      symptomId: "door-will-not-close",
    });

    render(
      <NextCheckPanel
        snapshot={selected.snapshot}
        onStart={vi.fn()}
        onResult={vi.fn()}
        onFindPart={vi.fn()}
        onUseProductCode={vi.fn(() => null)}
        onBack={vi.fn()}
        canUndo={false}
        capability="verified-part-unavailable"
      />,
    );

    expect(screen.getByText("Exact part currently unavailable")).toBeInTheDocument();
    expect(screen.getByText(/no current seller listing/i)).toBeInTheDocument();
    expect(screen.queryByText("Exact part available")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start the checks/ })).toBeInTheDocument();
  });
});
