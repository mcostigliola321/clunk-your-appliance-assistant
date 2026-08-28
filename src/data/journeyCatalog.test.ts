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
        expect(entries.every((entry) => entry.supportedSymptom === symptomId)).toBe(true);
      }
    }
  });
});
