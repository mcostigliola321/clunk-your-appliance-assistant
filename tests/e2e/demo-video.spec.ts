import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("demo is optional, keyboard accessible, and stops when its parent closes", async ({
  page,
}) => {
  const embedRequests: string[] = [];
  await page.route("https://www.youtube-nocookie.com/**", async (route) => {
    embedRequests.push(route.request().url());
    await route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html lang="en"><head><title>Demo player fixture</title></head><body><main><h1>Demo player fixture</h1></main></body></html>',
    });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "What are you fixing?" })).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(embedRequests).toEqual([]);

  const story = page.locator(".protocol-disclosure > summary");
  await story.focus();
  await page.keyboard.press("Enter");
  const toggle = page.getByRole("button", { name: "Watch the 2:30 demo" });
  await expect(toggle).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(embedRequests).toEqual([]);
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");

  const player = page.getByTitle(/Clunk demo:/);
  await expect(player).toBeVisible();
  await expect.poll(() => embedRequests.length).toBe(1);
  expect(new URL(embedRequests[0]!).searchParams.get("autoplay")).toBe("0");
  const accessibility = await new AxeBuilder({ page }).include(".demo-video").analyze();
  expect(accessibility.violations).toEqual([]);

  await page.getByRole("button", { name: "Close demo" }).click();
  await expect(player).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await toggle.click();
  await expect(player).toBeVisible();
  const inspector = page.locator(".protocol-inspector > summary");
  await inspector.click();
  await inspector.click();
  await expect(player).toBeVisible();
  await story.click();
  await expect(player).toHaveCount(0);
  await story.click();
  await expect(toggle).toBeVisible();
  await expect(player).toHaveCount(0);

  await page.getByRole("button", { name: /Choose Electric dryer/ }).click();
  await expect(page.getByRole("heading", { name: "What is it doing?" })).toBeFocused();
  await page.getByRole("button", { name: /Door won't close/ }).click();
  await expect(page.getByRole("searchbox", { name: "Electric dryer model number" })).toBeFocused();
});

test("demo fits 320px and keeps a direct fallback when the player is blocked", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
  await page.goto("/");
  await page.locator(".protocol-disclosure > summary").click();
  const toggle = page.getByRole("button", { name: "Watch the 2:30 demo" });
  expect((await toggle.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await toggle.click();
  const player = page.getByTitle(/Clunk demo:/);
  const bounds = (await player.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(bounds.height).toBeGreaterThanOrEqual(200);
  const fallback = page.getByRole("link", { name: /Open on YouTube/ });
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute("href", "https://youtu.be/9eQbt7B8rQs");
  expect((await fallback.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.getByRole("button", { name: "Close demo" }).click();
  await expect(player).toHaveCount(0);
});
