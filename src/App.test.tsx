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
  const input = screen.getByRole("textbox", { name: "Washer model number" });
  await user.clear(input);
  await user.type(input, query);
  await user.click(screen.getByRole("button", { name: "Find model" }));
  await user.click(screen.getByRole("button", { name: /LG WM3400CW Purchase-ready/ }));
}

describe("Clunk repair bench", () => {
  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(document, "modelContext");
  });

  it("makes the promise and four appliance categories immediately clear", () => {
    renderClunk();
    expect(
      screen.getByRole("heading", { name: "Tell Clunk what broke. Get the part to buy." }),
    ).toBeVisible();
    expect(screen.getByText("31 supported models")).toBeVisible();
    expect(screen.getByRole("button", { name: /01 Washer/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /02 Dishwasher/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /03 Electric dryer/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /04 Refrigerator/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "See the full answer" })).toBeVisible();
  });

  it("takes one click directly to an exact washer part and seller", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: "See the full answer" }));
    expect(screen.getByRole("heading", { name: "This is the part for your washer" })).toBeVisible();
    expect(screen.getByText("Part #AHA75693425")).toBeVisible();
    expect(screen.getByRole("link", { name: /Buy this part/ })).toHaveAttribute(
      "href",
      "https://encompass.com/item/12525362/LG/AHA75693425/",
    );
    expect(screen.getByText("Example answer")).toBeVisible();
  });

  it("switches to a dishwasher flagship and reaches its seller link", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: /02 Dishwasher/ }));
    await user.click(screen.getByRole("button", { name: "See the full answer" }));
    expect(
      screen.getByRole("heading", { name: "This is the part for your dishwasher" }),
    ).toBeVisible();
    expect(screen.getByText("Part #W11412291")).toBeVisible();
    expect(screen.getByRole("link", { name: /Buy this part/ })).toHaveAttribute(
      "href",
      "https://www.whirlpoolparts.com/PartDetail/Drain-Pump/W11412291/4960707",
    );
  });

  it("completes a real no-part-needed blocked-filter path", async () => {
    const user = userEvent.setup();
    renderClunk();
    await selectLg(user);
    await user.click(screen.getByRole("button", { name: "Safe to continue" }));
    await user.click(screen.getByRole("button", { name: "The hose looks clear" }));
    await user.click(screen.getByRole("button", { name: "I found debris" }));
    expect(
      screen.getByRole("heading", { name: "The blockage is the likely problem" }),
    ).toBeVisible();
    expect(screen.queryByRole("link", { name: /Buy this part/ })).not.toBeInTheDocument();
  });

  it("switches the visual to a top-load model", async () => {
    const user = userEvent.setup();
    renderClunk();
    const input = screen.getByRole("textbox", { name: "Washer model number" });
    await user.type(input, "GTW585BSVWS");
    await user.click(screen.getByRole("button", { name: "Find model" }));
    await user.click(screen.getByRole("button", { name: /GE GTW585BSVWS Guided checks only/ }));
    expect(
      screen.getByAltText("Open top-load washer showing the basket and drain path"),
    ).toHaveAttribute("src", "/assets/clunk-washer-top-load-topology-v2.png");
  });

  it("runs an available manual WebMCP tool through shared activity", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByText("Agent activity"));
    await user.click(screen.getByText("Select an exact appliance model"));
    const inspector = screen.getByRole("region", { name: "WebMCP tools" });
    await user.click(
      within(inspector).getByRole("button", { name: "Run sample for select_appliance" }),
    );
    const activity = screen.getByRole("region", { name: "What Clunk did" });
    expect(within(activity).getByText("Inspector")).toBeVisible();
    expect(within(activity).getByText("select_appliance")).toBeVisible();
  });
});
