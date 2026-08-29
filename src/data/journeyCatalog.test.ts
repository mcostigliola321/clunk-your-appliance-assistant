import { describe, expect, it } from "vitest";

import {
  APPLIANCE_JOURNEYS,
  getCatalogEntriesForSymptom,
  getMoreSymptoms,
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

  it("keeps four prominent consumer choices and a neutral more-problems overflow", () => {
    expect(
      Object.fromEntries(
        APPLIANCE_JOURNEYS.map((journey) => [journey.id, getPrimarySymptoms(journey.id)]),
      ),
    ).toEqual({
      washer: ["will-not-drain", "will-not-start", "will-not-spin", "is-leaking"],
      dishwasher: ["will-not-drain", "not-cleaning", "will-not-fill", "is-leaking"],
      dryer: ["door-will-not-close", "will-not-start", "not-heating", "drum-will-not-turn"],
      refrigerator: ["slow-water-flow", "not-cooling", "is-leaking", "ice-maker-not-making-ice"],
    });
    expect(getMoreSymptoms("washer")).toEqual(["door-will-not-close"]);
    expect(getMoreSymptoms("dishwasher")).toEqual(["door-will-not-close"]);
    expect(getMoreSymptoms("dryer")).toEqual([]);
    expect(getMoreSymptoms("refrigerator")).toEqual(["door-will-not-close"]);
    expect(getSupportedSymptoms("washer")).toHaveLength(5);
    expect(getSupportedSymptoms("dishwasher")).toHaveLength(5);
    expect(getSupportedSymptoms("dryer")).toHaveLength(4);
    expect(getSupportedSymptoms("refrigerator")).toHaveLength(5);
    expect(getCatalogEntriesForSymptom("dryer", "not-heating")).toHaveLength(33);
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
      "washer:door-will-not-close": 53,
      "washer:will-not-start": 55,
      "washer:will-not-spin": 55,
      "washer:is-leaking": 55,
      "dishwasher:will-not-drain": 33,
      "dishwasher:door-will-not-close": 33,
      "dishwasher:not-cleaning": 33,
      "dishwasher:will-not-fill": 33,
      "dishwasher:is-leaking": 33,
      "dryer:door-will-not-close": 33,
      "dryer:will-not-start": 33,
      "dryer:not-heating": 33,
      "dryer:drum-will-not-turn": 33,
      "refrigerator:slow-water-flow": 41,
      "refrigerator:door-will-not-close": 41,
      "refrigerator:not-cooling": 41,
      "refrigerator:is-leaking": 36,
      "refrigerator:ice-maker-not-making-ice": 36,
    });
  });
});
