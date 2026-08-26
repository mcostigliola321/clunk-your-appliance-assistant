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
    label: "Tub outlet",
    description: "Where water leaves the bottom of the tub on its way to the pump.",
    access: "professional-only",
  },
  {
    id: "pump-filter",
    label: "Drain filter",
    description: "The small lower-front filter that catches coins, lint, and other debris.",
    access: "user-accessible",
  },
  {
    id: "drain-pump",
    label: "Drain pump",
    description: "The part that pushes water out through the drain hose.",
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
    label: "Controls",
    description: "The washer's internal controls. Do not open this area.",
    access: "professional-only",
  },
];

const CAUSES = [
  {
    id: "blocked-filter" as const,
    label: "Blocked drain filter",
    componentId: "pump-filter" as const,
    baseRank: 40,
  },
  {
    id: "kinked-hose" as const,
    label: "Bent or blocked drain hose",
    componentId: "drain-hose" as const,
    baseRank: 30,
  },
  {
    id: "drain-pump-failure" as const,
    label: "Drain pump problem",
    componentId: "drain-pump" as const,
    baseRank: 20,
  },
  {
    id: "control-fault" as const,
    label: "Internal control problem",
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
      "Cancel the cycle, unplug the washer, and wait until it is completely still. Make sure the water is cool.",
    why: "This keeps you away from moving parts, hot water, and electricity.",
    stop: "there is smoke, a burning smell, hot water, or water near the outlet.",
    safetyTags: ["disconnect-power", "cool-water", "external-observation"],
    sourceIds,
    results: [
      { id: "acknowledged", label: "Washer is unplugged and the water is cool" },
      { id: "hazard-burning", label: "Smoke or burning smell" },
      { id: "hazard-hot-water", label: "Water is still hot" },
      { id: "hazard-active-leak", label: "Active leak near power" },
    ],
  };
}

function hoseCheck(sourceIds: string[]): RepairPackCheck {
  return {
    id: "inspect-drain-hose",
    label: "Check the drain hose",
    componentId: "drain-hose",
    instruction:
      "Follow the hose from the back of the washer to the household drain. Look for a kink, pinch, damage, or a taped-shut connection. Do not move the washer.",
    why: "A bent or badly placed hose can stop the water from leaving the washer.",
    stop: "you cannot reach the hose safely, it looks damaged, or you would need to move the washer.",
    safetyTags: ["external-observation", "no-disassembly"],
    sourceIds,
    results: [
      { id: "hose-kinked", label: "Visible kink or pinch" },
      { id: "hose-clear", label: "Hose looks clear" },
      { id: "hose-disconnected", label: "Hose is loose or damaged" },
      { id: "unsafe-to-reach", label: "I cannot reach it safely" },
    ],
  };
}

function filterCheck(entry: ApplianceCatalogEntry): RepairPackCheck {
  const drawer = entry.topology === "drawer-filter";
  return {
    id: "inspect-pump-filter",
    label: "Check the drain filter",
    componentId: "pump-filter",
    instruction: drawer
      ? "Only continue if your owner's manual shows the filter behind the lower drawer. Put down towels and a shallow pan, drain the small hose slowly, then unscrew the filter."
      : "Open the small lower-front door. Put down towels and a shallow pan, drain the small hose slowly if there is one, then unscrew the filter.",
    why: "Coins, lint, and other debris can block this filter and stop the washer from draining.",
    stop: "the panel does not match the picture, the cap is stuck, water is hot, you see wires, or water gets near an outlet.",
    safetyTags: ["disconnect-power", "cool-water", "spill-control", "user-accessible-filter"],
    sourceIds: [entry.modelSource.id, ...entry.troubleshootingSources.map((item) => item.id)],
    results: [
      { id: "filter-blocked", label: "I found debris in the filter" },
      { id: "filter-clear", label: "The filter looks clear" },
      { id: "filter-damaged", label: "The filter or seal looks damaged" },
      { id: "unsafe-to-open", label: "This does not match my washer" },
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
      type: `${entry.loadStyle} washer`,
      loadStyle: entry.loadStyle,
      topology: entry.topology,
    },
    symptom: { id: "will-not-drain", label: "Washer will not drain" },
    productCodePrompt: entry.productCodePrompt,
    verifiedProductCodes: entry.verifiedProductCodes,
    components: COMPONENTS.map((component) => {
      if (component.id === "machine")
        return {
          ...component,
          description: `The selected ${entry.loadStyle} washer.`,
        };
      if (component.id === "drum" && entry.loadStyle === "top-load")
        return {
          ...component,
          label: "Wash basket",
          description: "The visible vertical wash basket below the open lid.",
        };
      if (component.id === "sump" && entry.loadStyle === "top-load")
        return {
          ...component,
          label: "Tub outlet",
          description: "The internal low outlet from the outer tub toward the drain pump.",
        };
      if (component.id === "pump-filter" && entry.checkProfile === "hose-then-service")
        return { ...component, access: "professional-only" };
      return { ...component };
    }),
    checks,
    causes: CAUSES.filter(
      (cause) => entry.checkProfile === "filter-access" || cause.id !== "blocked-filter",
    ).map((cause) => ({ ...cause })),
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
    if (
      !part.purchase.url.startsWith("https://") ||
      !/^\d{4}-\d{2}-\d{2}$/.test(part.purchase.lastVerified)
    )
      throw new Error(`Part ${part.id} requires a secure, dated seller handoff.`);
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
