import { describe, expect, it } from "vitest";

import {
  APPLIANCE_JOURNEYS,
  getCatalogEntriesForSymptom,
  getLimitedSymptoms,
  getPrimarySymptoms,
  getSupportedSymptoms,
} from "./journeyCatalog";

describe("visual journey catalog", () => {
  it("keeps every appliance and supported symptom route structurally separate", () => {
    for (const journey of APPLIANCE_JOURNEYS) {
      for (const symptomId of getSupportedSymptoms(journey.id)) {
        const entries = getCatalogEntriesForSymptom(journey.id, symptomId);
        expect(entries.length).toBeGreaterThan(0);
        expect(entries.every((entry) => entry.kind === journey.id)).toBe(true);
        expect(
          entries.every((entry) =>
            entry.symptomCoverage.some((coverage) => coverage.symptomId === symptomId),
          ),
        ).toBe(true);
      }
    }
  });

  it("separates broad problem guides from one-model pilots without universalizing coverage", () => {
    expect(
      Object.fromEntries(
        APPLIANCE_JOURNEYS.map((journey) => [journey.id, getPrimarySymptoms(journey.id)]),
      ),
    ).toEqual({
      washer: ["will-not-drain", "door-will-not-close"],
      dishwasher: ["will-not-drain", "door-will-not-close"],
      dryer: ["door-will-not-close"],
      refrigerator: ["slow-water-flow", "door-will-not-close"],
    });
    expect(getLimitedSymptoms("washer")).toEqual(["will-not-start", "will-not-spin", "is-leaking"]);
    expect(getLimitedSymptoms("dishwasher")).toEqual([
      "not-cleaning",
      "will-not-fill",
      "is-leaking",
    ]);
    expect(getLimitedSymptoms("dryer")).toEqual([
      "will-not-start",
      "not-heating",
      "drum-will-not-turn",
    ]);
    expect(getLimitedSymptoms("refrigerator")).toEqual([
      "not-cooling",
      "is-leaking",
      "ice-maker-not-making-ice",
    ]);
    expect(getSupportedSymptoms("washer")).toHaveLength(5);
    expect(getSupportedSymptoms("dishwasher")).toHaveLength(5);
    expect(getSupportedSymptoms("dryer")).toHaveLength(4);
    expect(getSupportedSymptoms("refrigerator")).toHaveLength(5);
    expect(getCatalogEntriesForSymptom("dryer", "not-heating").map((entry) => entry.id)).toEqual([
      "ge-gtd42easj2ww",
    ]);
    expect(getCatalogEntriesForSymptom("dryer", "door-will-not-close").length).toBeGreaterThan(1);
  });

  it("locks the exact per-category symptom coverage denominator", () => {
    expect(
      Object.fromEntries(
        APPLIANCE_JOURNEYS.flatMap((journey) =>
          getSupportedSymptoms(journey.id).map((symptomId) => [
            `${journey.id}:${symptomId}`,
            getCatalogEntriesForSymptom(journey.id, symptomId).length,
          ]),
        ),
      ),
    ).toEqual({
      "washer:will-not-drain": 56,
      "washer:door-will-not-close": 36,
      "washer:will-not-start": 1,
      "washer:will-not-spin": 1,
      "washer:is-leaking": 1,
      "dishwasher:will-not-drain": 33,
      "dishwasher:door-will-not-close": 20,
      "dishwasher:not-cleaning": 1,
      "dishwasher:will-not-fill": 1,
      "dishwasher:is-leaking": 1,
      "dryer:door-will-not-close": 33,
      "dryer:will-not-start": 1,
      "dryer:not-heating": 1,
      "dryer:drum-will-not-turn": 1,
      "refrigerator:slow-water-flow": 41,
      "refrigerator:door-will-not-close": 35,
      "refrigerator:not-cooling": 1,
      "refrigerator:is-leaking": 1,
      "refrigerator:ice-maker-not-making-ice": 1,
    });
  });
});
