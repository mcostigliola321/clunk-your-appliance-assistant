import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function selectLg(page: Page, query = "WM3400CW.ABWEVUS") {
  const input = page.getByRole("textbox", { name: "Washer model number" });
  await input.fill(query);
  await page.getByRole("button", { name: "Find model" }).click();
  await page.getByRole("button", { name: /LG WM3400CW Purchase-ready/ }).click();
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
  await expect(page.getByText("31 supported models")).toBeVisible();
  for (const label of [/01 Washer/, /02 Dishwasher/, /03 Electric dryer/, /04 Refrigerator/]) {
    await expect(page.getByRole("button", { name: label })).toBeVisible();
  }
  await expect(page.locator(".status-pill")).toContainText(/AI connected|Guided mode|Connecting/);
  await expect(page.getByRole("button", { name: "See the full answer" })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("one click reaches a visible exact part and seller link", async ({ page }) => {
  await page.getByRole("button", { name: "See the full answer" }).click();
  await expect(
    page.getByRole("heading", { name: "This is the part for your washer" }),
  ).toBeVisible();
  await expect(page.locator(".part-sku")).toHaveText("Part #AHA75693425");
  await expect(page.getByText("$123.95", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Buy this part/ })).toHaveAttribute(
    "href",
    "https://encompass.com/item/12525362/LG/AHA75693425/",
  );
  await expect(page.getByText("Example answer")).toBeVisible();
});

test("every category flagship ends at its verified purchase handoff", async ({ page }) => {
  const cases = [
    { category: /02 Dishwasher/, noun: "dishwasher", sku: "W11412291" },
    { category: /03 Electric dryer/, noun: "dryer", sku: "WE01M10007" },
    { category: /04 Refrigerator/, noun: "refrigerator", sku: "XWFE" },
  ];
  for (const item of cases) {
    await page.getByRole("button", { name: item.category }).click();
    await page.getByRole("button", { name: "See the full answer" }).click();
    await expect(
      page.getByRole("heading", { name: `This is the part for your ${item.noun}` }),
    ).toBeVisible();
    await expect(page.locator(".part-sku")).toHaveText(`Part #${item.sku}`);
    await expect(page.getByRole("link", { name: /Buy this part/ })).toHaveAttribute(
      "target",
      "_blank",
    );
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
  const input = page.getByRole("textbox", { name: "Washer model number" });
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
    page.getByRole("heading", { name: "This is the part for your washer" }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("stops instead of exposing more steps after a reported hazard", async ({ page }) => {
  await selectLg(page);
  await page.getByRole("button", { name: "Smoke or burning smell" }).click();
  await expect(
    page.getByRole("heading", { name: "A professional should continue." }),
  ).toBeVisible();
  await expect(page.getByText("Do not move the appliance or remove another panel.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Safe to continue" })).toHaveCount(0);
});

test("is keyboard reachable, touch sized, reduced-motion safe, and WCAG A/AA clean", async ({
  page,
}, testInfo) => {
  const example = page.getByRole("button", { name: "See the full answer" });
  await example.focus();
  await expect(example).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "This is the part for your washer" }),
  ).toBeVisible();
  const hoseComponent = page.getByRole("button", { name: "Show Drain hose" });
  await hoseComponent.focus();
  await page.keyboard.press("Enter");
  await expect(hoseComponent).toHaveAttribute("aria-pressed", "true");

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
