import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";

import type {
  ApplianceCatalogEntry,
  ApplianceId,
  BrandName,
  CheckId,
  ComponentId,
  PartId,
  RepairPack,
  RepairPackCheck,
  RepairPackComponent,
  RepairPackPart,
  ResultId,
} from "./types";

const FORBIDDEN_STEP_TAGS = new Set([
  "gas",
  "mains-voltage",
  "high-voltage",
  "refrigerant",
  "sealed-compressor",
  "bypass-protection",
  "internal-wiring",
  "control-board",
  "energized-test",
  "professional-only-instruction",
]);

const COMPONENTS: RepairPackComponent[] = [
  {
    id: "machine",
    label: "Washer",
    description: "The selected front-load washer.",
    access: "visible",
  },
  {
    id: "drum",
    label: "Drum",
    description: "The visible wash drum and door opening.",
    access: "visible",
  },
  {
    id: "sump",
    label: "Sump",
    description: "The internal low point leading toward the pump.",
    access: "professional-only",
  },
  {
    id: "pump-filter",
    label: "Pump filter",
    description: "A debris filter when the manufacturer documents user access.",
    access: "user-accessible",
  },
  {
    id: "drain-pump",
    label: "Drain pump",
    description: "An internal pump; replacement remains professional-only.",
    access: "professional-only",
  },
  {
    id: "drain-hose",
    label: "Drain hose",
    description: "The visible external hose leading to the household drain.",
    access: "visible",
  },
  {
    id: "control-module",
    label: "Control module",
    description: "An internal electrical assembly that Clunk never instructs you to access.",
    access: "professional-only",
  },
];

const CAUSES = [
  {
    id: "blocked-filter" as const,
    label: "Blocked pump filter",
    componentId: "pump-filter" as const,
    baseRank: 40,
  },
  {
    id: "kinked-hose" as const,
    label: "Restricted drain hose",
    componentId: "drain-hose" as const,
    baseRank: 30,
  },
  {
    id: "drain-pump-failure" as const,
    label: "Drain-pump fault",
    componentId: "drain-pump" as const,
    baseRank: 20,
  },
  {
    id: "control-fault" as const,
    label: "Internal control fault",
    componentId: "control-module" as const,
    baseRank: 10,
  },
];

function prepareCheck(sourceIds: string[]): RepairPackCheck {
  return {
    id: "prepare-power",
    label: "Make the washer safe",
    componentId: "machine",
    instruction:
      "Cancel the cycle, disconnect power, and wait for all movement to stop. Do not continue while water is hot.",
    why: "Every physical observation begins with the same deterministic safety boundary.",
    stop: "Stop for smoke, a burning smell, hot water, or an active leak near power.",
    safetyTags: ["disconnect-power", "cool-water", "external-observation"],
    sourceIds,
    results: [
      { id: "acknowledged", label: "Power disconnected; water is cool" },
      { id: "hazard-burning", label: "Smoke or burning smell" },
      { id: "hazard-hot-water", label: "Water is still hot" },
      { id: "hazard-active-leak", label: "Active leak near power" },
    ],
  };
}

function hoseCheck(sourceIds: string[]): RepairPackCheck {
  return {
    id: "inspect-drain-hose",
    label: "Inspect the visible drain hose",
    componentId: "drain-hose",
    instruction:
      "Without moving the washer or disconnecting plumbing, trace the visible hose to the standpipe. Look for a pinch, sharp bend, damage, or an airtight taped connection.",
    why: "Manufacturer guidance across these model families identifies hose restriction or incorrect installation as a first no-drain check.",
    stop: "Stop if the hose is inaccessible, damaged, or moving the washer would be required.",
    safetyTags: ["external-observation", "no-disassembly"],
    sourceIds,
    results: [
      { id: "hose-kinked", label: "Visible kink or pinch" },
      { id: "hose-clear", label: "Hose looks clear and correctly placed" },
      { id: "hose-disconnected", label: "Loose, damaged, or disconnected" },
      { id: "unsafe-to-reach", label: "Unsafe or impossible to reach" },
    ],
  };
}

