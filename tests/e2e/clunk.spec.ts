import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("makes the purpose and manual fallback immediately clear", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Tell it what's broken." })).toBeVisible();
  await expect(page.getByText("Washer will not drain")).toBeVisible();
  await expect(page.getByText("Manual mode ready")).toBeVisible();
  await expect(page.getByText("Fictional demo · WM-01")).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("completes the canonical blocked-filter diagnosis", async ({ page }) => {
  await page.getByRole("button", { name: "Diagnose this washer" }).click();
  await page.getByRole("button", { name: "Power is disconnected" }).click();
  await page.getByRole("button", { name: "The visible hose looks clear" }).click();
  await page.getByRole("button", { name: "The filter is blocked by debris" }).click();
  await page.getByRole("button", { name: "Find the matching part" }).click();

  await expect(page.getByRole("heading", { name: "Pump filter cartridge" })).toBeVisible();
  await expect(page.getByText("CL-PF-220", { exact: true })).toBeVisible();
  await expect(page.getByText("Diagnosis in progress · 100%")).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Likely causes" }).getByRole("listitem").first(),
  ).toContainText("Blocked pump filter");
});

test("stops instead of exposing more steps after a hazard", async ({ page }) => {
  await page.getByRole("button", { name: "Start diagnosis" }).click();
  await page.getByRole("button", { name: "There is a burning smell or smoke" }).click();

  await expect(
    page.getByRole("heading", { name: "A professional should continue." }),
  ).toBeVisible();
  await expect(page.getByText("No further repair steps are available in this demo.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Power is disconnected" })).toHaveCount(0);
});

test("keeps interactive controls keyboard reachable and touch sized", async ({
  page,
}, testInfo) => {
  await page.getByRole("button", { name: "Diagnose this washer" }).focus();
  await expect(page.getByRole("button", { name: "Diagnose this washer" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Make the washer safe" })).toBeVisible();

  const hoseComponent = page.getByRole("button", { name: "Drain hose" });
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

test("honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const duration = await page
    .locator(".appliance-component")
    .first()
    .evaluate((element) => {
      return getComputedStyle(element).transitionDuration;
    });
  expect(["0.00001s", "1e-05s"]).toContain(duration);
});

test("has no detectable WCAG A or AA violations in the primary state", async ({ page }) => {
  const initialResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(initialResults.violations).toEqual([]);

  await page.getByRole("button", { name: "Diagnose this washer" }).click();
  await page.getByRole("button", { name: "Power is disconnected" }).click();
  await page.getByRole("button", { name: "The visible hose looks clear" }).click();
  await page.getByRole("button", { name: "The filter is blocked by debris" }).click();
  await page.getByRole("button", { name: "Find the matching part" }).click();

  const resultState = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(resultState.violations).toEqual([]);
});
