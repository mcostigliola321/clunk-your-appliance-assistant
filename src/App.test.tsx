import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "./App";
import { RepairProvider } from "./state/RepairProvider";

function renderClunk() {
  return render(
    <RepairProvider>
      <App />
    </RepairProvider>,
  );
}

describe("Clunk repair bench", () => {
  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(document, "modelContext");
  });

  it("completes the canonical blocked-filter path in the visible interface", async () => {
    const user = userEvent.setup();
    renderClunk();

    expect(screen.getByRole("heading", { name: "Tell it what's broken." })).toBeVisible();
    expect(screen.getByText("Manual mode ready")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Diagnose this washer" }));
    expect(screen.getByRole("heading", { name: "Make the washer safe" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Power is disconnected" }));
    await user.click(screen.getByRole("button", { name: "The visible hose looks clear" }));
    await user.click(screen.getByRole("button", { name: "The filter is blocked by debris" }));

    expect(screen.getByRole("heading", { name: "Clunk found the strongest match." })).toBeVisible();
    const causeList = screen.getByRole("list", { name: "Likely causes" });
    expect(within(causeList).getAllByRole("listitem")[0]).toHaveTextContent("Blocked pump filter");

    await user.click(screen.getByRole("button", { name: "Find the matching part" }));
    expect(screen.getByRole("heading", { name: "Pump filter cartridge" })).toBeVisible();
    expect(screen.getByText("CL-PF-220")).toBeVisible();
    expect(screen.getByText(/Diagnosis in progress · 100%/)).toBeVisible();
  });

  it("shows a terminal stop state for a reported hazard", async () => {
    const user = userEvent.setup();
    renderClunk();

    await user.click(screen.getByRole("button", { name: "Start diagnosis" }));
    await user.click(screen.getByRole("button", { name: "There is a burning smell or smoke" }));

    expect(screen.getByRole("heading", { name: "A professional should continue." })).toBeVisible();
    expect(screen.getByText("No further repair steps are available in this demo.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Power is disconnected" })).not.toBeInTheDocument();
  });

  it("runs manual inspector samples through the visible shared activity log", async () => {
    const user = userEvent.setup();
    renderClunk();

    await user.click(screen.getByText("Identify appliance"));
    const inspector = screen.getByRole("region", { name: "Tool inspector" });
    await user.click(
      within(inspector).getByRole("button", { name: "Run sample for identify_appliance" }),
    );

    const activity = screen.getByRole("region", { name: "Agent activity" });
    expect(within(activity).getByText("Inspector")).toBeVisible();
    expect(within(activity).getByText("identify_appliance")).toBeVisible();
    expect(
      within(activity).getByText("Identified the fictional Clunk WM-01 washer."),
    ).toBeVisible();
  });
});
