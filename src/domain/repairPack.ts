import packJson from "@/data/clunk-wm01.json";

import type {
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

export function assertRepairPack(pack: RepairPack): RepairPack {
  if (!pack.appliance.fictional) {
    throw new Error("Clunk repair packs must be explicitly fictional.");
  }

  const componentIds = new Set(pack.components.map((component) => component.id));
  const checkIds = new Set(pack.checks.map((check) => check.id));
  const resultIds = new Set<string>();

  for (const check of pack.checks) {
    if (!componentIds.has(check.componentId)) {
      throw new Error("Check " + check.id + " references an unknown component.");
    }

    for (const tag of check.safetyTags) {
      if (FORBIDDEN_STEP_TAGS.has(tag)) {
        throw new Error("Check " + check.id + " contains forbidden safety tag " + tag + ".");
      }
    }

    for (const result of check.results) {
      if (resultIds.has(result.id)) {
        throw new Error("Repair pack result IDs must be unique: " + result.id + ".");
      }
      resultIds.add(result.id);
    }
  }

  if (checkIds.size !== pack.checks.length) {
    throw new Error("Repair pack check IDs must be unique.");
  }

  for (const part of pack.parts) {
    if (!componentIds.has(part.componentId)) {
      throw new Error("Part " + part.id + " references an unknown component.");
    }
  }

  return pack;
}

export const repairPack = assertRepairPack(packJson as RepairPack);

export function getComponent(componentId: ComponentId): RepairPackComponent {
  const component = repairPack.components.find((item) => item.id === componentId);
  if (!component) {
    throw new Error("Unknown component " + componentId + ".");
  }
  return component;
}

export function getCheck(checkId: CheckId): RepairPackCheck {
  const check = repairPack.checks.find((item) => item.id === checkId);
  if (!check) {
    throw new Error("Unknown check " + checkId + ".");
  }
  return check;
}

export function getPart(partId: PartId): RepairPackPart {
  const part = repairPack.parts.find((item) => item.id === partId);
  if (!part) {
    throw new Error("Unknown part " + partId + ".");
  }
  return part;
}

export function isResultForCheck(checkId: CheckId, resultId: ResultId): boolean {
  return getCheck(checkId).results.some((result) => result.id === resultId);
}

export function isComponentId(value: unknown): value is ComponentId {
  return (
    typeof value === "string" && repairPack.components.some((component) => component.id === value)
  );
}

export function isCheckId(value: unknown): value is CheckId {
  return typeof value === "string" && repairPack.checks.some((check) => check.id === value);
}

export function isPartId(value: unknown): value is PartId {
  return typeof value === "string" && repairPack.parts.some((part) => part.id === value);
}
