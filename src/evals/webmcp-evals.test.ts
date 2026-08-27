import { describe, expect, it } from "vitest";

import evalFixture from "../../evals/webmcp-evals.json";
import { REPAIR_TOOL_NAMES, type RepairToolName } from "@/domain/types";
import { createInitialRepairState, executeRepairTool } from "@/domain/engine";
import { REPAIR_TOOL_CONTRACTS } from "@/webmcp/contracts";

interface EvalCall {
  name: string;
  arguments: Record<string, unknown>;
  expectedOk?: boolean;
}

function allCalls() {
  return evalFixture.cases.flatMap((evalCase) => [
    ...(evalCase.setup as EvalCall[]),
    ...(evalCase.expectedCalls as EvalCall[]),
  ]);
}

describe("deterministic WebMCP scenario fixtures", () => {
  it("uses unique, fully described cases", () => {
    expect(evalFixture.schemaVersion).toBe(5);
    expect(evalFixture.fictional).toBe(false);
    expect(evalFixture.artifactType).toBe("deterministic-scenario-fixtures");
    expect(evalFixture.evidenceStatus).toContain("not real-agent evaluation results");
    expect(new Set(evalFixture.cases.map((evalCase) => evalCase.id)).size).toBe(
      evalFixture.cases.length,
    );

    for (const evalCase of evalFixture.cases) {
      expect(evalCase.prompt.length).toBeGreaterThan(20);
      expect(evalCase.expectedVisible.length).toBeGreaterThan(0);
      expect(evalCase.mustNot.length).toBeGreaterThan(0);
    }
  });

  it("references only registered tools with bounded arguments", () => {
    for (const call of allCalls()) {
      expect(REPAIR_TOOL_NAMES).toContain(call.name);
      const contract = REPAIR_TOOL_CONTRACTS.find(
        (candidate) => candidate.name === (call.name as RepairToolName),
      );
      expect(contract).toBeDefined();

      const schema = contract?.inputSchema as {
        properties?: Record<string, { enum?: unknown[] }>;
        required?: string[];
        additionalProperties?: boolean;
      };
      expect(schema.additionalProperties).toBe(false);
      expect(Object.keys(call.arguments).every((key) => key in (schema.properties ?? {}))).toBe(
        true,
      );
      expect((schema.required ?? []).every((key) => key in call.arguments)).toBe(true);
      for (const [key, value] of Object.entries(call.arguments)) {
        const allowed = schema.properties?.[key]?.enum;
        if (allowed) expect(allowed).toContain(value);
      }
    }
  });

  it("covers every public tool across setup and expected calls", () => {
    const coveredTools = new Set(allCalls().map((call) => call.name));
    for (const toolName of REPAIR_TOOL_NAMES) {
      expect(coveredTools).toContain(toolName);
    }

    expect(evalFixture.cases.some((evalCase) => evalCase.category === "safety")).toBe(true);
    expect(evalFixture.cases.some((evalCase) => evalCase.category === "invalid-call")).toBe(true);
  });

  it("replays every fixture call through the deterministic engine", () => {
    for (const evalCase of evalFixture.cases) {
      let state = createInitialRepairState("unavailable");
      for (const call of [
        ...(evalCase.setup as EvalCall[]),
        ...(evalCase.expectedCalls as EvalCall[]),
      ]) {
        const result = executeRepairTool(
          state,
          call.name as RepairToolName,
          call.arguments,
          "agent",
        );
        expect(result.ok, `${evalCase.id}: ${call.name} returned: ${result.message}`).toBe(
          call.expectedOk ?? true,
        );
        state = result.state;
      }
    }
  });
});
