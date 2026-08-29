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
    expect(getCatalogEntriesForSymptom("dryer", "not-heating")).toHaveLength(19);
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
      "washer:will-not-start": 39,
      "washer:will-not-spin": 39,
      "washer:is-leaking": 39,
      "dishwasher:will-not-drain": 33,
      "dishwasher:door-will-not-close": 20,
      "dishwasher:not-cleaning": 21,
      "dishwasher:will-not-fill": 21,
      "dishwasher:is-leaking": 21,
      "dryer:door-will-not-close": 33,
      "dryer:will-not-start": 19,
      "dryer:not-heating": 19,
      "dryer:drum-will-not-turn": 19,
      "refrigerator:slow-water-flow": 41,
      "refrigerator:door-will-not-close": 35,
      "refrigerator:not-cooling": 22,
      "refrigerator:is-leaking": 22,
      "refrigerator:ice-maker-not-making-ice": 22,
    });
  });
});
