import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await page.route("https://catalog.shopify.com/**", async (route) => {
    const request = route.request().postDataJSON() as {
      params?: { arguments?: { catalog?: { query?: string } } };
    };
    const query = request.params?.arguments?.catalog?.query ?? "";
    const knownSkus = [
      "WH11X39237",
      "W11412291",
      "WE01M10007",
      "XWFE",
      "DC97-20621A",
      "279570",
      "W11429587",
      "EDR1RXD1",
      "DA97-17376B",
      "LT1000P",
      "AHA75673404",
      "4026EL3007C",
      "W11462456",
      "DC97-19289F",
      "DC97-20621C",
      "DC97-22840A",
      "DC66-00814A",
      "AHA75853813",
    ];
    const sku = knownSkus.find((candidate) => query.includes(candidate)) ?? "WE01M10007";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          structuredContent: {
            products: [
              {
                id: "nearby-part",
                title: "Similar appliance part WRONG-SKU",
                variants: [
                  {
                    id: "nearby-variant",
                    sku: "WRONG-SKU",
                    price: { amount: 999, currency: "USD" },
                    checkout_url: "https://merchant.example/cart/wrong-sku",
                    availability: { available: true },
                    seller: { name: "Wrong Seller" },
                  },
                ],
              },
              {
                id: `exact-${sku}`,
                title: `Genuine exact appliance part ${sku}`,
                variants: [
                  {
                    id: `exact-variant-${sku}`,
                    sku,
                    price: { amount: 1899, currency: "USD" },
                    checkout_url: `https://merchant.example/cart/${sku}`,
                    availability: { available: true },
                    seller: { name: "UCP Parts" },
                  },
                ],
              },
              {
                id: `exact-secondary-${sku}`,
                title: `Exact replacement appliance part ${sku}`,
                variants: [
                  {
                    id: `exact-secondary-variant-${sku}`,
                    sku,
                    price: { amount: 995, currency: "USD" },
                    checkout_url: `https://second-merchant.example/cart/${sku}`,
                    availability: { available: true },
                    seller: { name: "Genuine Replacement Parts" },
                  },
                ],
              },
            ],
          },
        },
      }),
    });
  });
  await page.goto("/");
});

async function reachModelSearch(page: Page, appliance: RegExp, problem: RegExp) {
  await page.getByRole("button", { name: appliance }).click();
  await expect(page.getByRole("heading", { name: "What is it doing?" })).toBeFocused();
  await expect(page.getByRole("searchbox", { name: /model number/i })).toHaveCount(0);
  const problemButton = page.getByRole("button", { name: problem });
  if (!(await problemButton.isVisible())) await page.getByText("More problems").click();
  await problemButton.click();
  await expect(page.getByRole("heading", { name: "Find the model label." })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: /model number/i })).toBeFocused();
}

