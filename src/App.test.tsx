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

async function reachModelSearch(
  user: ReturnType<typeof userEvent.setup>,
  appliance: RegExp,
  problem: RegExp,
) {
  await user.click(screen.getByRole("button", { name: appliance }));
  expect(screen.getByRole("heading", { name: "What is it doing?" })).toBeVisible();
  expect(screen.queryByRole("combobox", { name: /model number/i })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: problem }));
}

async function selectLg(user: ReturnType<typeof userEvent.setup>, query = "WM3400CW.ABWEVUS") {
  await reachModelSearch(user, /Choose Washer/, /Supported now Won't drain/);
  const input = screen.getByRole("searchbox", { name: "Washer model number" });
  await user.clear(input);
  await user.type(input, query);
  await user.click(screen.getByRole("button", { name: "Find model" }));
  await user.click(screen.getByRole("button", { name: /LG WM3400CW Guided checks only/ }));
}

describe("Clunk visual field guide", () => {
  beforeEach(() => {
    window.localStorage.clear();
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
    window.localStorage.clear();
    Reflect.deleteProperty(document, "modelContext");
    vi.unstubAllGlobals();
  });

  it("leads with visual appliance actions and a secondary completed path", () => {
    renderClunk();
    expect(screen.getByRole("heading", { name: "What are you fixing?" })).toBeVisible();
    expect(screen.getByText("163 supported models")).toBeVisible();
    for (const label of [
      /Choose Washer — 4 broad problem guides/,
      /Choose Dishwasher — 4 broad problem guides/,
      /Choose Electric dryer — 4 broad problem guides/,
      /Choose Refrigerator — 4 broad problem guides/,
    ])
      expect(screen.getByRole("button", { name: label })).toBeVisible();
    expect(screen.getByAltText("Cutaway view of an electric dryer")).toHaveAttribute(
      "src",
      "/assets/thumbs/clunk-dryer-240.png",
    );
    expect(screen.getByText("See how Clunk works")).toBeVisible();
    expect(screen.getByText(/Vacuums and robot vacuums are next to evaluate/)).toBeVisible();
    expect(screen.getByText("All supported appliances")).toBeVisible();
  });

  it("makes the supported problem an honest step before model lookup", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: /Choose Refrigerator/ }));
    expect(
      screen.getByText(/Coverage is checked separately for every model and problem/),
    ).toBeVisible();
    expect(screen.getByText(/41 checked models · 27 purchase-ready/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Supported now Not cold enough/ })).toHaveTextContent(
      "22 checked models · checks only",
    );
    expect(screen.getByText("More problems")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /35 checked models.*Door won't close/ }),
    ).not.toBeVisible();
    await user.click(screen.getByText("More problems"));
    expect(
      screen.getByRole("button", { name: /35 checked models.*Door won't close/ }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Supported now Water is slow/ }));
    expect(screen.getByRole("heading", { name: "Find the model label." })).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Refrigerator model number" })).toBeVisible();
  });

  it("shows the expanded exact-pump count without changing dishwasher route breadth", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: /Choose Dishwasher/ }));
    expect(screen.getByText(/33 checked models · 13 purchase-ready/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Supported now Won't drain/ })).toBeVisible();
  });

  it("returns the local journey to appliance choice when Start over clears shared state", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: /Choose Refrigerator/ }));
    expect(screen.getByRole("heading", { name: "What is it doing?" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Start over" }));
    expect(screen.getByRole("heading", { name: "What are you fixing?" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Start over" })).not.toBeInTheDocument();
  });

  it("browses the expanded catalog hierarchically without blurring coverage tiers", async () => {
    const user = userEvent.setup();
    renderClunk();
    await reachModelSearch(user, /Choose Electric dryer/, /Supported now Door won't close/);
    await user.click(screen.getByText("Browse by brand"));
    await user.click(screen.getByRole("button", { name: "Checks only 24" }));
    await user.click(screen.getByText("Bosch"));
    expect(screen.getByRole("button", { name: /WTG86403UC\/01 Guided checks only/ })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Purchase-ready 9" }));
    expect(
      screen.queryByRole("button", { name: /WTG86403UC\/01 Guided checks only/ }),
    ).not.toBeInTheDocument();
  });

  it("makes model-label discovery a complete visual path", async () => {
    const user = userEvent.setup();
    renderClunk();
    await reachModelSearch(user, /Choose Washer/, /Supported now Won't drain/);
    await user.click(screen.getByRole("button", { name: /Show me where the label is/ }));
    expect(screen.getByRole("heading", { name: "Find the washer label" })).toBeVisible();
    expect(screen.getByText(/Open the door. Check the door rim/)).toBeVisible();
    expect(screen.getByText("Serial · S/N")).toBeVisible();
    await user.selectOptions(screen.getByRole("combobox", { name: "Brand (optional)" }), "GE");
    expect(screen.getByText(/final engineering digit can change part fit/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Lid on top" }));
    expect(screen.getByText(/Lift the lid. Check the tub rim/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: /I found the model line/ }));
    expect(screen.getByRole("searchbox", { name: "Washer model number" })).toHaveFocus();
  });

  it("guides serial mistakes and partial suggestions without claiming exactness", async () => {
    const user = userEvent.setup();
    renderClunk();
    await reachModelSearch(user, /Choose Electric dryer/, /Supported now Door won't close/);
    const input = screen.getByRole("searchbox", { name: "Electric dryer model number" });
    await user.type(input, "S/N: 123ABC");
    expect(screen.getByRole("alert")).toHaveTextContent("labeled as a serial number");
    await user.clear(input);
    await user.type(input, "gtd42-easj");
    expect(screen.getByText(/One possible model family found/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }));
    expect(screen.getByRole("heading", { name: "GE GTD42EASJ2WW" })).toBeVisible();
    expect(screen.getByText(/Model family selected/)).toBeVisible();
    const fullModelInput = screen.getByRole("textbox", { name: "Full model number" });
    await user.type(fullModelInput, "S/N: 123ABC456");
    await user.click(screen.getByRole("button", { name: "Start diagnosis" }));
    expect(screen.getByRole("alert")).toHaveTextContent("labeled as a serial number");
  });

  it("takes the completed dryer example to its exact part and seller", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: "See completed dryer example" }));
    expect(screen.getByRole("heading", { name: "This is the part for your dryer" })).toBeVisible();
    expect(screen.getByText("Part #WE01M10007")).toBeVisible();
    expect(await screen.findByRole("heading", { name: "Live offers from Shopify" })).toBeVisible();
    expect(
      await screen.findByRole("link", {
        name: "Open Shopify test seller cart for part WE01M10007 in a new tab",
      }),
    ).toHaveAttribute("href", "https://shopify.example/cart/WE01M10007");
    expect(screen.getByText("Completed example")).toBeVisible();
    expect(screen.getByText(/answers are prefilled/)).toBeVisible();
    expect(screen.getByText(/organic offers are not paid placements/i)).toBeVisible();
    expect(screen.queryByText(/Clunk may earn a commission/)).not.toBeInTheDocument();
  });

  it("labels a promoted offer, discloses commission, and preserves attribution", async () => {
    const attributedUrl =
      "https://shopify.example/products/exact?variant=42&utm_source=shopify&utm_medium=catalog&shclid=click_1&shdid=developer_9";
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              result: {
                structuredContent: {
                  products: [
                    {
                      id: "promoted-part",
                      title: "Exact WE01M10007 dryer strike",
                      variants: [
                        {
                          id: "promoted-variant",
                          sku: "WE01M10007",
                          price: { amount: 1899, currency: "USD" },
                          url: attributedUrl,
                          placement: { type: "affiliate" },
                          availability: { available: true },
                          seller: { name: "Promoted test seller" },
                        },
                      ],
                    },
                  ],
                },
              },
            }),
            { status: 200 },
          ),
      ),
    );
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: "See completed dryer example" }));

    expect(await screen.findByText("Promoted · paid placement")).toBeVisible();
    expect(screen.getByText(/Clunk may earn a commission/)).toBeVisible();
    expect(
      screen.getByRole("link", {
        name: "Open Promoted test seller promoted listing for part WE01M10007 in a new tab",
      }),
    ).toHaveAttribute("href", attributedUrl);
  });

  it("switches directly to a dishwasher completed example", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: "See completed dishwasher example" }));
    expect(
      screen.getByRole("heading", { name: "This is the part for your dishwasher" }),
    ).toBeVisible();
    expect(screen.getByText("Part #W11412291")).toBeVisible();
  });

  it("keeps the verified part visible when the live seller lookup needs a retry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("catalog unavailable"))),
    );
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByRole("button", { name: "See completed dryer example" }));
    expect(screen.getByText("Part #WE01M10007")).toBeVisible();
    expect(screen.getByText(/Shopify’s live catalog is temporarily unavailable/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeVisible();
  });

  it("completes a real checks-only no-part-needed path", async () => {
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

  it("keeps WebMCP handoff evidence in the secondary technical disclosure", async () => {
    const user = userEvent.setup();
    renderClunk();
    await reachModelSearch(user, /Choose Electric dryer/, /Supported now Door won't close/);
    const input = screen.getByRole("searchbox", { name: "Electric dryer model number" });
    await user.type(input, "GTD42EASJ2WW");
    await user.click(screen.getByRole("button", { name: "Find model" }));
    await user.click(screen.getByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }));
    expect(screen.queryByText("Waiting for your observation")).not.toBeVisible();
    await user.click(screen.getByText("For judges and developers"));
    expect(screen.getByText("Waiting for your observation")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Safe to continue" }));
    await user.click(
      screen.getByRole("button", { name: "The strike is cracked, bent, or missing" }),
    );
    expect(screen.getByText("Part lookup available")).toBeVisible();
    expect(screen.getByText("Part #WE01M10007")).toBeVisible();
  });

  it("switches the persistent cutaway to a top-load model", async () => {
    const user = userEvent.setup();
    renderClunk();
    await reachModelSearch(user, /Choose Washer/, /Supported now Won't drain/);
    const input = screen.getByRole("searchbox", { name: "Washer model number" });
    await user.type(input, "GTW585BSVWS");
    await user.click(screen.getByRole("button", { name: "Find model" }));
    await user.click(screen.getByRole("button", { name: /GE GTW585BSVWS Guided checks only/ }));
    expect(
      screen.getByAltText("Open top-load washer showing the basket and drain path"),
    ).toHaveAttribute("src", "/assets/clunk-washer-top-load-topology-v2.png");
  });

  it("can undo the last safe observation and answer again", async () => {
    const user = userEvent.setup();
    renderClunk();
    await reachModelSearch(user, /Choose Electric dryer/, /Supported now Door won't close/);
    const input = screen.getByRole("searchbox", { name: "Electric dryer model number" });
    await user.type(input, "GTD42EASJ2WW");
    await user.click(screen.getByRole("button", { name: "Find model" }));
    await user.click(screen.getByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }));
    await user.click(screen.getByRole("button", { name: "Safe to continue" }));
    expect(screen.getByRole("button", { name: "Change the last answer" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Change the last answer" }));
    expect(screen.getByRole("button", { name: "Safe to continue" })).toBeVisible();
  });

  it("restores diagnosis progress after an interruption", async () => {
    const user = userEvent.setup();
    const view = renderClunk();
    await reachModelSearch(user, /Choose Electric dryer/, /Supported now Door won't close/);
    const input = screen.getByRole("searchbox", { name: "Electric dryer model number" });
    await user.type(input, "GTD42EASJ2WW");
    await user.click(screen.getByRole("button", { name: "Find model" }));
    await user.click(screen.getByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }));
    await user.click(screen.getByRole("button", { name: "Safe to continue" }));
    expect(screen.getByRole("button", { name: "The strike looks intact" })).toBeVisible();
    view.unmount();

    renderClunk();
    expect(screen.getByRole("heading", { name: "Look at the door catch" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Change the last answer" })).toBeVisible();
  });

  it("runs an available WebMCP tool through the shared technical activity", async () => {
    const user = userEvent.setup();
    renderClunk();
    await user.click(screen.getByText("For judges and developers"));
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
