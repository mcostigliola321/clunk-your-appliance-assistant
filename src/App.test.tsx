import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { ActivityLog } from "./components/ActivityLog";
import { RepairProvider } from "./state/RepairProvider";

function renderClunk() {
  return render(
    <RepairProvider>
      <App />
    </RepairProvider>,
  );
}

async function selectLg(user: ReturnType<typeof userEvent.setup>, query = "WM3400CW.ABWEVUS") {
  await user.click(screen.getByRole("button", { name: /01 Washer/ }));
  const input = screen.getByRole("combobox", { name: "Washer model number" });
  await user.clear(input);
  await user.type(input, query);
  await user.click(screen.getByRole("button", { name: "Find model" }));
  await user.click(screen.getByRole("button", { name: /LG WM3400CW Guided checks only/ }));
}

describe("Clunk repair bench", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body)) as {
          params?: { arguments?: { catalog?: { query?: string } } };
        };
        const sku =
          request.params?.arguments?.catalog?.query?.match(/\b(?:[A-Z]+\d[\w-]*|\d{6})\b/)?.[0] ??
          "WE01M10007";
        return new Response(
          JSON.stringify({
            result: {
              structuredContent: {
                products: [
                  {
                    id: `product-${sku}`,
                    title: `Genuine exact part ${sku}`,
                    variants: [
                      {
                        id: `variant-${sku}`,
                        sku,
                        price: { amount: 1899, currency: "USD" },
                        checkout_url: `https://shopify.example/cart/${sku}`,
                        availability: { available: true },
                        seller: { name: "Shopify test seller" },
                      },
                    ],
                  },
                ],
              },
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );
  });

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(document, "modelContext");
    vi.unstubAllGlobals();
  });

  it("makes the promise and four appliance categories immediately clear", () => {
    renderClunk();
    expect(
      screen.getByRole("heading", { name: "Tell Clunk what broke. Get the part to buy." }),
    ).toBeVisible();
    expect(screen.getByText("131 supported models")).toBeVisible();
    expect(screen.getByRole("button", { name: /01 Washer/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /02 Dishwasher/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /03 Electric dryer/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /04 Refrigerator/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "See the full answer" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Find my model number/ })).toBeVisible();
  });

  it("filters the expanded catalog by honest evidence tier and brand", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(
      screen.getByText("Browse 25 supported electric dryer models", { exact: false }),
    );
    await user.click(screen.getByRole("button", { name: "Checks only 18" }));
    await user.click(screen.getByRole("button", { name: "Bosch" }));
    expect(
      screen.getByRole("button", { name: /Bosch WTG86403UC\/01 Guided checks only/ }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Purchase-ready 7" }));
    expect(screen.getByText("No purchase-ready models in this view.")).toBeVisible();
  });

  it("makes model-label discovery a complete manual path", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: /01 Washer/ }));
    await user.click(screen.getByRole("button", { name: /Find my model number/ }));
    expect(screen.getByRole("heading", { name: "Find the washer label" })).toBeVisible();
    expect(screen.getByText(/Open the door. Check the door rim/)).toBeVisible();
    expect(screen.getByText("Serial · S/N")).toBeVisible();
    await user.selectOptions(screen.getByRole("combobox", { name: "Brand (optional)" }), "GE");
    expect(screen.getByText(/final engineering digit can change part fit/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Lid on top" }));
    expect(screen.getByText(/Lift the lid. Check the tub rim/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: /I found the model line/ }));
    expect(screen.getByRole("combobox", { name: "Washer model number" })).toHaveFocus();
  });

  it("guides serial mistakes and partial model suggestions without claiming exactness", async () => {
    const user = userEvent.setup();
    renderClunk();
    const input = screen.getByRole("combobox", { name: "Electric dryer model number" });
    await user.type(input, "S/N: 123ABC");
    expect(screen.getByRole("alert")).toHaveTextContent("labeled as a serial number");
    await user.clear(input);
    await user.type(input, "gtd42-easj");
    expect(screen.getByText(/One possible model family found/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }));
    expect(screen.getByRole("heading", { name: "GE GTD42EASJ2WW" })).toBeVisible();
    expect(screen.getByText(/Model family selected/)).toBeVisible();
    const fullModelInput = screen.getByRole("textbox", { name: "Full model number" });
    expect(fullModelInput).toBeVisible();
    expect(screen.getByRole("button", { name: "Start diagnosis" })).toBeVisible();
    await user.type(fullModelInput, "S/N: 123ABC456");
    await user.click(screen.getByRole("button", { name: "Start diagnosis" }));
    expect(screen.getByRole("alert")).toHaveTextContent("labeled as a serial number");
  });

  it("takes one click directly to the flagship dryer part and seller", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: "See the full answer" }));
    expect(screen.getByRole("heading", { name: "This is the part for your dryer" })).toBeVisible();
    expect(screen.getByText("Part #WE01M10007")).toBeVisible();
    expect(await screen.findByRole("heading", { name: "Live offers from Shopify" })).toBeVisible();
    expect(screen.getByText(/exact part number WE01M10007 only/)).toBeVisible();
    expect(
      await screen.findByRole("link", {
        name: "Open Shopify test seller cart for part WE01M10007 in a new tab",
      }),
    ).toHaveAttribute("href", "https://shopify.example/cart/WE01M10007");
    expect(screen.getByText("Example answer")).toBeVisible();
    expect(screen.getByText(/This is not an agent run/)).toBeVisible();
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
    expect(
      await screen.findByRole("link", {
        name: "Open Shopify test seller cart for part W11412291 in a new tab",
      }),
    ).toHaveAttribute("href", "https://shopify.example/cart/W11412291");
  });

  it("keeps the verified part visible when Shopify needs a retry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("catalog unavailable"))),
    );
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: "See the full answer" }));

    expect(screen.getByText("Part #WE01M10007")).toBeVisible();
    expect(screen.getByText(/Shopify’s live catalog is temporarily unavailable/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
    expect(screen.getByText(/Clunk verified the model-to-part match/)).toBeVisible();
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

  it("makes the human observation and WebMCP tool swap visible", async () => {
    const user = userEvent.setup();
    renderClunk();
    const input = screen.getByRole("combobox", { name: "Electric dryer model number" });
    await user.type(input, "GTD42EASJ2WW");
    await user.click(screen.getByRole("button", { name: "Find model" }));
    await user.click(screen.getByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }));
    expect(
      screen.getByRole("heading", { name: "Your turn — Clunk cannot see this." }),
    ).toBeVisible();
    expect(screen.getByText("Waiting for your observation")).toBeVisible();
    expect(screen.getByText("Locked until you answer")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Safe to continue" }));
    await user.click(
      screen.getByRole("button", { name: "The strike is cracked, bent, or missing" }),
    );
    expect(
      screen.getByRole("heading", { name: "Observation recorded — part lookup unlocked." }),
    ).toBeVisible();
    expect(screen.getByText("Part lookup available")).toBeVisible();
    expect(screen.getByText("Part #WE01M10007")).toBeVisible();
  });

  it("switches the visual to a top-load model", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: /01 Washer/ }));
    const input = screen.getByRole("combobox", { name: "Washer model number" });
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
    await user.click(screen.getByText("Human + agent activity"));
    await user.click(screen.getByText("Select an exact appliance model"));
    const inspector = screen.getByRole("region", { name: "WebMCP tools" });
    await user.click(
      within(inspector).getByRole("button", { name: "Run sample for select_appliance" }),
    );
    const activity = screen.getByRole("region", { name: "Collaboration timeline" });
    expect(within(activity).getByText("Inspector")).toBeVisible();
    expect(within(activity).getByText("select_appliance")).toBeVisible();
  });

  it("distinguishes every collaboration source without hiding technical actions", () => {
    const sources = ["example", "human", "agent", "manual", "system"] as const;
    render(
      <ActivityLog
        activity={sources.map((source, index) => ({
          id: `source-${source}`,
          sequence: index,
          source,
          action: index === 0 ? "catalog_ready" : "select_appliance",
          arguments: {},
          outcome: "accepted",
          message: `${source} event`,
        }))}
      />,
    );
    for (const label of ["Example", "You", "Agent", "Inspector", "Clunk"])
      expect(screen.getByText(label)).toBeVisible();
    expect(screen.getAllByText("select_appliance")).toHaveLength(4);
  });
});