async function selectExactDryer(page: Page) {
  await reachModelSearch(page, /Choose Electric dryer/, /Door won't close/);
  const input = page.getByRole("searchbox", { name: "Electric dryer model number" });
  await input.fill("GTD42EASJ2WW");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.locator(".exact-model-match button").click();
  await expect(page.getByRole("heading", { name: "Unplug the dryer" })).toBeFocused();
}

async function selectLg(page: Page, query = "WM3400CW.ABWEVUS") {
  await reachModelSearch(page, /Choose Washer/, /Won't drain/);
  const input = page.getByRole("searchbox", { name: "Washer model number" });
  await input.fill(query);
  await page.getByRole("button", { name: "Find model" }).click();
  await page.locator(".exact-model-match button").click();
}

async function openGuidedProblem(
  page: Page,
  appliance: RegExp,
  problem: RegExp,
  query: string,
  modelResult: RegExp,
  safetyHeading: string,
) {
  await reachModelSearch(page, appliance, problem);
  const input = page.getByRole("searchbox", { name: /model number/i });
  await input.fill(query);
  await page.getByRole("button", { name: "Find model" }).click();
  const exactMatch = page.locator(".exact-model-match button");
  if (await exactMatch.isVisible()) await exactMatch.click();
  else await page.getByRole("button", { name: modelResult }).click();
  const start = page.getByRole("button", { name: "Start the checks" });
  if (await start.isVisible()) await start.click();
  await expect(page.getByRole("heading", { name: safetyHeading })).toBeFocused();
  await page.getByRole("button", { name: "Start over" }).click();
}

async function reachFilterOutcome(page: Page, resultName: string) {
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await page.getByRole("button", { name: "The hose looks clear" }).click();
  await page.getByRole("button", { name: resultName }).click();
}

async function openCompletedExample(page: Page, name: string) {
  const example = page.getByRole("button", { name });
  if (!(await example.isVisible())) await page.getByText("See a finished guide").click();
  await example.click();
}

test("puts substantial cutaway actions in the first journey and avoids full-resolution eager loads", async ({
  page,
}) => {
  await expect(page.getByRole("heading", { name: "What are you fixing?" })).toBeVisible();
  for (const label of [
    /Choose Washer — Won't drain/,
    /Choose Dishwasher — Won't drain/,
    /Choose Electric dryer — Door won't close/,
    /Choose Refrigerator — Water is slow/,
  ])
    await expect(page.getByRole("button", { name: label })).toBeVisible();
  await expect(page.getByText("See a finished guide")).toBeVisible();
  await expect(page.getByText(/research queue|next to evaluate/i)).toHaveCount(0);
  await expect(page.getByText("Browse all models")).toBeVisible();

  const loadedFullCutaways = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => /clunk-(?!.*thumbs).*topology.*\.png/.test(name)),
  );
  expect(loadedFullCutaways).toEqual([]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThanOrEqual(1);
});

test("keeps all four appliance actions identifiable in the 390px first viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const label of [
    /Choose Washer — Won't drain/,
    /Choose Dishwasher — Won't drain/,
    /Choose Electric dryer — Door won't close/,
    /Choose Refrigerator — Water is slow/,
  ]) {
    const action = page.getByRole("button", { name: label });
    const box = await action.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  }
});

test("moves from visual appliance to supported problem before model identification", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Choose Refrigerator/ }).click();
  await expect(page.getByText(/only show models with guidance for that problem/)).toBeVisible();
  await expect(page.getByRole("searchbox", { name: /model number/i })).toHaveCount(0);
  await page.getByRole("button", { name: /Water is slow/ }).click();
  await expect(page.getByRole("searchbox", { name: "Refrigerator model number" })).toBeFocused();
  await page.getByRole("button", { name: /Back to the problem/ }).click();
  await expect(page.getByRole("heading", { name: "What is it doing?" })).toBeVisible();
});

