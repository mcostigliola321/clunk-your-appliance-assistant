import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

import { chromium, type BrowserContext, type Page } from "@playwright/test";
import { format } from "prettier";

import { APPLIANCE_CATALOG } from "../src/data/applianceCatalog";
import { getCatalogEntriesForSymptom } from "../src/data/journeyCatalog";

const LIVE_URL = process.env["CLUNK_LIVE_URL"] ?? "https://clunk-appliance-assistant.lovable.app";
const MAX_ATTEMPTS = Number(process.env["CLUNK_LIVE_ATTEMPTS"] ?? "5");
const RETRY_DELAY_MS = Number(process.env["CLUNK_LIVE_RETRY_DELAY_MS"] ?? "15000");
const REPORT_PATH = resolve(
  process.env["CLUNK_LIVE_REPORT_PATH"] ??
    "docs/research/demo-ready-2026-08-29/live-deployment-verification.json",
);

const delay = (milliseconds: number) =>
  new Promise<void>((resolveDelay) => setTimeout(resolveDelay, milliseconds));
const sha256 = (value: Buffer) => createHash("sha256").update(value).digest("hex");

function moduleAssetFromHtml(html: string): string {
  const match = html.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+\.js)["']/i);
  if (!match?.[1]) throw new Error("No production module asset was found in index.html.");
  return match[1];
}

async function verifyVisibleRoutes(page: Page) {
  const expected = {
    models: APPLIANCE_CATALOG.length,
    refrigeratorModels: APPLIANCE_CATALOG.filter((entry) => entry.kind === "refrigerator").length,
    refrigeratorCooling: getCatalogEntriesForSymptom("refrigerator", "not-cooling").length,
    refrigeratorLeak: getCatalogEntriesForSymptom("refrigerator", "is-leaking").length,
  };

  await page.goto(`${LIVE_URL}/?deployment-check=${Date.now()}`, {
    waitUntil: "networkidle",
    timeout: 45_000,
  });
  await page.getByText(`${expected.models} models across 4 types`, { exact: true }).waitFor();
  await page.getByRole("button", { name: /Choose Refrigerator/ }).click();
  await page
    .getByRole("button", { name: /Not cold enough/ })
    .getByText(`${expected.refrigeratorCooling} models`, { exact: false })
    .waitFor();
  await page
    .getByRole("button", { name: /Water is leaking/ })
    .getByText(`${expected.refrigeratorLeak} models`, { exact: false })
    .waitFor();

  await page.getByRole("button", { name: /Not cold enough/ }).click();
  const coolingSearch = page.getByRole("searchbox", { name: "Refrigerator model number" });
  await coolingSearch.fill("B36CT81ENS/07");
  await page.getByRole("button", { name: "Find model" }).click();
  await page
    .getByRole("button", { name: /B36CT81ENS\/07.*Safe checks available.*Choose this model/ })
    .waitFor();

  await page.goto(`${LIVE_URL}/?unsupported-route-check=${Date.now()}`, {
    waitUntil: "networkidle",
    timeout: 45_000,
  });
  await page.getByRole("button", { name: /Choose Refrigerator/ }).click();
  await page.getByRole("button", { name: /Water is leaking/ }).click();
  const leakSearch = page.getByRole("searchbox", { name: "Refrigerator model number" });
  await leakSearch.fill("B36CT81ENS/07");
  await page.getByText("That model is supported for a different problem.").waitFor();

  return expected;
}

async function verifyAssets(context: BrowserContext) {
  const localHtml = await readFile(resolve("dist/index.html"), "utf8");
  const localAssetPath = moduleAssetFromHtml(localHtml);
  const localAsset = await readFile(resolve("dist", localAssetPath.replace(/^\//, "")));

  const response = await context.request.get(`${LIVE_URL}/?asset-check=${Date.now()}`, {
    headers: { "cache-control": "no-cache", pragma: "no-cache" },
    timeout: 45_000,
  });
  if (!response.ok()) throw new Error(`Live index returned HTTP ${response.status()}.`);
  const liveHtml = await response.text();
  const liveAssetPath = moduleAssetFromHtml(liveHtml);
  const liveAssetUrl = new URL(liveAssetPath, LIVE_URL).toString();
  const liveAssetResponse = await context.request.get(
    `${liveAssetUrl}${liveAssetUrl.includes("?") ? "&" : "?"}asset-check=${Date.now()}`,
    { headers: { "cache-control": "no-cache", pragma: "no-cache" }, timeout: 45_000 },
  );
  if (!liveAssetResponse.ok())
    throw new Error(`Live JavaScript returned HTTP ${liveAssetResponse.status()}.`);
  const liveAsset = Buffer.from(await liveAssetResponse.body());
  const localDigest = sha256(localAsset);
  const liveDigest = sha256(liveAsset);
  if (basename(liveAssetPath) !== basename(localAssetPath) || liveDigest !== localDigest)
    throw new Error(
      `Deployment asset mismatch: local ${basename(localAssetPath)} ${localDigest}, live ${basename(liveAssetPath)} ${liveDigest}.`,
    );
  return {
    localAsset: basename(localAssetPath),
    liveAsset: basename(liveAssetPath),
    sha256: localDigest,
    bytes: localAsset.byteLength,
  };
}

const browser = await chromium.launch({ headless: true });
let lastError: unknown;
try {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const context = await browser.newContext({
      serviceWorkers: "block",
      extraHTTPHeaders: { "cache-control": "no-cache", pragma: "no-cache" },
    });
    try {
      const page = await context.newPage();
      const visibleCounts = await verifyVisibleRoutes(page);
      const asset = await verifyAssets(context);
      const report = {
        schemaVersion: 1,
        verifiedAt: new Date().toISOString(),
        liveUrl: LIVE_URL,
        attempt,
        freshBrowserContext: true,
        visibleCounts,
        routes: {
          supported: "Bosch B36CT81ENS/07 × not cooling",
          unsupported: "Bosch B36CT81ENS/07 × water leaking",
        },
        asset,
      };
      await mkdir(dirname(REPORT_PATH), { recursive: true });
      await writeFile(
        REPORT_PATH,
        await format(JSON.stringify(report), { parser: "json", printWidth: 100 }),
      );
      console.log(JSON.stringify(report, null, 2));
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      console.error(
        `Live verification attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (attempt < MAX_ATTEMPTS) await delay(RETRY_DELAY_MS);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (lastError) throw lastError;
