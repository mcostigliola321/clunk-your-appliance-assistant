import { describe, expect, it } from "vitest";

import {
  APPLIANCE_JOURNEYS,
  getCatalogEntriesForSymptom,
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

  it("exposes four observable problem families per appliance without universalizing coverage", () => {
    for (const journey of APPLIANCE_JOURNEYS) {
      expect(getSupportedSymptoms(journey.id)).toHaveLength(4);
    }
    expect(getCatalogEntriesForSymptom("dryer", "not-heating").map((entry) => entry.id)).toEqual([
      "ge-gtd42easj2ww",
    ]);
    expect(getCatalogEntriesForSymptom("dryer", "door-will-not-close").length).toBeGreaterThan(1);
  });
});
