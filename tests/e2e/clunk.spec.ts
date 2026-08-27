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
            ],
          },
        },
      }),
    });
  });
  await page.goto("/");
});

async function selectLg(page: Page, query = "WM3400CW.ABWEVUS") {
  await page.getByRole("button", { name: /01 Washer/ }).click();
  const input = page.getByRole("combobox", { name: "Washer model number" });
  await input.fill(query);
  await page.getByRole("button", { name: "Find model" }).click();
  await page.getByRole("button", { name: /LG WM3400CW Guided checks only/ }).click();
}

async function reachFilterOutcome(page: Page, resultName: string) {
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await page.getByRole("button", { name: "The hose looks clear" }).click();
  await page.getByRole("button", { name: resultName }).click();
}

test("makes the outcome and four categories immediately clear", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Tell Clunk what broke. Get the part to buy." }),
  ).toBeVisible();
  await expect(page.getByText("131 supported models")).toBeVisible();
  for (const label of [/01 Washer/, /02 Dishwasher/, /03 Electric dryer/, /04 Refrigerator/]) {
    await expect(page.getByRole("button", { name: label })).toBeVisible();
  }
  await expect(page.locator(".status-pill")).toContainText(/AI connected|Guided mode|Connecting/);
  await expect(page.getByRole("button", { name: "See the full answer" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Find my model number/ })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("filters the 131-model catalog without blurring evidence tiers", async ({ page }) => {
  await page.getByText("Browse 25 supported electric dryer models", { exact: false }).click();
  await page.getByRole("button", { name: "Checks only 18" }).click();
  await page.getByRole("button", { name: "Bosch" }).click();
  await expect(
    page.getByRole("button", { name: /Bosch WTG86403UC\/01 Guided checks only/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Purchase-ready 7" }).click();
  await expect(page.getByText("No purchase-ready models in this view.")).toBeVisible();
});

test("finds the physical label, narrows a partial code, and preserves the exactness boundary", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Find my model number/ }).click();
  await expect(page.getByRole("heading", { name: "Find the dryer label" })).toBeVisible();
  await expect(page.getByText(/Open the door. Check the front face/)).toBeVisible();
  await expect(page.getByText("Serial · S/N")).toBeVisible();
  const guideAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(guideAxe.violations).toEqual([]);
  const foundButton = page.getByRole("button", { name: /I found the model line/ });
  await foundButton.focus();
  await page.keyboard.press("Enter");

  const input = page.getByRole("combobox", { name: "Electric dryer model number" });
  await expect(input).toBeFocused();
  await input.fill("gtd42-easj2");
  await expect(page.getByText(/One possible model family found/)).toBeVisible();
  await page.getByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }).click();
  await expect(page.getByRole("heading", { name: "GE GTD42EASJ2WW" })).toBeVisible();
  await expect(page.getByText(/Model family selected/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Full model number" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start diagnosis" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Buy this part/ })).toHaveCount(0);
});

test("rejects a serial-number line before model selection", async ({ page }) => {
  const input = page.getByRole("combobox", { name: "Electric dryer model number" });
  await input.fill("S/N: 123ABC456");
  await expect(page.getByRole("alert")).toContainText("labeled as a serial number");
  await expect(page.locator(".model-result")).toHaveCount(0);
});

test("one click reaches a visible exact part and seller link", async ({ page }) => {
  await page.getByRole("button", { name: "See the full answer" }).click();
  await expect(
    page.getByRole("heading", { name: "This is the part for your dryer" }),
  ).toBeVisible();
  await expect(page.locator(".part-sku")).toHaveText("Part #WE01M10007");
  await expect(page.getByRole("heading", { name: "Live offers from Shopify" })).toBeVisible();
  await expect(page.getByText("$18.99", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Open UCP Parts cart for part WE01M10007/ }),
  ).toHaveAttribute("href", "https://merchant.example/cart/WE01M10007");
  await expect(page.getByText("Wrong Seller")).toHaveCount(0);
  await expect(page.getByText("Example answer")).toBeVisible();
  await expect(page.getByText(/This is not an agent run/)).toBeVisible();
});

