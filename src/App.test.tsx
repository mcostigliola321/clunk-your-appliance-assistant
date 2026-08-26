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

async function selectLg(user: ReturnType<typeof userEvent.setup>, query = "WM3400CW.ABWEVUS") {
  const input = screen.getByRole("textbox", { name: "Model or complete product code" });
  await user.clear(input);
  await user.type(input, query);
  await user.click(screen.getByRole("button", { name: "Search" }));
  await user.click(screen.getByRole("button", { name: /LG WM3400CW/ }));
}

describe("Clunk repair bench", () => {
  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(document, "modelContext");
  });

  it("makes the source-backed breadth and model finder immediately visible", () => {
    renderClunk();
    expect(screen.getByRole("heading", { name: "Tell it what's broken." })).toBeVisible();
    expect(screen.getByText("14 model families · 6 brands")).toBeVisible();
    expect(screen.getByText("Manual mode ready")).toBeVisible();
  });

  it("completes a no-part-needed blocked-filter path", async () => {
    const user = userEvent.setup();
    renderClunk();
    await selectLg(user);
    await user.click(screen.getByRole("button", { name: "Start safe diagnosis" }));
    await user.click(screen.getByRole("button", { name: "Power disconnected; water is cool" }));
    await user.click(screen.getByRole("button", { name: "Hose looks clear and correctly placed" }));
    await user.click(screen.getByRole("button", { name: "Debris was blocking the filter" }));
    await user.click(screen.getByRole("button", { name: "Resolve the part outcome" }));
    expect(screen.getByRole("heading", { name: "Cleanable blockage found" })).toBeVisible();
    expect(
      within(screen.getByRole("list", { name: "Likely causes" })).getAllByRole("listitem")[0],
    ).toHaveTextContent("Blocked pump filter");
  });

  it("shows an exact sourced part only after a complete model code and clear checks", async () => {
    const user = userEvent.setup();
    renderClunk();
    await selectLg(user);
    await user.click(screen.getByRole("button", { name: "Start safe diagnosis" }));
    await user.click(screen.getByRole("button", { name: "Power disconnected; water is cool" }));
    await user.click(screen.getByRole("button", { name: "Hose looks clear and correctly placed" }));
    await user.click(
      screen.getByRole("button", { name: "Filter and visible impeller area look clear" }),
    );
    await user.click(screen.getByRole("button", { name: "Resolve the part outcome" }));
    expect(screen.getByRole("heading", { name: "Exact part match" })).toBeVisible();
    expect(screen.getByText("AHA75693425")).toBeVisible();
    expect(screen.getByRole("link", { name: /View product at Encompass/ })).toHaveAttribute(
      "href",
      "https://encompass.com/item/12525362/LG/AHA75693425/",
    );
  });

  it("switches the repair bench to the top-load cutaway for a top-load model", async () => {
    const user = userEvent.setup();
    renderClunk();
    const input = screen.getByRole("textbox", { name: "Model or complete product code" });
    await user.type(input, "WT7400CW.ABWEUUS");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await user.click(screen.getByRole("button", { name: /LG WT7400CW/ }));
    expect(screen.getByAltText(/representing LG WT7400CW/)).toHaveAttribute(
      "src",
      "/assets/clunk-washer-top-load-cutaway-v1.png",
    );
  });

  it("shows a terminal stop state for a reported hazard", async () => {
    const user = userEvent.setup();
    renderClunk();
    await selectLg(user, "WM3400CW");
    await user.click(screen.getByRole("button", { name: "Start safe diagnosis" }));
    await user.click(screen.getByRole("button", { name: "Smoke or burning smell" }));
    expect(screen.getByRole("heading", { name: "A professional should continue." })).toBeVisible();
  });

  it("runs the currently available manual tool through shared activity", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByText("Agent activity & WebMCP tools"));
    await user.click(screen.getByText("Select an exact washer family"));
    const inspector = screen.getByRole("region", { name: "Tool inspector" });
    await user.click(
      within(inspector).getByRole("button", { name: "Run sample for select_appliance" }),
    );
    const activity = screen.getByRole("region", { name: "Agent activity" });
    expect(within(activity).getByText("Inspector")).toBeVisible();
    expect(within(activity).getByText("select_appliance")).toBeVisible();
  });
});
