import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function selectLg(page: Page, query = "WM3400CW.ABWEVUS") {
  await page.getByRole("button", { name: /01 Washer/ }).click();
  const input = page.getByRole("textbox", { name: "Washer model number" });
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
    page.getByRole("heading", { name: "This is the part for your dryer" }),
  ).toBeVisible();
  await expect(page.locator(".part-sku")).toHaveText("Part #WE01M10007");
  await expect(page.getByText("$6.90", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Buy this part/ })).toHaveAttribute(
    "href",
    "https://www.geapplianceparts.com/store/parts/ModelSectionParts/GTD42EASJ2WW/2/0/0/0/FRONT_PANEL_%26_DOOR",
  );
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
  await page.getByRole("button", { name: /01 Washer/ }).click();
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
    page.getByRole("heading", { name: "This is the part for your dryer" }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("stops instead of exposing more steps after a reported hazard", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "Electric dryer model number" });
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
  const input = page.getByRole("textbox", { name: "Electric dryer model number" });
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
  await expect(page.getByText("Available to add to cart", { exact: true })).toBeVisible();
  await expect(page.getByText(/Price and availability were checked 2026-08-27/)).toBeVisible();
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