test("every category flagship ends at its verified purchase handoff", async ({ page }) => {
  const cases = [
    { category: /01 Washer/, noun: "washer", sku: "WH11X39237" },
    { category: /02 Dishwasher/, noun: "dishwasher", sku: "W11412291" },
    { category: /04 Refrigerator/, noun: "refrigerator", sku: "XWFE" },
  ];
  for (const item of cases) {
    await page.getByRole("button", { name: item.category }).click();
    await page.getByRole("button", { name: "See the full answer" }).click();
    await expect(
      page.getByRole("heading", { name: `This is the part for your ${item.noun}` }),
    ).toBeVisible();
    await expect(page.locator(".part-sku")).toHaveText(`Part #${item.sku}`);
    await expect(
      page.getByRole("link", { name: new RegExp(`Open UCP Parts cart for part ${item.sku}`) }),
    ).toHaveAttribute("target", "_blank");
    await page.getByRole("button", { name: "Reset" }).click();
  }
});

test("real observations can reach a no-purchase answer", async ({ page }) => {
  await selectLg(page);
  await reachFilterOutcome(page, "I found debris");
  await expect(
    page.getByRole("heading", { name: "The blockage is the likely problem" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Buy this part/ })).toHaveCount(0);
});

test("switches the location guide for a supported top-load model", async ({ page }) => {
  await page.getByRole("button", { name: /01 Washer/ }).click();
  const input = page.getByRole("combobox", { name: "Washer model number" });
  await input.fill("GTW585BSVWS");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.getByRole("button", { name: /GE GTW585BSVWS Guided checks only/ }).click();
  await expect(
    page.locator('img[src="/assets/clunk-washer-top-load-topology-v2.png"]'),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Show Wash basket" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show Drain filter" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start the checks" })).toBeVisible();
});

test("keeps the exact-part result inside a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole("button", { name: "See the full answer" }).click();
  await expect(
    page.getByRole("heading", { name: "This is the part for your dryer" }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("stops instead of exposing more steps after a reported hazard", async ({ page }) => {
  const input = page.getByRole("combobox", { name: "Electric dryer model number" });
  await input.fill("GTD42EASJ2WW");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.getByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }).click();
  await page.getByRole("button", { name: "Smoke or burning smell" }).click();
  await expect(
    page.getByRole("heading", { name: "A professional should continue." }),
  ).toBeVisible();
  await expect(page.getByText("Do not move the appliance or remove another panel.")).toBeVisible();
  await expect(
    page.getByText("Safety stop recorded — part lookup stays unavailable."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Buy this part/ })).toHaveCount(0);
  await expect(
    page.locator(".tool-inspector").getByText("find_compatible_part", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Safe to continue" })).toHaveCount(0);
});

test("shows the human-agent baton pass and active-tool transition", async ({ page }) => {
  const input = page.getByRole("combobox", { name: "Electric dryer model number" });
  await input.fill("GTD42EASJ2WW");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.getByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }).click();
  await expect(
    page.getByRole("heading", { name: "Your turn — Clunk cannot see this." }),
  ).toBeVisible();
  await expect(page.getByText("Waiting for your observation")).toBeVisible();
  await expect(page.getByText("Locked until you answer")).toBeVisible();
  await page.getByRole("button", { name: "Safe to continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Your turn — Clunk cannot see this." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "The strike is cracked, bent, or missing" }).click();
  await expect(
    page.getByRole("heading", { name: "Observation recorded — part lookup unlocked." }),
  ).toBeVisible();
  await expect(page.getByText("Part lookup available")).toBeVisible();
  await expect(page.locator(".part-sku")).toHaveText("Part #WE01M10007");
  await expect(page.getByRole("heading", { name: "Live offers from Shopify" })).toBeVisible();
  await expect(page.getByText("UCP Parts", { exact: true })).toBeVisible();
  await expect(page.getByText(/Clunk verified the model-to-part match/)).toBeVisible();
});

test("is keyboard reachable, touch sized, reduced-motion safe, and WCAG A/AA clean", async ({
  page,
}, testInfo) => {
  const example = page.getByRole("button", { name: "See the full answer" });
  await example.focus();
  await expect(example).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "This is the part for your dryer" }),
  ).toBeVisible();
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