test("shows four plain consumer problems and a neutral checked overflow", async ({ page }) => {
  await page.getByRole("button", { name: /Choose Refrigerator/ }).click();
  await expect(page.getByRole("button", { name: /Water is slow/ })).not.toContainText("models");
  await expect(page.getByRole("button", { name: /Not cold enough/ })).not.toContainText("models");
  await expect(page.getByRole("button", { name: /Door won't close/ })).toBeHidden();
  await page.getByText("More problems").click();
  await expect(page.getByRole("button", { name: /Door won't close/ })).toBeVisible();
});

test("opens every broadened washer problem with topology-aware guided checks", async ({ page }) => {
  for (const [problem, heading] of [
    [/Won't start/, "Pause before checking"],
    [/Won't spin/, "Wait for the washer to stop"],
    [/Water is leaking/, "Stop the water first"],
  ] as const)
    await openGuidedProblem(
      page,
      /Choose Washer/,
      problem,
      "GTW335ASNWW",
      /GE GTW335ASNWW Safe checks available/,
      heading,
    );
});

test("opens every broadened dishwasher problem with conservative guided checks", async ({
  page,
}) => {
  for (const [problem, heading] of [
    [/Dishes stay dirty/, "Let the tub cool"],
    [/No water enters/, "Check for water before starting"],
    [/Water is leaking/, "Stop the cycle and power"],
  ] as const)
    await openGuidedProblem(
      page,
      /Choose Dishwasher/,
      problem,
      "GDT550PYRFS",
      /GE GDT550PYRFS Safe checks available/,
      heading,
    );
});

test("opens every broadened dryer problem with electrical safety stops", async ({ page }) => {
  for (const [problem, heading] of [
    [/Won't start/, "Keep the dryer off"],
    [/Runs without heat/, "Stop if there is heat damage"],
    [/Drum won't turn/, "Keep the drum still and stop for hazards"],
  ] as const)
    await openGuidedProblem(
      page,
      /Choose Electric dryer/,
      problem,
      "DLE6100W",
      /LG DLE6100W Safe checks available/,
      heading,
    );
});

test("opens every broadened refrigerator problem with feature-gated guided checks", async ({
  page,
}) => {
  for (const [problem, heading] of [
    [/Not cold enough/, "Protect food and check for damage"],
    [/Water is leaking/, "Keep water away from power"],
    [/Ice maker is not making ice/, "Keep hands out of the ice mechanism"],
  ] as const)
    await openGuidedProblem(
      page,
      /Choose Refrigerator/,
      problem,
      "RF23R6201SR/AA",
      /Samsung RF23R6201SR Safe checks available/,
      heading,
    );
});

test("runs a topology-aware washer lid closure guide and stops before internal repair", async ({
  page,
}) => {
  await reachModelSearch(page, /Choose Washer/, /Door won't close/);
  const input = page.getByRole("searchbox", { name: "Washer model number" });
  await input.fill("WT7400CW");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.getByRole("button", { name: /LG WT7400CW Safe checks available/ }).click();
  await page.getByRole("button", { name: "Start the checks" }).click();
  await expect(page.getByRole("heading", { name: "Wait for the lid lock" })).toBeFocused();
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await expect(page.getByRole("heading", { name: "Inspect the visible lid edge" })).toBeVisible();
  await page.getByRole("button", { name: "The visible edge is clear and undamaged" }).click();
  await page.getByRole("button", { name: "The lid still will not close normally" }).click();
  await expect(page.getByRole("heading", { name: "The lid system needs service" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Buy this part/ })).toHaveCount(0);
});

test("browses the 163-model catalog by brand without exposing internal tiers", async ({ page }) => {
  await reachModelSearch(page, /Choose Electric dryer/, /Door won't close/);
  await page.getByText("Browse instead").click();
  await page.getByText("Bosch").click();
  await expect(
    page.getByRole("button", { name: /WTG86403UC\/01 Safe checks available/ }),
  ).toBeVisible();
  await expect(page.getByText(/purchase-ready|checks only/i)).toHaveCount(0);
});

test("shows physical label guidance and preserves the exact-code boundary", async ({ page }) => {
  await reachModelSearch(page, /Choose Electric dryer/, /Door won't close/);
  await page.getByRole("button", { name: /Show me where the label is/ }).click();
  await expect(page.getByRole("heading", { name: "Find the dryer label" })).toBeVisible();
  await expect(page.getByText(/Open the door. Check the front face/)).toBeVisible();
  await expect(page.getByText("Serial · S/N")).toBeVisible();
  const guideAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(guideAxe.violations).toEqual([]);
  await page.getByRole("button", { name: /I found the model line/ }).click();

  const input = page.getByRole("searchbox", { name: "Electric dryer model number" });
  await expect(input).toBeFocused();
  await input.fill("gtd42-easj2");
  await expect(page.getByText(/One possible model found/)).toBeVisible();
  await page.getByRole("button", { name: /GE GTD42EASJ2WW Exact part available/ }).click();
  await expect(page.getByText(/Model family selected/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Full model number" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Buy this part/ })).toHaveCount(0);
});

test("gives an honest unsupported-model state and rejects serial-number text", async ({ page }) => {
  await reachModelSearch(page, /Choose Electric dryer/, /Door won't close/);
  const input = page.getByRole("searchbox", { name: "Electric dryer model number" });
  await input.fill("S/N: 123ABC456");
  await expect(page.getByRole("alert")).toContainText("labeled as a serial number");
  await expect(page.locator(".model-result")).toHaveCount(0);
  await input.fill("NOT-A-SUPPORTED-MODEL-999");
  await expect(page.getByText("That model is not in Clunk yet.")).toBeVisible();
  await expect(
    page.getByText(/Recheck O versus 0 and I versus 1, then try the complete model value/).first(),
  ).toBeVisible();
});

test("refuses a known model when the selected problem is not covered", async ({ page }) => {
  await reachModelSearch(page, /Choose Refrigerator/, /Water is leaking/);
  const input = page.getByRole("searchbox", { name: "Refrigerator model number" });
  await input.fill("B36CT81ENS/07");
  await expect(page.getByText("That model is supported for a different problem.")).toBeVisible();
  await expect(page.getByText(/Go back and choose the problem/)).toBeVisible();
  await expect(page.locator(".model-result")).toHaveCount(0);
});

test("one secondary action reaches an exact part and exact-SKU seller handoff", async ({
  page,
}) => {
  await openCompletedExample(page, "See completed dryer example");
  await expect(
    page.getByRole("heading", { name: "This is the part for your dryer" }),
  ).toBeFocused();
  await expect(page.locator(".part-sku")).toHaveText("Part #WE01M10007");
  await expect(page.getByRole("heading", { name: "Seller listings for this part" })).toBeVisible();
  await expect(page.getByText("$18.99", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /View UCP Parts offer for part WE01M10007/ }),
  ).toHaveAttribute("href", "https://merchant.example/cart/WE01M10007");
  await expect(page.getByText("Wrong Seller")).toHaveCount(0);
  await expect(page.getByText("Sample guide")).toBeVisible();
});

test("the new LG washer and dryer revisions reach only their proven exact-SKU handoffs", async ({
  page,
}) => {
  await reachModelSearch(page, /Choose Washer/, /Won't drain/);
  let input = page.getByRole("searchbox", { name: "Washer model number" });
  await input.fill("WT7400CW.ABWEUUS");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.locator(".exact-model-match button").click();
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await page.getByRole("button", { name: "The hose looks clear" }).click();
  await expect(page.locator(".part-sku")).toHaveText("Part #AHA75673404");
  await expect(
    page.getByRole("link", { name: /View UCP Parts offer for part AHA75673404/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Start over" }).click();
  await reachModelSearch(page, /Choose Electric dryer/, /Door won't close/);
  input = page.getByRole("searchbox", { name: "Electric dryer model number" });
  await input.fill("DLE6100W.ABWETUS");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.locator(".exact-model-match button").click();
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await page.getByRole("button", { name: "The strike is cracked, bent, or missing" }).click();
  await expect(page.locator(".part-sku")).toHaveText("Part #4026EL3007C");
  await expect(
    page.getByRole("link", { name: /View UCP Parts offer for part 4026EL3007C/ }),
  ).toBeVisible();
});

test("the exact KitchenAid dishwasher revision reaches its proven professional drain-pump handoff", async ({
  page,
}) => {
  await reachModelSearch(page, /Choose Dishwasher/, /Won't drain/);
  const input = page.getByRole("searchbox", { name: "Dishwasher model number" });
  await input.fill("KDTE204KPS2");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.locator(".exact-model-match button").click();
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await page.getByRole("button", { name: "The sink and visible hose look clear" }).click();
  await expect(page.locator(".part-sku")).toHaveText("Part #W11462456");
  await expect(
    page.getByText("This is an internal repair for a qualified appliance technician."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /View UCP Parts offer for part W11462456/ }),
  ).toBeVisible();
});

test("exact Samsung washer and dryer revisions reach only their proven professional handoffs", async ({
  page,
}) => {
  await reachModelSearch(page, /Choose Washer/, /Won't drain/);
  let input = page.getByRole("searchbox", { name: "Washer model number" });
  await input.fill("WA54CG7105AWUS");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.locator(".exact-model-match button").click();
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await page.getByRole("button", { name: "The hose looks clear" }).click();
  await expect(page.locator(".part-sku")).toHaveText("Part #DC97-22840A");
  await expect(
    page.getByText("This is an internal repair for a qualified appliance technician."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /View UCP Parts offer for part DC97-22840A/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Start over" }).click();
  await reachModelSearch(page, /Choose Electric dryer/, /Door won't close/);
  input = page.getByRole("searchbox", { name: "Electric dryer model number" });
  await input.fill("DVE45T6000W/A3");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.locator(".exact-model-match button").click();
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await page.getByRole("button", { name: "The strike is cracked, bent, or missing" }).click();
  await expect(page.locator(".part-sku")).toHaveText("Part #DC66-00814A");
  await expect(
    page.getByText("This is an internal repair for a qualified appliance technician."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /View UCP Parts offer for part DC66-00814A/ }),
  ).toBeVisible();
});

test("distinguishes a promoted offer and preserves Shopify attribution", async ({ page }) => {
  const attributedUrl =
    "https://merchant.example/products/strike?variant=42&utm_source=shopify&utm_medium=catalog&shclid=click_1&shdid=developer_9";
  await page.unroute("https://catalog.shopify.com/**");
  await page.route("https://catalog.shopify.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          structuredContent: {
            products: [
              {
                id: "promoted-strike",
                title: "Exact WE01M10007 dryer strike",
                variants: [
                  {
                    id: "promoted-variant",
                    sku: "WE01M10007",
                    price: { amount: 1899, currency: "USD" },
                    url: attributedUrl,
                    placement: { type: "affiliate" },
                    availability: { available: true },
                    seller: { name: "Promoted Parts" },
                  },
                ],
              },
            ],
          },
        },
      }),
    });
  });
  await openCompletedExample(page, "See completed dryer example");
  await expect(page.getByText("Promoted · paid placement")).toBeVisible();
  await page.getByText("About these listings").click();
  await expect(page.getByText(/Clunk may earn a commission/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /View Promoted Parts promoted listing/ }),
  ).toHaveAttribute("href", attributedUrl);
});

test("keeps stacked seller offers clear of source and safety guidance", async ({ page }) => {
  await page.setViewportSize({ width: 1063, height: 800 });
  await openCompletedExample(page, "See completed dryer example");

  const offers = page.getByRole("region", { name: "Seller listings for this part" });
  const source = page.getByRole("link", { name: /Check the GE Appliances source/ });
  const disclaimer = page.getByText(/Confirm the full model number again on the seller page/);
  await expect(page.getByText("Genuine Replacement Parts")).toBeVisible();

  const [offersBox, sourceBox, disclaimerBox] = await Promise.all([
    offers.boundingBox(),
    source.boundingBox(),
    disclaimer.boundingBox(),
  ]);
  expect(offersBox).not.toBeNull();
  expect(sourceBox).not.toBeNull();
  expect(disclaimerBox).not.toBeNull();
  expect(sourceBox!.y).toBeGreaterThanOrEqual(offersBox!.y + offersBox!.height + 16);
  expect(disclaimerBox!.y).toBeGreaterThanOrEqual(sourceBox!.y + sourceBox!.height + 16);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test("every category completed example ends at its verified purchase handoff", async ({ page }) => {
  const cases = [
    { example: "See completed washer example", noun: "washer", sku: "WH11X39237" },
    { example: "See completed dishwasher example", noun: "dishwasher", sku: "W11412291" },
    { example: "See completed refrigerator example", noun: "refrigerator", sku: "XWFE" },
  ];
  for (const item of cases) {
    await openCompletedExample(page, item.example);
    await expect(
      page.getByRole("heading", { name: `This is the part for your ${item.noun}` }),
    ).toBeVisible();
    await expect(page.locator(".part-sku")).toHaveText(`Part #${item.sku}`);
    await expect(
      page.getByRole("link", { name: new RegExp(`View UCP Parts offer for part ${item.sku}`) }),
    ).toHaveAttribute("target", "_blank");
    await page.getByRole("button", { name: "Start over" }).click();
  }
});

test("a checks-only model can finish at a no-purchase answer", async ({ page }) => {
  await selectLg(page);
  await expect(page.getByText("Safe checks available", { exact: true })).toBeVisible();
  await reachFilterOutcome(page, "I found debris");
  await expect(
    page.getByRole("heading", { name: "The blockage is the likely problem" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Buy this part/ })).toHaveCount(0);
});

test("uses the correct persistent cutaway for a supported top-load model", async ({ page }) => {
  await reachModelSearch(page, /Choose Washer/, /Won't drain/);
  const input = page.getByRole("searchbox", { name: "Washer model number" });
  await input.fill("GTW585BSVWS");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.getByRole("button", { name: /GE GTW585BSVWS Safe checks available/ }).click();
  await expect(
    page.locator('img[src="/assets/clunk-washer-top-load-topology-v2.png"]'),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Show Wash basket" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show Drain filter" })).toHaveCount(0);
});

test("keeps the essential result and next purchase step in the mobile result viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openCompletedExample(page, "See completed dryer example");
  const result = page.getByRole("heading", { name: "This is the part for your dryer" });
  const cart = page.getByRole("link", { name: /View UCP Parts offer for part WE01M10007/ });
  await expect(result).toBeVisible();
  await expect(cart).toBeVisible();
  await expect
    .poll(async () => {
      const [resultBox, cartBox] = await Promise.all([result.boundingBox(), cart.boundingBox()]);
      if (!resultBox || !cartBox) return false;
      const visibleHeadingHeight =
        Math.min(800, resultBox.y + resultBox.height) - Math.max(0, resultBox.y);
      return visibleHeadingHeight >= 44 && cartBox.y >= 0 && cartBox.y + cartBox.height <= 800;
    })
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test("stops at a reported hazard without exposing undo or commerce", async ({ page }) => {
  await selectExactDryer(page);
  await expect(page.getByText("Whole appliance", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show Electric dryer" })).toHaveCount(0);
  await page.getByRole("button", { name: "Smoke or burning smell" }).click();
  await expect(
    page.getByRole("heading", { name: "A professional should continue." }),
  ).toBeVisible();
  await expect(page.getByText("Do not move the appliance or remove another panel.")).toBeVisible();
  await expect(page.getByText(/Clunk does not assign or endorse a service company/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Change the last answer" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Buy this part/ })).toHaveCount(0);
});

test("supports Back undo and refresh persistence without credentials", async ({ page }) => {
  await selectExactDryer(page);
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await expect(page.getByRole("heading", { name: "Look at the door catch" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Change the last answer" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Look at the door catch" })).toBeVisible();
  await page.getByRole("button", { name: "Change the last answer" }).click();
  await expect(page.getByRole("button", { name: "Safe to continue" })).toBeVisible();
});

test("keeps WebMCP activity judge-visible but out of the primary consumer flow", async ({
  page,
}) => {
  await selectExactDryer(page);
  await expect(page.getByText("Waiting for your observation")).not.toBeVisible();
  await page.getByText("One guide. Two ways to use it.").click();
  await expect(page.getByText("Waiting for your observation")).toBeVisible();
  await page.getByText("Open the live WebMCP inspector").click();
  const inspector = page.getByRole("region", { name: "WebMCP tools" });
  await expect(inspector.getByText("record_observation", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await page.getByRole("button", { name: "The strike is cracked, bent, or missing" }).click();
  await expect(page.getByText("Part lookup used")).toBeVisible();
  await expect(page.locator(".part-sku")).toHaveText("Part #WE01M10007");
});

test("is keyboard reachable, touch sized, reduced-motion safe, and WCAG A/AA clean", async ({
  page,
}, testInfo) => {
  const appliance = page.getByRole("button", { name: /Choose Electric dryer/ });
  await appliance.focus();
  await expect(appliance).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: /Door won't close/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("searchbox", { name: "Electric dryer model number" })).toBeFocused();

  await page.getByRole("button", { name: /Back to the problem/ }).click();
  await page.getByRole("button", { name: /Change appliance/ }).click();
  await openCompletedExample(page, "See completed dryer example");
  const latchComponent = page.getByRole("button", { name: "Show Door latch" });
  await latchComponent.focus();
  await page.keyboard.press("Enter");
  await expect(latchComponent).toHaveAttribute("aria-pressed", "true");

  if (testInfo.project.name === "mobile-chromium") {
    const undersizedButtons = await page.locator("button:visible").evaluateAll((buttons) =>
      buttons
        .map((button) => button.getBoundingClientRect())
        .filter((rect) => rect.width < 44 || rect.height < 44)
        .map((rect) => ({ width: rect.width, height: rect.height })),
    );
    expect(undersizedButtons).toEqual([]);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  const duration = await page
    .locator(".appliance-component")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(["0.00001s", "1e-05s"]).toContain(duration);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
});
