import { createSupabaseHandler } from "@lovable.dev/mcp-js/stacks/supabase";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import mcp from "@/lib/mcp";
import runDiagnosisTool from "@/lib/mcp/tools/run-diagnosis";

type JsonRpcResponse = {
  id: number;
  jsonrpc: "2.0";
  result?: Record<string, unknown>;
  error?: Record<string, unknown>;
};

const endpoint = "https://example.supabase.co/functions/v1/mcp";
const handler = createSupabaseHandler(mcp, { functionName: "mcp" });

async function rpc(method: string, params: Record<string, unknown>, id = 1) {
  const response = await handler(
    new Request(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    }),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("text/event-stream");
  const body = await response.text();
  const data = body
    .split("\n")
    .find((line) => line.startsWith("data: "))
    ?.slice("data: ".length);
  expect(data).toBeTruthy();
  return JSON.parse(data!) as JsonRpcResponse;
}

describe("remote MCP server", () => {
  it("publishes five bounded, read-only tools with validated outputs", async () => {
    const initialized = await rpc("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "clunk-test", version: "1.0.0" },
    });
    expect(initialized.error).toBeUndefined();
    expect(initialized.result?.["serverInfo"]).toMatchObject({
      name: "clunk-your-appliance-assistant",
      version: "0.1.0",
    });

    const listed = await rpc("tools/list", {});
    const tools = listed.result?.["tools"] as Array<{
      name: string;
      annotations: Record<string, boolean>;
      outputSchema?: Record<string, unknown>;
    }>;
    expect(tools.map((tool) => tool.name)).toEqual([
      "search_appliances",
      "get_appliance_coverage",
      "get_repair_guide",
      "run_diagnosis",
      "find_model_number",
    ]);
    for (const tool of tools) {
      expect(tool.annotations).toMatchObject({
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      });
      expect(tool.outputSchema).toMatchObject({ type: "object" });
    }
  });

  it("serves a source-backed exact-part journey over the MCP protocol", async () => {
    const response = await rpc("tools/call", {
      name: "run_diagnosis",
      arguments: {
        applianceId: "ge-gtd42easj2ww",
        symptomId: "door-will-not-close",
        productCode: "GTD42EASJ2WW",
        observations: [
          { checkId: "safety-check", resultId: "safe-ready" },
          { checkId: "inspect-door-strike", resultId: "strike-broken" },
        ],
      },
    });
    expect(response.error).toBeUndefined();
    expect(response.result).toMatchObject({
      structuredContent: {
        phase: "result",
        outcome: { status: "exact" },
        part: { sku: "WE01M10007", compatibleModel: "GE GTD42EASJ2WW" },
      },
    });
  });

  it("rejects observations supplied after a terminal result", async () => {
    const result = await runDiagnosisTool.handler(
      {
        applianceId: "ge-gtd42easj2ww",
        symptomId: "door-will-not-close",
        productCode: "GTD42EASJ2WW",
        observations: [
          { checkId: "safety-check", resultId: "hazard-burning" },
          { checkId: "inspect-door-strike", resultId: "strike-broken" },
        ],
      },
      undefined as never,
    );
    expect(result.isError).toBe(true);
    expect(result.content?.[0]).toMatchObject({
      type: "text",
      text: expect.stringContaining("already reached a terminal result"),
    });
  });

  it("returns a terminal escalation without a part for a reported hazard", async () => {
    const response = await rpc("tools/call", {
      name: "run_diagnosis",
      arguments: {
        applianceId: "ge-gtd42easj2ww",
        symptomId: "door-will-not-close",
        productCode: "GTD42EASJ2WW",
        observations: [{ checkId: "safety-check", resultId: "hazard-burning" }],
      },
    });
    expect(response.error).toBeUndefined();
    expect(response.result).toMatchObject({
      structuredContent: {
        phase: "escalated",
        part: null,
        escalation: { reason: "burning-smell" },
      },
    });
  });

  it("rejects oversized public inputs at the protocol boundary", async () => {
    const response = await rpc("tools/call", {
      name: "get_appliance_coverage",
      arguments: { applianceId: "x".repeat(129) },
    });
    expect(response.error).toBeUndefined();
    expect(response.result).toMatchObject({ isError: true });
  });

  it("keeps every successful tool result inside its declared response contract", async () => {
    const cases: Array<[string, Record<string, unknown>]> = [
      ["search_appliances", { query: "GTD42EASJ2WW" }],
      ["get_appliance_coverage", { applianceId: "ge-gtd42easj2ww" }],
      ["get_repair_guide", { applianceId: "ge-gtd42easj2ww", symptomId: "door-will-not-close" }],
      ["find_model_number", { kind: "dryer", brand: "GE" }],
    ];

    for (const [name, args] of cases) {
      const tool = mcp.tools.find((candidate) => candidate.name === name)!;
      const result = await tool.handler(args, undefined as never);
      expect(result.isError).not.toBe(true);
      expect(z.object(tool.outputSchema!).safeParse(result.structuredContent).success).toBe(true);
    }
  });
});
