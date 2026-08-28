import { describe, expect, it } from "vitest";

import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";

import { createInitialRepairState, executeRepairTool } from "./engine";
import { assertCatalog, getRepairPack, REPAIR_PACKS } from "./repairPack";
import { getWebMcpTaskSnapshot } from "./selectors";

function modelCapability(entry: (typeof APPLIANCE_CATALOG)[number]) {
  return entry.symptomCoverage.some((coverage) => coverage.capability === "purchase-ready")
    ? "purchase-ready"
    : entry.symptomCoverage[0]!.capability;
}

function selectAndStart(applianceId: string, productCode?: string) {
  let state = createInitialRepairState("unavailable");
  state = executeRepairTool(
    state,
    "select_appliance",
    { applianceId, ...(productCode ? { productCode } : {}) },
    "human",
  ).state;
  return executeRepairTool(
    state,
    "start_diagnosis",
    { symptomId: getRepairPack(applianceId).symptom.id },
    "human",
  ).state;
}

function runWasherPath(
  productCode: string | undefined,
  filterResult: "filter-blocked" | "filter-clear",
) {
  let state = selectAndStart("lg-wm3400cw", productCode);
  state = executeRepairTool(
    state,
    "record_observation",
    { checkId: "safety-check", resultId: "safe-ready" },
    "human",
  ).state;
  state = executeRepairTool(
    state,
    "record_observation",
    { checkId: "inspect-drain-hose", resultId: "hose-clear" },
    "human",
  ).state;
  return executeRepairTool(
    state,
    "record_observation",
    { checkId: "inspect-filter", resultId: filterResult },
    "human",
  ).state;
}

function runExample(applianceId: string) {
  const pack = getRepairPack(applianceId);
  expect(pack.example).not.toBeNull();
  let state = createInitialRepairState("unavailable");
  state = executeRepairTool(
    state,
    "select_appliance",
    { applianceId, productCode: pack.example!.productCode },
    "example",
  ).state;
  state = executeRepairTool(
    state,
    "start_diagnosis",
    { symptomId: pack.symptom.id },
    "example",
  ).state;
  for (const observation of pack.example!.observations)
    state = executeRepairTool(state, "record_observation", observation, "example").state;
  return executeRepairTool(state, "find_compatible_part", {}, "example");
}

