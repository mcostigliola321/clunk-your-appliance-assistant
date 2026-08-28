import { describe, expect, it } from "vitest";

import { getRepairPack, assertCatalog } from "@/domain/repairPack";

import { APPLIANCE_CATALOG } from "./applianceCatalog";
import expansionData from "./catalogExpansion.json";
import {
  assertCatalogExpansionData,
  CATALOG_EXPANSION,
  CATALOG_EXPANSION_MODEL_COUNT,
  CATALOG_EXPANSION_RETRIEVED_ON,
} from "./catalogExpansion";

function modelCapability(entry: (typeof APPLIANCE_CATALOG)[number]) {
  return entry.symptomCoverage.some((coverage) => coverage.capability === "purchase-ready")
    ? "purchase-ready"
    : "guided-checks";
}

function defaultCoverage(entry: (typeof APPLIANCE_CATALOG)[number]) {
  return entry.symptomCoverage[0]!;
}

describe("source-backed catalog expansion", () => {
  it("adds 113 source-backed families with 13 exact-revision purchase paths", () => {
    expect(CATALOG_EXPANSION_MODEL_COUNT).toBe(113);
    expect(CATALOG_EXPANSION_RETRIEVED_ON).toBe("2026-08-27");
    expect(
      Object.fromEntries(
        (["washer", "dishwasher", "dryer", "refrigerator"] as const).map((kind) => [
          kind,
          CATALOG_EXPANSION.filter((entry) => entry.kind === kind).length,
        ]),
      ),
    ).toEqual({ washer: 33, dishwasher: 24, dryer: 24, refrigerator: 32 });

    expect(
      CATALOG_EXPANSION.filter((entry) => modelCapability(entry) === "purchase-ready"),
    ).toHaveLength(13);
    expect(
      CATALOG_EXPANSION.filter((entry) => modelCapability(entry) === "guided-checks"),
    ).toHaveLength(100);

    const activatedIds = new Set(
      expansionData.models
        .filter((model) => model.retrievedOn === "2026-08-28")
        .map((model) => model.id),
    );

    for (const entry of CATALOG_EXPANSION) {
      const coverage = defaultCoverage(entry);
      const exactPart = coverage.exactPartEvidence?.part;
      expect(entry.aliases).toContain(entry.model);
      expect(entry.topology).toBeTruthy();
      expect(entry.productCodePrompt.length).toBeGreaterThan(20);
      expect(entry.modelSource.kind).toBe("manufacturer-model");
      expect(entry.modelSource.url).toMatch(/^https:\/\//);
      expect(entry.modelSource.lastVerified).toBe(
        activatedIds.has(entry.id) ? "2026-08-28" : "2026-08-27",
      );
      expect(coverage.troubleshootingSources.length).toBeGreaterThan(0);
      expect(
        coverage.troubleshootingSources.every((source) => source.lastVerified === "2026-08-27"),
      ).toBe(true);
      if (exactPart) {
        expect(coverage.capability).toBe("purchase-ready");
        expect(exactPart.compatibleProductCodes).toEqual(entry.verifiedProductCodes);
        expect(exactPart.compatibleProductCodes).toHaveLength(1);
        expect(exactPart.source.lastVerified).toBe("2026-08-27");
        expect(exactPart.commerce).toMatchObject({
          provider: "shopify-global-catalog",
          protocol: "UCP",
          exactSku: exactPart.sku,
          lastVerified: "2026-08-27",
        });
        expect(exactPart.commerce?.offerCountAtVerification).toBeGreaterThan(0);
      } else {
        expect(coverage.capability).toBe("guided-checks");
      }
    }

    expect(
      Object.fromEntries(
        (["washer", "dishwasher", "dryer", "refrigerator"] as const).map((kind) => [
          kind,
          CATALOG_EXPANSION.filter((entry) => activatedIds.has(entry.id) && entry.kind === kind)
            .length,
        ]),
      ),
    ).toEqual({ washer: 8, dishwasher: 8, dryer: 8, refrigerator: 8 });
  });

  it("keeps complete revision codes isolated and all new dishwashers on the conservative path", () => {
    const exactCodes = CATALOG_EXPANSION.flatMap((entry) => entry.verifiedProductCodes);
    expect(new Set(exactCodes).size).toBe(exactCodes.length);

    for (const entry of CATALOG_EXPANSION.filter((item) => item.kind === "dishwasher")) {
      expect(getRepairPack(entry.id).checks.map((check) => check.id)).toEqual([
        "safety-check",
        "inspect-drain-connection",
      ]);
    }
    expect(getRepairPack("bosch-wtg86403uc01").appliance.topology).toBe(
      "compact-ventless-electric-dryer",
    );
  });

  it("preserves all 25 separately evidenced purchase-ready revisions", () => {
    const exactRevisions = APPLIANCE_CATALOG.flatMap((entry) =>
      entry.symptomCoverage.flatMap((coverage) => {
        const part = coverage.exactPartEvidence?.part;
        return part ? [{ id: entry.id, codes: part.compatibleProductCodes, sku: part.sku }] : [];
      }),
    ).sort((left, right) => left.id.localeCompare(right.id));

    expect(exactRevisions).toEqual(
      [
        { id: "amana-ned4655ew", codes: ["NED4655EW1"], sku: "W11429587" },
        { id: "ge-gfd55essnww", codes: ["GFD55ESSN0WW"], sku: "WE01X34600" },
        { id: "ge-gfw550ssnww", codes: ["GFW550SSN0WW"], sku: "WH11X39237" },
        { id: "ge-gfw655ssvww", codes: ["GFW655SSV0WW"], sku: "WH11X39237" },
        { id: "ge-gfw850spnrs", codes: ["GFW850SPN0RS"], sku: "WH11X39237" },
        { id: "ge-gss25gypfs", codes: ["GSS25GYPFS"], sku: "XWFE" },
        { id: "ge-gtd42easj2ww", codes: ["GTD42EASJ2WW"], sku: "WE01M10007" },
        { id: "ge-gtw335asnww", codes: ["GTW335ASN1WW"], sku: "WH23X28418" },
        { id: "hotpoint-htw265aswww", codes: ["HTW265ASW0WW"], sku: "WH23X28418" },
        { id: "kitchenaid-kdfe204kps", codes: ["KDFE204KPS0"], sku: "W11462456" },
        { id: "kitchenaid-krfc300ess", codes: ["KRFC300ESS08"], sku: "EDR4RXD1" },
        { id: "lg-lrflc2706s", codes: ["LRFLC2706S.ASTCNA0"], sku: "LT1000P" },
        { id: "maytag-mdb4949skz", codes: ["MDB4949SKZ1"], sku: "W11497943" },
        { id: "maytag-med4500mw", codes: ["MED4500MW0"], sku: "W11429587" },
        { id: "samsung-rf28t5001sr", codes: ["RF28T5001SR/AA"], sku: "DA97-17376B" },
        { id: "samsung-wf45b6300aw", codes: ["WF45B6300AW/US"], sku: "DC97-20621A" },
        { id: "samsung-wf45t6000aw", codes: ["WF45T6000AW/A5"], sku: "DC97-20621A" },
        { id: "whirlpool-wdt730hamz", codes: ["WDT730HAMZ0"], sku: "W10876537" },
        { id: "whirlpool-wdt750sakz1", codes: ["WDT750SAKZ1"], sku: "W11412291" },
        { id: "whirlpool-wed4815ew", codes: ["WED4815EW1"], sku: "W11429587" },
        { id: "whirlpool-wed4950hw", codes: ["WED4950HW0"], sku: "279570" },
        { id: "whirlpool-wed5050lw", codes: ["WED5050LW0"], sku: "W11429587" },
        { id: "whirlpool-wrs315sdhz", codes: ["WRS315SDHZ08"], sku: "EDR1RXD1" },
        { id: "whirlpool-wrs588fihz", codes: ["WRS588FIHZ00"], sku: "EDR1RXD1" },
        { id: "whirlpool-wtw5010lw", codes: ["WTW5010LW0"], sku: "W11399437" },
      ].sort((left, right) => left.id.localeCompare(right.id)),
    );
  });

  it("rejects tier inflation, revision carryover, and non-manufacturer model sources", () => {
    const guidedEntry = CATALOG_EXPANSION.find(
      (entry) => modelCapability(entry) === "guided-checks",
    )!;
    expect(() =>
      assertCatalog([
        {
          ...guidedEntry,
          symptomCoverage: [{ ...defaultCoverage(guidedEntry), capability: "purchase-ready" }],
        },
      ]),
    ).toThrow("inconsistent capability tier");
    expect(() =>
      assertCatalog([
        {
          ...guidedEntry,
          modelSource: { ...guidedEntry.modelSource, url: "https://merchant.example/model" },
        },
      ]),
    ).toThrow("non-manufacturer model source");

    const exactEntry = CATALOG_EXPANSION.find((entry) => entry.id === "kitchenaid-kdfe204kps")!;
    const exactCoverage = defaultCoverage(exactEntry);
    const exactPart = exactCoverage.exactPartEvidence!.part;
    expect(() =>
      assertCatalog([
        {
          ...exactEntry,
          aliases: [...exactEntry.aliases, "KDFE204KPS1"],
          verifiedProductCodes: ["KDFE204KPS1"],
          symptomCoverage: [
            {
              ...exactCoverage,
              exactPartEvidence: {
                verifiedProductCodes: ["KDFE204KPS1"],
                part: {
                  ...exactPart,
                  compatibleProductCodes: ["KDFE204KPS1"],
                  compatibleModel: "KitchenAid KDFE204KPS1",
                },
              },
            },
          ],
        },
      ]),
    ).toThrow("inexact revision evidence");
  });

  it("leaves ambiguous neighboring revisions and multi-part pages guided-only", () => {
    const guidedOnly = [
      "samsung-wf46bg6500av",
      "lg-wm3600hwa",
      "maytag-mss25c4mgz",
      "amana-asi2575grs",
      "bosch-b36ct80sns01",
    ];
    for (const id of guidedOnly) {
      const entry = CATALOG_EXPANSION.find((candidate) => candidate.id === id);
      expect(entry, id).toBeDefined();
      expect(modelCapability(entry!), id).toBe("guided-checks");
      expect(
        entry?.symptomCoverage.some((coverage) => coverage.exactPartEvidence),
        id,
      ).toBe(false);
    }
  });

  it("rejects raw expansion revision carryover and zero-offer tier inflation", () => {
    const siblingCarryover = structuredClone(expansionData);
    const sibling = siblingCarryover.models.find((entry) => entry.id === "kitchenaid-kdfe204kps")!;
    sibling.aliases.push("KDFE204KPS1");
    sibling.verifiedProductCodes = ["KDFE204KPS1"];
    sibling.exactPart!.compatibleProductCodes = ["KDFE204KPS1"];
    sibling.exactPart!.compatibleModel = "KitchenAid KDFE204KPS1";
    expect(() => assertCatalogExpansionData(siblingCarryover as never)).toThrow(
      "inexact revision evidence",
    );

    const inflated = structuredClone(expansionData);
    const exact = inflated.models.find((entry) => entry.id === "whirlpool-wdt730hamz")!;
    exact.exactPart!.commerce.offerCountAtVerification = 0;
    expect(() => assertCatalogExpansionData(inflated as never)).toThrow(
      "invalid exact-SKU UCP audit",
    );
  });
});
