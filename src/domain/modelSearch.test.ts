import { describe, expect, it } from "vitest";

import {
  analyzeModelQuery,
  isExplicitSerialNumber,
  normalizeModel,
  searchCatalog,
} from "./modelSearch";

describe("model-number search", () => {
  it("normalizes case and punctuation without losing exact-code status", () => {
    expect(normalizeModel(" shem-63w55n / 01 ")).toBe("SHEM63W55N01");
    const analysis = analyzeModelQuery("shem-63w55n / 01", "Bosch", "dishwasher");
    expect(analysis).toMatchObject({
      status: "exact-code",
      exactEntryId: "bosch-shem63w55n01",
      needsCompleteCode: false,
    });
  });

  it("offers partial suggestions but never treats them as an exact match", () => {
    const analysis = analyzeModelQuery("gtd42-easj", null, "dryer");
    expect(analysis.status).toBe("partial");
    expect(analysis.exactEntryId).toBeNull();
    expect(analysis.needsCompleteCode).toBe(true);
    expect(analysis.matches.map((entry) => entry.id)).toContain("ge-gtd42easj2ww");
  });

  it("surfaces variant ambiguity for a family code", () => {
    const analysis = analyzeModelQuery("WT7400CW", "LG", "washer");
    expect(analysis.status).toBe("exact-family");
    expect(analysis.variantAmbiguity).toBe(true);
    expect(analysis.candidateProductCodes).toEqual(["WT7400CW.ABWEUUS", "WT7400CW.ABWETUS"]);
  });

  it("rejects explicitly labeled serial values without guessing from their shape", () => {
    for (const value of ["Serial: 123ABC", "Serial Number 123ABC", "S/N: 123ABC", "SER: 123ABC"])
      expect(isExplicitSerialNumber(value)).toBe(true);
    expect(analyzeModelQuery("S/N: 123ABC", null, "washer").status).toBe("serial-number");
    expect(isExplicitSerialNumber("GTD42EASJ2WW")).toBe(false);
  });

  it("does not let longer unsupported text match a shorter catalog model", () => {
    expect(searchCatalog("GTD42EASJ2WW-UNRELATED-SERIAL-TEXT", null, "dryer")).toEqual([]);
    expect(analyzeModelQuery("not-a-real-model-999", null, "dryer").status).toBe("unsupported");
  });
});
