import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function selectLg(page: Page, query = "WM3400CW.ABWEVUS") {
  const input = page.getByRole("textbox", { name: "Model number" });
  await input.fill(query);
  await page.getByRole("button", { name: "Find it" }).click();
  await page.getByRole("button", { name: "LG WM3400CW Part match available" }).click();
}

async function reachFilterOutcome(page: Page, resultName: string) {
  await page.getByRole("button", { name: "Washer is unplugged and the water is cool" }).click();
  await page.getByRole("button", { name: "Hose looks clear" }).click();
  await page.getByRole("button", { name: resultName }).click();
}

test("makes the problem and complete part-finding demo immediately clear", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Your washer won't drain. Let's fix that." }),
  ).toBeVisible();
  await expect(page.getByText("19 washers supported")).toBeVisible();
  await expect(page.locator(".status-pill")).toContainText(/AI connected|Guided mode|Connecting/);
  await expect(page.getByText("Clear checks · real part links · no login")).toBeVisible();
  await expect(page.getByRole("button", { name: /See the complete answer/ })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("completes the no-part-needed blocked-filter path", async ({ page }) => {
  await selectLg(page);
  await reachFilterOutcome(page, "I found debris in the filter");

  await expect(page.getByRole("heading", { name: "You probably don't need a part" })).toBeVisible();
  await expect(page.locator(".part-sku")).toHaveCount(0);
});

test("reveals the part, location, price, and buy link without an extra resolve step", async ({
  page,
}) => {
  await page.getByRole("button", { name: /See the complete answer/ }).click();
  await reachFilterOutcome(page, "The filter looks clear");

  await expect(
    page.getByRole("heading", { name: "This is the part for your washer" }),
  ).toBeVisible();
  await expect(page.locator(".part-sku")).toHaveText("Part #AHA75693425");
  await expect(page.getByText("Lower front of the washer, behind the filter area")).toBeVisible();
  await expect(page.getByText("$123.95", { exact: true })).toBeVisible();
  await expect(page.getByText("In stock", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Buy this part" })).toHaveAttribute(
    "href",
    "https://encompass.com/item/12525362/LG/AHA75693425/",
  );
});

test("switches the repair bench and checks for a verified top-load model", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "Model number" });
  await input.fill("GTW585BSVWS");
  await page.getByRole("button", { name: "Find it" }).click();
  await page.getByRole("button", { name: /GE GTW585BSVWS/ }).click();

  await expect(
    page.locator('img[src="/assets/clunk-washer-top-load-topology-v2.png"]'),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Focus Wash basket" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Focus Tub outlet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Focus Drain filter" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Show me the checks" })).toBeVisible();
});

test("keeps the exact-part result inside a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await selectLg(page);
  await reachFilterOutcome(page, "The filter looks clear");

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
  await expect(page.getByText("Do not continue taking the washer apart.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Washer is unplugged and the water is cool" }),
  ).toHaveCount(0);
});

test("keeps model selection and repair controls keyboard reachable and touch sized", async ({
  page,
}, testInfo) => {
  const demo = page.getByRole("button", { name: /See the complete answer/ });
  await demo.focus();
  await expect(demo).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Make the washer safe" })).toBeVisible();

  const hoseComponent = page.getByRole("button", { name: "Focus Drain hose" });
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
});

test("honors reduced motion and has no detectable WCAG A or AA violations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await selectLg(page);
  const duration = await page
    .locator(".appliance-component")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(["0.00001s", "1e-05s"]).toContain(duration);

  const initialResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(initialResults.violations).toEqual([]);

  await reachFilterOutcome(page, "I found debris in the filter");
  const resultState = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(resultState.violations).toEqual([]);
});
