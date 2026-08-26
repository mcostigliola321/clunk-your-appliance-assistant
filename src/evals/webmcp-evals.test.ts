import { describe, expect, it } from "vitest";

import evalFixture from "../../evals/webmcp-evals.json";
import { REPAIR_TOOL_NAMES, type RepairToolName } from "@/domain/types";
import { REPAIR_TOOL_CONTRACTS } from "@/webmcp/contracts";

interface EvalCall {
  name: string;
  arguments: Record<string, unknown>;
}

function allCalls() {
  return evalFixture.cases.flatMap((evalCase) => [
    ...(evalCase.setup as EvalCall[]),
    ...(evalCase.expectedCalls as EvalCall[]),
  ]);
}

describe("WebMCP eval fixtures", () => {
  it("uses unique, fully described cases", () => {
    expect(evalFixture.schemaVersion).toBe(1);
    expect(evalFixture.fictional).toBe(true);
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
        properties?: Record<string, unknown>;
        required?: string[];
        additionalProperties?: boolean;
      };
      expect(schema.additionalProperties).toBe(false);
      expect(Object.keys(call.arguments).every((key) => key in (schema.properties ?? {}))).toBe(
        true,
      );
      expect((schema.required ?? []).every((key) => key in call.arguments)).toBe(true);
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
});