describe("source-backed multi-appliance repair engine", () => {
  it("validates 163 models and their many-to-many repair packs", () => {
    expect(assertCatalog(APPLIANCE_CATALOG)).toBe(APPLIANCE_CATALOG);
    expect(APPLIANCE_CATALOG).toHaveLength(163);
    expect(REPAIR_PACKS.size).toBe(175);
    expect(new Set(APPLIANCE_CATALOG.map((entry) => entry.kind))).toEqual(
      new Set(["washer", "dishwasher", "dryer", "refrigerator"]),
    );
    expect(APPLIANCE_CATALOG.filter((entry) => entry.kind === "washer")).toHaveLength(56);
    expect(APPLIANCE_CATALOG.filter((entry) => entry.kind === "dishwasher")).toHaveLength(33);
    expect(APPLIANCE_CATALOG.filter((entry) => entry.kind === "dryer")).toHaveLength(33);
    expect(APPLIANCE_CATALOG.filter((entry) => entry.kind === "refrigerator")).toHaveLength(41);
    expect(
      APPLIANCE_CATALOG.filter((entry) => modelCapability(entry) === "purchase-ready"),
    ).toHaveLength(25);
    expect(
      APPLIANCE_CATALOG.filter((entry) => modelCapability(entry) === "guided-checks"),
    ).toHaveLength(138);
    expect(
      APPLIANCE_CATALOG.filter((entry) => modelCapability(entry) === "verified-part-unavailable"),
    ).toHaveLength(0);
    expect(
      Object.fromEntries(
        (["washer", "dishwasher", "dryer", "refrigerator"] as const).map((kind) => [
          kind,
          {
            purchaseReady: APPLIANCE_CATALOG.filter(
              (entry) => entry.kind === kind && modelCapability(entry) === "purchase-ready",
            ).length,
            guided: APPLIANCE_CATALOG.filter(
              (entry) => entry.kind === kind && modelCapability(entry) === "guided-checks",
            ).length,
          },
        ]),
      ),
    ).toEqual({
      washer: { purchaseReady: 8, guided: 48 },
      dishwasher: { purchaseReady: 4, guided: 29 },
      dryer: { purchaseReady: 7, guided: 26 },
      refrigerator: { purchaseReady: 6, guided: 35 },
    });
    expect(new Set(APPLIANCE_CATALOG.map((entry) => entry.brand)).size).toBe(11);
    expect([...REPAIR_PACKS.values()].every((pack) => pack.schemaVersion === 6)).toBe(true);
  });

  it("reaches an exact seller link in every flagship example", () => {
    const flagships = [
      { applianceId: "ge-gfw550ssnww", sku: "WH11X39237" },
      { applianceId: "whirlpool-wdt750sakz1", sku: "W11412291" },
      { applianceId: "ge-gtd42easj2ww", sku: "WE01M10007" },
      { applianceId: "ge-gss25gypfs", sku: "XWFE" },
    ];
    for (const { applianceId, sku } of flagships) {
      const result = runExample(applianceId);
      expect(result.ok).toBe(true);
      expect(result.snapshot.partOutcome?.status).toBe("exact");
      expect(result.snapshot.selectedPart?.sku).toBe(sku);
      expect(result.snapshot.selectedPart?.commerce?.provider).toBe("shopify-global-catalog");
      expect(result.snapshot.selectedPart?.commerce?.exactSku).toBe(sku);
      expect(result.snapshot.selectedPart?.commerce?.lastVerified).toBe("2026-08-27");
      expect(result.snapshot.exampleMode).toBe(true);
    }
    expect(
      APPLIANCE_CATALOG.find((entry) => entry.id === "lg-wm3400cw")?.symptomCoverage.some(
        (coverage) => coverage.exactPartEvidence,
      ),
    ).toBe(false);
  });

  it("keeps every newly purchase-ready model on its separately evidenced exact code", () => {
    const upgraded = [
      ["ge-gfw655ssvww", "WH11X39237"],
      ["ge-gfw850spnrs", "WH11X39237"],
      ["ge-gtw335asnww", "WH23X28418"],
      ["hotpoint-htw265aswww", "WH23X28418"],
      ["whirlpool-wtw5010lw", "W11399437"],
      ["whirlpool-wdt730hamz", "W10876537"],
      ["maytag-mdb4949skz", "W11497943"],
      ["kitchenaid-kdfe204kps", "W11462456"],
      ["ge-gfd55essnww", "WE01X34600"],
      ["whirlpool-wed4815ew", "W11429587"],
      ["whirlpool-wed5050lw", "W11429587"],
      ["whirlpool-wrs588fihz", "EDR1RXD1"],
      ["kitchenaid-krfc300ess", "EDR4RXD1"],
    ] as const;

    for (const [applianceId, sku] of upgraded) {
      const result = runExample(applianceId);
      expect(result.ok, applianceId).toBe(true);
      expect(result.snapshot.partOutcome?.status, applianceId).toBe("exact");
      expect(result.snapshot.selectedPart?.sku, applianceId).toBe(sku);
      expect(
        result.snapshot.selectedPart?.commerce?.offerCountAtVerification,
        applianceId,
      ).toBeGreaterThan(0);
    }
  });

  it("returns no-part-needed when the washer filter is blocked", () => {
    const result = executeRepairTool(
      runWasherPath("WM3400CW.ABWEVUS", "filter-blocked"),
      "find_compatible_part",
      {},
      "agent",
    );
    expect(result.ok).toBe(true);
    expect(result.snapshot.partOutcome?.status).toBe("no-part-needed");
    expect(result.snapshot.likelyCauses[0]?.id).toBe("washer-filter");
  });

  it("reveals the washer pump only for a verified complete code", () => {
    let exactState = selectAndStart("ge-gfw550ssnww", "GFW550SSN0WW");
    exactState = executeRepairTool(exactState, "record_observation", {
      checkId: "safety-check",
      resultId: "safe-ready",
    }).state;
    exactState = executeRepairTool(exactState, "record_observation", {
      checkId: "inspect-drain-hose",
      resultId: "hose-clear",
    }).state;
    exactState = executeRepairTool(exactState, "record_observation", {
      checkId: "inspect-filter",
      resultId: "filter-clear",
    }).state;
    const exact = executeRepairTool(exactState, "find_compatible_part", {}, "agent");
    expect(exact.snapshot.partOutcome?.status).toBe("exact");
    expect(exact.snapshot.selectedPart?.sku).toBe("WH11X39237");
    const webMcpSnapshot = getWebMcpTaskSnapshot(exact.state);
    expect(webMcpSnapshot.task?.outcome?.part?.commerceHandoff).toMatchObject({
      provider: "Shopify Global Catalog",
      protocol: "UCP",
      exactSku: "WH11X39237",
      liveAvailability: true,
    });
    expect(webMcpSnapshot.task?.outcome?.part?.commerceHandoff?.rule).toContain(
      "Never substitute a nearby SKU",
    );
    expect(JSON.stringify(webMcpSnapshot).length).toBeLessThan(3000);
    const incomplete = executeRepairTool(
      runWasherPath(undefined, "filter-clear"),
      "find_compatible_part",
      {},
      "agent",
    );
    expect(incomplete.snapshot.partOutcome?.status).toBe("variant-needed");
  });

  it("keeps an active human-observation task compact for WebMCP", () => {
    const state = selectAndStart("ge-gtd42easj2ww", "GTD42EASJ2WW");
    const output = getWebMcpTaskSnapshot(state);
    expect(JSON.stringify(output).length).toBeLessThan(2300);
    expect(output.handoff).toBe("human-observation-required");
    expect(output.catalog.results).toEqual([]);
    expect(output.task?.currentCheck?.observations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ resultId: "safe-ready" }),
        expect.objectContaining({ resultId: "hazard-burning" }),
      ]),
    );
  });

  it("keeps broad catalog discovery bounded for WebMCP", () => {
    const state = executeRepairTool(createInitialRepairState(), "search_supported_appliances", {
      kind: "washer",
    }).state;
    const output = getWebMcpTaskSnapshot(state);
    expect(output.catalog.resultCount).toBe(56);
    expect(output.catalog.results).toHaveLength(4);
    expect(JSON.stringify(output).length).toBeLessThan(4000);
    expect(output.catalog.counts).toEqual({
      byKind: { washer: 56, dishwasher: 33, dryer: 33, refrigerator: 41 },
      byCapability: {
        "purchase-ready": 25,
        "guided-checks": 150,
        "verified-part-unavailable": 0,
      },
    });
  });

  it("keeps top-load models on the safe hose-only path", () => {
    const pack = getRepairPack("ge-gtw585bsvws");
    expect(pack.appliance.loadStyle).toBe("top-load");
    expect(pack.checks.map((check) => check.id)).toEqual(["safety-check", "inspect-drain-hose"]);
  });

  it("keeps expanded dishwasher and refrigerator access model-aware", () => {
    expect(getRepairPack("maytag-mdb4949skz").checks.map((check) => check.id)).toEqual([
      "safety-check",
      "inspect-drain-connection",
    ]);
    expect(getRepairPack("amana-adb1400agw").checks.map((check) => check.id)).toContain(
      "inspect-sump-filter",
    );
    const refrigerator = getRepairPack("amana-asi2175grs");
    expect(
      refrigerator.checks.find((check) => check.id === "inspect-water-filter")?.instruction,
    ).toContain("official model source");
    expect(JSON.stringify(refrigerator)).not.toContain("twist-in filter");
  });

  it("does not claim purchase readiness for guided-only models", () => {
    let state = selectAndStart("electrolux-elfw7637at");
    state = executeRepairTool(state, "record_observation", {
      checkId: "safety-check",
      resultId: "safe-ready",
    }).state;
    state = executeRepairTool(state, "record_observation", {
      checkId: "inspect-drain-hose",
      resultId: "hose-clear",
    }).state;
    const result = executeRepairTool(state, "find_compatible_part");
    expect(result.snapshot.partOutcome?.status).toBe("professional-only");
    expect(result.snapshot.selectedPart).toBeNull();
  });

  it("filters the shared catalog by category without substitution", () => {
    const dishwasher = executeRepairTool(
      createInitialRepairState(),
      "search_supported_appliances",
      { kind: "dishwasher", modelQuery: "WDT750" },
    );
    expect(dishwasher.snapshot.catalogResults.map((item) => item.id)).toEqual([
      "whirlpool-wdt750sakz1",
    ]);
    const missing = executeRepairTool(createInitialRepairState(), "search_supported_appliances", {
      kind: "dryer",
      modelQuery: "NOT-A-REAL-MATCH-999",
    });
    expect(missing.snapshot.catalogResults).toEqual([]);
    expect(missing.message).toContain("No supported model matches");
  });

  it("rejects serial labels and incomplete product codes before compatibility claims", () => {
    const serialSearch = executeRepairTool(
      createInitialRepairState(),
      "search_supported_appliances",
      { kind: "washer", modelQuery: "S/N: 0A12BC34" },
    );
    expect(serialSearch.ok).toBe(false);
    expect(serialSearch.message).toContain("serial number");

    const partialSelection = executeRepairTool(createInitialRepairState(), "select_appliance", {
      applianceId: "lg-wt7400cw",
      productCode: "WT7400CW",
    });
    expect(partialSelection.ok).toBe(false);
    expect(partialSelection.message).toContain("family code");

    const guidedSelection = executeRepairTool(createInitialRepairState(), "select_appliance", {
      applianceId: "amana-ntw4519jw",
    });
    expect(guidedSelection.ok).toBe(true);
    expect(guidedSelection.snapshot.verificationLabel).toBe("Washer model found");
  });

  it("rejects out-of-order observations and preserves deterministic activity", () => {
    const initial = createInitialRepairState();
    const rejected = executeRepairTool(initial, "record_observation", {
      checkId: "inspect-filter",
      resultId: "filter-clear",
    });
    expect(rejected.ok).toBe(false);
    const next = executeRepairTool(rejected.state, "get_repair_state");
    expect(next.state.activity.map((event) => event.id)).toEqual(["event-0", "event-1"]);
    expect(next.state).toBe(rejected.state);
  });
});