function filterCheck(entry: ApplianceCatalogEntry): RepairPackCheck {
  const drawer = entry.topology === "drawer-filter";
  return {
    id: "inspect-pump-filter",
    label: drawer ? "Check the documented lower filter" : "Check the front pump filter",
    componentId: "pump-filter",
    instruction: drawer
      ? "Continue only if your owner manual and washer match the documented storage-drawer access. With power disconnected, release the storage drawer tabs, place a shallow pan and towels below the small drain hose, drain slowly, then turn the filter counterclockwise."
      : "With power disconnected and water cool, place towels and a shallow pan below the front access door. Drain slowly through the small hose when present, then turn the pump filter counterclockwise.",
    why: "The selected manufacturer's guidance documents a user-cleanable filter on this front-load configuration.",
    stop: "Stop if the access does not match, the cap is stuck, water is hot, wiring is visible, or water approaches an outlet.",
    safetyTags: ["disconnect-power", "cool-water", "spill-control", "user-accessible-filter"],
    sourceIds: [entry.modelSource.id, ...entry.troubleshootingSources.map((item) => item.id)],
    results: [
      { id: "filter-blocked", label: "Debris was blocking the filter" },
      { id: "filter-clear", label: "Filter and visible impeller area look clear" },
      { id: "filter-damaged", label: "Filter, cap, or seal looks damaged" },
      { id: "unsafe-to-open", label: "Access does not match or feels unsafe" },
    ],
  };
}

function buildPack(entry: ApplianceCatalogEntry): RepairPack {
  const sourceIds = [entry.modelSource.id, ...entry.troubleshootingSources.map((item) => item.id)];
  const checks = [prepareCheck(sourceIds), hoseCheck(sourceIds)];
  if (entry.checkProfile === "filter-access") checks.push(filterCheck(entry));
  const sources = [entry.modelSource, ...entry.troubleshootingSources];
  if (entry.exactPart) sources.push(entry.exactPart.source);

  return {
    id: entry.id,
    schemaVersion: 2,
    appliance: {
      brand: entry.brand,
      model: entry.model,
      type: "front-load washer",
      topology: entry.topology,
    },
    symptom: { id: "will-not-drain", label: "Washer will not drain" },
    productCodePrompt: entry.productCodePrompt,
    verifiedProductCodes: entry.verifiedProductCodes,
    components: COMPONENTS.map((component) =>
      component.id === "pump-filter" && entry.checkProfile === "hose-then-service"
        ? { ...component, access: "professional-only" }
        : { ...component },
    ),
    checks,
    causes: CAUSES.map((cause) => ({ ...cause })),
    parts: entry.exactPart ? [entry.exactPart] : [],
    sources,
  };
}

export function assertRepairPack(pack: RepairPack): RepairPack {
  if (pack.schemaVersion !== 2 || !pack.appliance.brand || !pack.appliance.model)
    throw new Error("Repair packs require schema version 2 and a real model identity.");
  const componentIds = new Set(pack.components.map((item) => item.id));
  const checkIds = new Set(pack.checks.map((item) => item.id));
  const sourceIds = new Set(pack.sources.map((item) => item.id));
  if (
    componentIds.size !== pack.components.length ||
    checkIds.size !== pack.checks.length ||
    sourceIds.size !== pack.sources.length
  )
    throw new Error(`Repair pack ${pack.id} contains duplicate identifiers.`);
  if (!pack.sources.some((item) => item.kind === "manufacturer-model"))
    throw new Error(`Repair pack ${pack.id} requires an official model source.`);

  const resultIds = new Set<string>();
  for (const check of pack.checks) {
    if (!componentIds.has(check.componentId))
      throw new Error(`Check ${check.id} references an unknown component.`);
    if (!check.sourceIds.every((id) => sourceIds.has(id)))
      throw new Error(`Check ${check.id} references an unknown source.`);
    for (const tag of check.safetyTags)
      if (FORBIDDEN_STEP_TAGS.has(tag))
        throw new Error(`Check ${check.id} contains forbidden safety tag ${tag}.`);
    for (const result of check.results) {
      if (resultIds.has(result.id))
        throw new Error(`Repair pack result IDs must be unique: ${result.id}.`);
      resultIds.add(result.id);
    }
  }

  for (const source of pack.sources) {
    if (!source.url.startsWith("https://") || !/^\d{4}-\d{2}-\d{2}$/.test(source.lastVerified))
      throw new Error(`Source ${source.id} is missing a secure URL or verification date.`);
  }
  for (const part of pack.parts) {
    if (!componentIds.has(part.componentId) || part.compatibleProductCodes.length === 0)
      throw new Error(`Part ${part.id} lacks component or compatibility evidence.`);
    if (!new Set(["manufacturer-part", "authorized-parts"]).has(part.source.kind))
      throw new Error(`Part ${part.id} requires manufacturer or authorized-parts evidence.`);
  }
  return pack;
}

