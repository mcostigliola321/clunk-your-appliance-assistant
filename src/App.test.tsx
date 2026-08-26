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
  const input = screen.getByRole("textbox", { name: "Model number" });
  await user.clear(input);
  await user.type(input, query);
  await user.click(screen.getByRole("button", { name: "Find it" }));
  await user.click(
    screen.getByRole("button", {
      name: "LG WM3400CW Part match available",
    }),
  );
}

describe("Clunk repair bench", () => {
  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(document, "modelContext");
  });

  it("makes the problem, model finder, and complete demo immediately visible", () => {
    renderClunk();
    expect(
      screen.getByRole("heading", { name: "Your washer won't drain. Let's fix that." }),
    ).toBeVisible();
    expect(screen.getByText("19 washers supported")).toBeVisible();
    expect(screen.getByText("Guided mode")).toBeVisible();
    expect(screen.getByRole("button", { name: /See the complete answer/ })).toBeVisible();
  });

  it("completes a no-part-needed blocked-filter path", async () => {
    const user = userEvent.setup();
    renderClunk();
    await selectLg(user);
    await user.click(
      screen.getByRole("button", { name: "Washer is unplugged and the water is cool" }),
    );
    await user.click(screen.getByRole("button", { name: "Hose looks clear" }));
    await user.click(screen.getByRole("button", { name: "I found debris in the filter" }));
    expect(screen.getByRole("heading", { name: "You probably don't need a part" })).toBeVisible();
  });

  it("takes the complete demo directly to a part and buy link", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: /See the complete answer/ }));
    await user.click(
      screen.getByRole("button", { name: "Washer is unplugged and the water is cool" }),
    );
    await user.click(screen.getByRole("button", { name: "Hose looks clear" }));
    await user.click(screen.getByRole("button", { name: "The filter looks clear" }));
    expect(screen.getByRole("heading", { name: "This is the part for your washer" })).toBeVisible();
    expect(screen.getByText("Part #AHA75693425")).toBeVisible();
    expect(screen.getByRole("link", { name: /Buy this part/ })).toHaveAttribute(
      "href",
      "https://encompass.com/item/12525362/LG/AHA75693425/",
    );
  });

  it("switches the repair bench to the top-load topology for a top-load model", async () => {
    const user = userEvent.setup();
    renderClunk();
    const input = screen.getByRole("textbox", { name: "Model number" });
    await user.type(input, "GTW585BSVWS");
    await user.click(screen.getByRole("button", { name: "Find it" }));
    await user.click(screen.getByRole("button", { name: /GE GTW585BSVWS/ }));
    expect(screen.getByAltText(/for GE GTW585BSVWS/)).toHaveAttribute(
      "src",
      "/assets/clunk-washer-top-load-topology-v2.png",
    );
  });

  it("shows a terminal stop state for a reported hazard", async () => {
    const user = userEvent.setup();
    renderClunk();
    await selectLg(user);
    await user.click(screen.getByRole("button", { name: "Smoke or burning smell" }));
    expect(screen.getByRole("heading", { name: "A professional should continue." })).toBeVisible();
  });

  it("runs the currently available manual tool through shared activity", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByText("Behind the scenes"));
    await user.click(screen.getByText("Select an exact washer family"));
    const inspector = screen.getByRole("region", { name: "WebMCP tools" });
    await user.click(
      within(inspector).getByRole("button", { name: "Run sample for select_appliance" }),
    );
    const activity = screen.getByRole("region", { name: "What Clunk did" });
    expect(within(activity).getByText("Inspector")).toBeVisible();
    expect(within(activity).getByText("select_appliance")).toBeVisible();
  });
});
