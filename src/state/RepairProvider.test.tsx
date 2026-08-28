import { describe, expect, it } from "vitest";

import { createInitialRepairState, executeRepairTool } from "@/domain/engine";

import { migrateStoredSession } from "./RepairProvider";

function startLegacyDryerSession() {
  let state = createInitialRepairState("ready");
  state = executeRepairTool(state, "select_appliance", {
    applianceId: "ge-gtd42easj2ww",
    productCode: "GTD42EASJ2WW",
    symptomId: "not-heating",
  }).state;
  state = executeRepairTool(state, "start_diagnosis", {
    symptomId: "not-heating",
  }).state;
  return { ...state, packId: state.applianceId, catalogSymptomId: null };
}

describe("stored repair session migration", () => {
  it("maps legacy appliance-keyed sessions and undo states to model × symptom packs", () => {
    const legacy = startLegacyDryerSession();
    const previous = executeRepairTool(legacy, "record_observation", {
      checkId: "safety-check",
      resultId: "safe-ready",
    }).state;

    const migrated = migrateStoredSession({
      version: 1,
      state: legacy,
      undoStack: [{ ...previous, packId: previous.applianceId, catalogSymptomId: null }],
    });

    expect(migrated).not.toBeNull();
    expect(migrated?.version).toBe(2);
    expect(migrated?.state.packId).toBe("ge-gtd42easj2ww::not-heating");
    expect(migrated?.state.catalogSymptomId).toBe("not-heating");
    expect(migrated?.undoStack[0]?.packId).toBe("ge-gtd42easj2ww::not-heating");
    expect(migrated?.undoStack[0]?.completedChecks["safety-check"]).toBe("safe-ready");
  });

  it("rejects malformed storage and safely clears an unknown appliance identity", () => {
    expect(migrateStoredSession({ version: 3, state: {}, undoStack: [] })).toBeNull();
    const migrated = migrateStoredSession({
      version: 1,
      state: {
        ...createInitialRepairState(),
        applianceId: "missing-model",
        packId: "missing-model",
      },
      undoStack: [],
    });
    expect(migrated?.state.applianceId).toBeNull();
    expect(migrated?.state.packId).toBeNull();
    expect(migrated?.state.symptomId).toBeNull();
    expect(
      migrateStoredSession({
        version: 2,
        state: { ...createInitialRepairState(), phase: "malicious-phase" },
        undoStack: [],
      }),
    ).toBeNull();
  });

  it("bounds persisted undo history during migration", () => {
    const state = createInitialRepairState();
    const migrated = migrateStoredSession({
      version: 2,
      state,
      undoStack: Array.from({ length: 50 }, () => state),
    });
    expect(migrated?.undoStack).toHaveLength(12);
  });
});
