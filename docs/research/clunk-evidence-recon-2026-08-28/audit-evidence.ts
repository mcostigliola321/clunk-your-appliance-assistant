import { fileURLToPath } from "node:url";

const base = fileURLToPath(new URL("./", import.meta.url));
const dataset = await Bun.file(`${base}candidate-coverage.json`).json();
type RegistryEntry = {
  id: string;
  url: string;
  publisher: string;
  appliesTo: string;
  kind: string;
};
type EvidenceRow = {
  rowId: string;
  modelIdentitySourceId: string;
  troubleshootingSourceIds: string[];
  capabilityTier: string;
  coverageStatus: string;
  partEvidence: unknown;
};
type UrlGroupEntry = Pick<RegistryEntry, "id" | "publisher" | "appliesTo" | "kind">;
type UrlAuditResult = {
  url: string;
  ok: boolean;
  status: number | null;
  sourceIds: string[];
  finalUrl?: string;
  contentType?: string | null;
  error?: string;
};

const registry = dataset.sourceRegistry as Record<string, RegistryEntry>;
const rows = dataset.rows as EvidenceRow[];

const invariantErrors: string[] = [];
if (rows.length !== 417) invariantErrors.push(`Expected 417 rows, found ${rows.length}`);
if (new Set(rows.map((row) => row.rowId)).size !== rows.length)
  invariantErrors.push("Duplicate rowId detected");
for (const row of rows) {
  if (!registry[row.modelIdentitySourceId])
    invariantErrors.push(`${row.rowId}: missing model source ${row.modelIdentitySourceId}`);
  for (const id of row.troubleshootingSourceIds)
    if (!registry[id]) invariantErrors.push(`${row.rowId}: missing troubleshooting source ${id}`);
  if (row.capabilityTier === "purchase-ready" && !row.partEvidence)
    invariantErrors.push(`${row.rowId}: purchase-ready without part evidence`);
  if (row.coverageStatus === "candidate" && row.partEvidence)
    invariantErrors.push(`${row.rowId}: new candidate unexpectedly carries part evidence`);
}

const urlGroups = new Map<string, UrlGroupEntry[]>();
for (const entry of Object.values(registry)) {
  const group = urlGroups.get(entry.url) ?? [];
  group.push({
    id: entry.id,
    publisher: entry.publisher,
    appliesTo: entry.appliesTo,
    kind: entry.kind,
  });
  urlGroups.set(entry.url, group);
}

const uniqueUrls = [...urlGroups.keys()].sort();
let cursor = 0;
const results: UrlAuditResult[] = [];
async function worker() {
  while (cursor < uniqueUrls.length) {
    const url = uniqueUrls[cursor++];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "Clunk evidence reconnaissance/1.0" },
      });
      results.push({
        url,
        ok: response.ok,
        status: response.status,
        finalUrl: response.url,
        contentType: response.headers.get("content-type"),
        sourceIds: urlGroups.get(url)!.map((x) => x.id),
      });
    } catch (error) {
      results.push({
        url,
        ok: false,
        status: null,
        error: error instanceof Error ? error.message : String(error),
        sourceIds: urlGroups.get(url)!.map((x) => x.id),
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
await Promise.all(Array.from({ length: 12 }, () => worker()));
results.sort((a, b) => a.url.localeCompare(b.url));

const duplicates = [...urlGroups.entries()]
  .filter(([, entries]) => entries.length > 1)
  .map(([url, entries]) => ({
    url,
    sourceIds: entries.map((x) => x.id),
    publishers: [...new Set(entries.map((x) => x.publisher))],
    applicabilityStatements: [...new Set(entries.map((x) => x.appliesTo))],
    audit: entries.every((x) => x.publisher === entries[0].publisher)
      ? "same-publisher reuse; row-level brand/category/topology constraints still apply"
      : "manual review required: URL is assigned to multiple publishers",
  }));

const audit = {
  auditedOn: "2026-08-28",
  invariantErrors,
  sourceCounts: {
    registryEntries: Object.keys(registry).length,
    uniqueUrls: uniqueUrls.length,
    duplicateUrlGroups: duplicates.length,
  },
  reachability: {
    reachable2xx: results.filter((r) => r.ok).length,
    non2xx: results.filter((r) => r.status && !r.ok).length,
    networkOrTimeout: results.filter((r) => r.status === null).length,
  },
  caveat:
    "HTTP reachability is not evidence of claim applicability. Applicability is separately encoded in each source and row.",
  duplicateApplicabilityAudit: duplicates,
  urlResults: results,
};
await Bun.write(`${base}source-url-audit.json`, JSON.stringify(audit, null, 2) + "\n");
const failed = results.filter((result) => !result.ok);
const auditMarkdown = `# Source URL and duplicate-applicability audit\n\nAudited ${audit.auditedOn}. HTTP reachability is a transport check, not evidence of claim applicability.\n\n## Result\n\n- Registry entries: ${audit.sourceCounts.registryEntries}\n- Unique URLs: ${audit.sourceCounts.uniqueUrls}\n- Reachable with HTTP 2xx: ${audit.reachability.reachable2xx}\n- Non-2xx: ${audit.reachability.non2xx}\n- Network/timeout: ${audit.reachability.networkOrTimeout}\n- Invariant errors: ${invariantErrors.length}\n- Duplicate URL groups: ${duplicates.length}\n\n## Interpretation\n\n403 responses are treated as anti-bot/storefront access limitations, not as proof that a source is invalid. 404 responses are stale-link evidence gaps and must be repaired before relying on those URLs for new implementation. Network timeouts remain unresolved and require browser/manual re-check. The canonical matrix preserves these sources because they describe the current product catalog; the audit does not silently rewrite product evidence.\n\n## Duplicate applicability\n\n${duplicates.map((item) => `- ${item.url} — source IDs: ${item.sourceIds.join(", ")}; publishers: ${item.publishers.join(", ")}; audit: ${item.audit}.`).join("\n")}\n\nPublisher-only differences such as “GE” versus “GE Appliances” are normalization issues, not cross-brand evidence transfer. No troubleshooting URL is reused across unrelated brands in candidate rows.\n\n## Non-2xx and unresolved URLs\n\n${failed.map((item) => `- ${item.status ?? "network"} — ${item.url}${item.error ? ` — ${item.error}` : ""}`).join("\n")}\n`;
await Bun.write(`${base}source-url-audit.md`, auditMarkdown);
console.log(
  JSON.stringify(
    { invariantErrors, sourceCounts: audit.sourceCounts, reachability: audit.reachability },
    null,
    2,
  ),
);
if (invariantErrors.length) process.exitCode = 1;
