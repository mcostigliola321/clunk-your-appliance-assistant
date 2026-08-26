import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function selectLg(page: Page, query = "WM3400CW.ABWEVUS") {
  const input = page.getByRole("textbox", { name: "Model or complete product code" });
  await input.fill(query);
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("button", { name: /LG WM3400CW/ }).click();
}

async function reachFilterOutcome(page: Page, resultName: string) {
  await page.getByRole("button", { name: "Start safe diagnosis" }).click();
  await page.getByRole("button", { name: "Power disconnected; water is cool" }).click();
  await page.getByRole("button", { name: "Hose looks clear and correctly placed" }).click();
  await page.getByRole("button", { name: resultName }).click();
  await page.getByRole("button", { name: "Resolve the part outcome" }).click();
}

test("makes the source-backed scope and manual fallback immediately clear", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Tell it what's broken." })).toBeVisible();
  await expect(page.getByText("12 model families · 6 brands")).toBeVisible();
  await expect(page.getByText("Manual mode ready")).toBeVisible();
  await expect(
    page.getByText("Official support sources · deterministic safety · no login"),
  ).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("completes the no-part-needed blocked-filter path", async ({ page }) => {
  await selectLg(page);
  await reachFilterOutcome(page, "Debris was blocking the filter");

  await expect(page.getByRole("heading", { name: "Cleanable blockage found" })).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Likely causes" }).getByRole("listitem").first(),
  ).toContainText("Blocked pump filter");
  await expect(page.getByText("AHA75693425")).toHaveCount(0);
});

test("reveals an exact sourced part only for a complete verified code", async ({ page }) => {
  await selectLg(page);
  await reachFilterOutcome(page, "Filter and visible impeller area look clear");

  await expect(page.getByRole("heading", { name: "Exact part match" })).toBeVisible();
  await expect(page.getByText("AHA75693425")).toBeVisible();
  await expect(page.getByText("Professional only")).toBeVisible();
  await expect(page.getByRole("link", { name: /View LG evidence/ })).toBeVisible();
});

test("stops instead of exposing more steps after a reported hazard", async ({ page }) => {
  await selectLg(page, "WM3400CW");
  await page.getByRole("button", { name: "Start safe diagnosis" }).click();
  await page.getByRole("button", { name: "Smoke or burning smell" }).click();

  await expect(
    page.getByRole("heading", { name: "A professional should continue." }),
  ).toBeVisible();
  await expect(page.getByText("No further repair steps are available in this demo.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Power disconnected; water is cool" })).toHaveCount(
    0,
  );
});

test("keeps model selection and repair controls keyboard reachable and touch sized", async ({
  page,
}, testInfo) => {
  await selectLg(page);
  const start = page.getByRole("button", { name: "Start safe diagnosis" });
  await start.focus();
  await expect(start).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Make the washer safe" })).toBeVisible();

  const hoseComponent = page.getByRole("button", { name: "Drain hose", exact: true });
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

  await reachFilterOutcome(page, "Debris was blocking the filter");
  const resultState = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(resultState.violations).toEqual([]);
});
