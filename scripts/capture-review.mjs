import { chromium } from "@playwright/test";

const baseURL = process.env.CLUNK_REVIEW_URL ?? "http://127.0.0.1:5173";
const output = ".impeccable/review";
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

async function mockShopify(page) {
  await page.route("https://catalog.shopify.com/**", async (route) => {
    const request = route.request().postDataJSON();
    const query = request?.params?.arguments?.catalog?.query ?? "";
    const sku = knownSkus.find((candidate) => query.includes(candidate)) ?? "WE01M10007";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          structuredContent: {
            products: [
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
}

async function mockPromotedShopify(page) {
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
                id: "promoted-WE01M10007",
                title: "Exact promoted dryer strike WE01M10007",
                variants: [
                  {
                    id: "promoted-variant-WE01M10007",
                    sku: "WE01M10007",
                    price: { amount: 1899, currency: "USD" },
                    url: "https://merchant.example/products/strike?variant=42&utm_source=shopify&utm_medium=catalog&shclid=review_1&shdid=developer_9",
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
}

async function openPage(browser, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  await mockShopify(page);
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

async function settleImages(page) {
  await page
    .locator("img")
    .evaluateAll((images) =>
      Promise.all(
        images.map((image) =>
          image.complete ? Promise.resolve() : image.decode().catch(() => undefined),
        ),
      ),
    );
}

async function reachModelSearch(page, applianceName, symptomName) {
  await page.getByRole("button", { name: applianceName }).click();
  await page.getByRole("button", { name: symptomName }).click();
}

async function selectExactDryer(page) {
  await reachModelSearch(page, /Choose Electric dryer/, /Supported now Door won't close/);
  const input = page.getByRole("searchbox", { name: "Electric dryer model number" });
  await input.fill("GTD42EASJ2WW");
  await page.getByRole("button", { name: "Find model" }).click();
  await page.getByRole("button", { name: /GE GTD42EASJ2WW Purchase-ready/ }).click();
}

async function openCompletedExamples(page) {
  await page.getByText("See how Clunk works", { exact: true }).click();
}

const browser = await chromium.launch();

try {
  {
    const { context, page } = await openPage(browser, { width: 1440, height: 1000 });
    await settleImages(page);
    await page.screenshot({ path: `${output}/first-viewport-desktop.png` });
    await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
    await context.close();
  }

  {
    const { context, page } = await openPage(browser, { width: 1440, height: 1000 });
    await page.getByRole("button", { name: /Choose Washer/ }).click();
    await settleImages(page);
    await page.screenshot({ path: `${output}/symptom-selection-desktop.png` });
    await context.close();
  }

  {
    const { context, page } = await openPage(browser, { width: 390, height: 844 });
    await settleImages(page);
    await page.screenshot({ path: `${output}/first-viewport-mobile.png` });
    await page.screenshot({ path: `${output}/mobile.png`, fullPage: true });
    await context.close();
  }

  {
    const { context, page } = await openPage(browser, { width: 390, height: 844 });
    await page.getByRole("button", { name: /Choose Electric dryer/ }).click();
    await settleImages(page);
    await page.screenshot({ path: `${output}/symptom-selection-mobile.png`, fullPage: true });
    await context.close();
  }

  {
    const { context, page } = await openPage(browser, { width: 1440, height: 1000 });
    await selectExactDryer(page);
    await page.getByRole("heading", { name: "Unplug the dryer" }).waitFor();
    await settleImages(page);
    await page.screenshot({ path: `${output}/active-diagnosis-desktop.png` });
    await context.close();
  }

  {
    const { context, page } = await openPage(browser, { width: 320, height: 800 });
    await openCompletedExamples(page);
    await page.getByRole("button", { name: "See completed dryer example" }).click();
    await page.getByRole("link", { name: /Open UCP Parts cart for part WE01M10007/ }).waitFor();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${output}/exact-result-mobile.png` });
    await page
      .locator(".part-result")
      .screenshot({ path: `${output}/exact-result-mobile-card.png` });
    await context.close();
  }

  {
    const { context, page } = await openPage(browser, { width: 1063, height: 800 });
    await openCompletedExamples(page);
    await page.getByRole("button", { name: "See completed dryer example" }).click();
    await page.getByText("Genuine Replacement Parts").waitFor();
    await settleImages(page);
    await page.screenshot({ path: `${output}/exact-result-intermediate-desktop.png` });
    await page
      .locator(".part-result")
      .screenshot({ path: `${output}/exact-result-intermediate-card.png` });
    await context.close();
  }

  {
    const { context, page } = await openPage(browser, { width: 1440, height: 1000 });
    await mockPromotedShopify(page);
    await openCompletedExamples(page);
    await page.getByRole("button", { name: "See completed dryer example" }).click();
    await page.getByText("Promoted · paid placement").waitFor();
    await page.locator(".part-result").screenshot({ path: `${output}/promoted-result-card.png` });
    await context.close();
  }

  {
    const { context, page } = await openPage(browser, { width: 1440, height: 1000 });
    await reachModelSearch(page, /Choose Washer/, /Supported now Won't drain/);
    const input = page.getByRole("searchbox", { name: "Washer model number" });
    await input.fill("WM3400CW.ABWEVUS");
    await page.getByRole("button", { name: "Find model" }).click();
    await page.getByRole("button", { name: /LG WM3400CW Guided checks only/ }).click();
    await page.getByRole("heading", { name: "Make the washer safe" }).waitFor();
    await settleImages(page);
    await page.screenshot({ path: `${output}/guided-checks-desktop.png` });
    await context.close();
  }

  {
    const { context, page } = await openPage(browser, { width: 1440, height: 1000 });
    await reachModelSearch(page, /Choose Washer/, /Supported now Water is leaking/);
    await page.getByRole("searchbox", { name: "Washer model number" }).fill("MVW7232HW");
    await page.getByText("That model is supported for a different problem.").waitFor();
    await page.screenshot({ path: `${output}/unsupported-model-symptom-desktop.png` });
    await context.close();
  }

  {
    const { context, page } = await openPage(browser, { width: 390, height: 844 });
    await selectExactDryer(page);
    await page.getByRole("button", { name: "Smoke or burning smell" }).click();
    await page.getByRole("heading", { name: "A professional should continue." }).waitFor();
    await page.screenshot({ path: `${output}/safety-stop-mobile.png` });
    await context.close();
  }
} finally {
  await browser.close();
}