export const REPAIR_PACKS = new Map(
  APPLIANCE_CATALOG.map((entry) => [entry.id, assertRepairPack(buildPack(entry))]),
);

export function normalizeModel(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function searchCatalog(query = "", brand?: BrandName | null): ApplianceCatalogEntry[] {
  const needle = normalizeModel(query);
  return APPLIANCE_CATALOG.filter((entry) => {
    if (brand && entry.brand !== brand) return false;
    if (!needle) return true;
    const haystacks = [entry.brand, entry.model, entry.label, ...entry.aliases].map(normalizeModel);
    return haystacks.some((value) => value.includes(needle) || needle.includes(value));
  });
}

export function getCatalogEntry(applianceId: ApplianceId): ApplianceCatalogEntry {
  const entry = APPLIANCE_CATALOG.find((item) => item.id === applianceId);
  if (!entry) throw new Error(`Unknown appliance ${applianceId}.`);
  return entry;
}

export function getRepairPack(applianceId: ApplianceId): RepairPack {
  const pack = REPAIR_PACKS.get(applianceId);
  if (!pack) throw new Error(`Unknown repair pack ${applianceId}.`);
  return pack;
}

export function getComponent(
  packId: ApplianceId | null,
  componentId: ComponentId,
): RepairPackComponent {
  const components = packId ? getRepairPack(packId).components : COMPONENTS;
  const component = components.find((item) => item.id === componentId);
  if (!component) throw new Error(`Unknown component ${componentId}.`);
  return component;
}

export function getCheck(packId: ApplianceId, checkId: CheckId): RepairPackCheck {
  const check = getRepairPack(packId).checks.find((item) => item.id === checkId);
  if (!check) throw new Error(`Unknown check ${checkId}.`);
  return check;
}

export function getPart(packId: ApplianceId, partId: PartId): RepairPackPart {
  const part = getRepairPack(packId).parts.find((item) => item.id === partId);
  if (!part) throw new Error(`Unknown part ${partId}.`);
  return part;
}

export function isResultForCheck(
  packId: ApplianceId,
  checkId: CheckId,
  resultId: ResultId,
): boolean {
  return getCheck(packId, checkId).results.some((result) => result.id === resultId);
}

export function isComponentId(packId: ApplianceId | null, value: unknown): value is ComponentId {
  return (
    typeof value === "string" &&
    (packId ? getRepairPack(packId).components : COMPONENTS).some((item) => item.id === value)
  );
}

export function isCheckId(packId: ApplianceId | null, value: unknown): value is CheckId {
  return Boolean(
    packId &&
    typeof value === "string" &&
    getRepairPack(packId).checks.some((item) => item.id === value),
  );
}

export function isBrandName(value: unknown): value is BrandName {
  return (
    typeof value === "string" &&
    ["LG", "Samsung", "GE", "Whirlpool", "Maytag", "Electrolux"].includes(value)
  );
}
