import expansionData from "./catalogExpansion.json";

import type {
  ApplianceCatalogEntry,
  ApplianceKind,
  BrandName,
  DiagramTopology,
  RepairProfile,
  RepairPackPart,
  SourceReference,
  SupportedSymptomId,
  WasherLoadStyle,
} from "@/domain/types";

interface ExpansionTroubleshootingSource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  appliesTo: string;
}

interface ExpansionProfile {
  brand: BrandName;
  kind: ApplianceKind;
  label: string;
  productCodePrompt: string;
  topology: DiagramTopology;
  profile: RepairProfile;
  supportedSymptom: SupportedSymptomId;
  loadStyle?: WasherLoadStyle;
  checkProfile?: ApplianceCatalogEntry["checkProfile"];
  troubleshootingSources: ExpansionTroubleshootingSource[];
}

interface ExpansionModel {
  id: string;
  profile: string;
  model: string;
  aliases: string[];
  verifiedProductCodes: string[];
  retrievedOn?: string;
  officialUrl: string;
  exactPart?: ExpansionExactPart;
}

interface ExpansionExactPart extends Omit<RepairPackPart, "source" | "commerce" | "purchase"> {
  source: Omit<SourceReference, "lastVerified"> & {
    kind: "manufacturer-part" | "authorized-parts";
  };
  commerce: Omit<NonNullable<RepairPackPart["commerce"]>, "provider" | "protocol" | "lastVerified">;
}

interface CatalogExpansionData {
  schemaVersion: number;
  retrievedOn: string;
  profiles: Record<string, ExpansionProfile>;
  models: ExpansionModel[];
}

const OFFICIAL_MODEL_HOSTS: Record<BrandName, string[]> = {
  LG: ["lg.com"],
  Samsung: ["samsung.com"],
  GE: ["geappliances.com"],
  Hotpoint: ["geappliances.com"],
  Whirlpool: ["whirlpool.com"],
  Maytag: ["maytag.com"],
  Amana: ["amana.com"],
  Electrolux: ["electrolux.com"],
  Frigidaire: ["frigidaire.com"],
  Bosch: ["bosch-home.com"],
  KitchenAid: ["kitchenaid.com"],
};

const EXACT_PART_HOSTS: Partial<Record<BrandName, string[]>> = {
  GE: ["geapplianceparts.com", "partstore.encompass.com"],
  Hotpoint: ["geapplianceparts.com", "partstore.encompass.com"],
  Whirlpool: ["whirlpoolparts.com"],
  Maytag: ["whirlpoolparts.com"],
  KitchenAid: ["whirlpoolparts.com"],
};

function isOfficialModelUrl(brand: BrandName, value: string): boolean {
  const host = new URL(value).hostname.toLowerCase();
  return OFFICIAL_MODEL_HOSTS[brand].some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}

function hasExactCode(value: string, code: string): boolean {
  const characters = code.toUpperCase().match(/[A-Z0-9]/g) ?? [];
  if (characters.length === 0) return false;
  const pattern = characters.join("[^A-Z0-9]*");
  return new RegExp(`(?:^|[^A-Z0-9])${pattern}(?:$|[^A-Z0-9])`, "i").test(value);
}

function isAuthorizedPartUrl(brand: BrandName, value: string): boolean {
  const host = new URL(value).hostname.toLowerCase();
  return (EXACT_PART_HOSTS[brand] ?? []).some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}

export function assertCatalogExpansionData(value: CatalogExpansionData): CatalogExpansionData {
  if (value.schemaVersion !== 1) throw new Error("Catalog expansion requires schema version 1.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.retrievedOn))
    throw new Error("Catalog expansion requires an ISO retrieval date.");
  const ids = new Set<string>();
  const identities = new Set<string>();
  for (const [profileId, profile] of Object.entries(value.profiles)) {
    if (!profileId || !profile.productCodePrompt.trim() || !profile.troubleshootingSources.length)
      throw new Error(`Expansion profile ${profileId} is incomplete.`);
    if (profile.kind === "washer" && !profile.loadStyle)
      throw new Error(`Washer expansion profile ${profileId} requires a load style.`);
    const expectedSymptom =
      profile.kind === "dryer"
        ? "door-will-not-close"
        : profile.kind === "refrigerator"
          ? "slow-water-flow"
          : "will-not-drain";
    if (profile.supportedSymptom !== expectedSymptom)
      throw new Error(`Expansion profile ${profileId} has a category/symptom mismatch.`);
    if (
      profile.troubleshootingSources.some(
        (source) => !source.id || !source.url.startsWith("https://"),
      )
    )
      throw new Error(`Expansion profile ${profileId} has an invalid symptom source.`);
  }
  for (const model of value.models) {
    const profile = value.profiles[model.profile];
    if (!profile) throw new Error(`Expansion model ${model.id} has an unknown profile.`);
    const identity = `${profile.brand}:${profile.kind}:${model.model}`.toUpperCase();
    if (ids.has(model.id) || identities.has(identity))
      throw new Error(`Expansion model ${model.id} is duplicated.`);
    ids.add(model.id);
    identities.add(identity);
    const aliases = new Set(model.aliases.map((alias) => alias.toUpperCase()));
    if (!aliases.has(model.model.toUpperCase()))
      throw new Error(`Expansion model ${model.id} must include its family alias.`);
    if (model.verifiedProductCodes.some((code) => !aliases.has(code.toUpperCase())))
      throw new Error(`Expansion model ${model.id} has a verified code outside its aliases.`);
    if (
      !model.officialUrl.startsWith("https://") ||
      !isOfficialModelUrl(profile.brand, model.officialUrl)
    )
      throw new Error(`Expansion model ${model.id} requires an official manufacturer URL.`);
    if (model.retrievedOn && !/^\d{4}-\d{2}-\d{2}$/.test(model.retrievedOn))
      throw new Error(`Expansion model ${model.id} has an invalid retrieval date.`);
    if (model.exactPart) {
      const part = model.exactPart;
      const exactCode = model.verifiedProductCodes[0];
      if (
        !exactCode ||
        model.verifiedProductCodes.length !== 1 ||
        part.compatibleProductCodes.length !== 1 ||
        part.compatibleProductCodes[0]?.toUpperCase() !== exactCode.toUpperCase()
      )
        throw new Error(
          `Expansion model ${model.id} must bind its exact part to one separately evidenced revision.`,
        );
      if (
        !part.source.url.startsWith("https://") ||
        !isAuthorizedPartUrl(profile.brand, part.source.url) ||
        !hasExactCode(part.source.appliesTo, exactCode) ||
        !hasExactCode(part.compatibleModel, exactCode)
      )
        throw new Error(`Expansion model ${model.id} has inexact revision evidence.`);
      if (
        part.commerce.exactSku.toUpperCase() !== part.sku.toUpperCase() ||
        !hasExactCode(part.commerce.query, part.sku) ||
        !Number.isInteger(part.commerce.offerCountAtVerification) ||
        part.commerce.offerCountAtVerification <= 0
      )
        throw new Error(`Expansion model ${model.id} has an invalid exact-SKU UCP audit.`);
    }
  }
  return value;
}

const data = assertCatalogExpansionData(expansionData as CatalogExpansionData);

export const CATALOG_EXPANSION: ApplianceCatalogEntry[] = data.models.map((model) => {
  const profile = data.profiles[model.profile]!;
  const troubleshootingSources: SourceReference[] = profile.troubleshootingSources.map((item) => ({
    ...item,
    kind: "manufacturer-troubleshooting",
    lastVerified: data.retrievedOn,
  }));
  const exactPart: RepairPackPart | undefined = model.exactPart
    ? {
        ...model.exactPart,
        source: { ...model.exactPart.source, lastVerified: data.retrievedOn },
        commerce: {
          ...model.exactPart.commerce,
          provider: "shopify-global-catalog",
          protocol: "UCP",
          lastVerified: data.retrievedOn,
        },
      }
    : undefined;
  return {
    id: model.id,
    kind: profile.kind,
    brand: profile.brand,
    model: model.model,
    label: profile.label,
    aliases: model.aliases,
    verifiedProductCodes: model.verifiedProductCodes,
    productCodePrompt: profile.productCodePrompt,
    supportedSymptom: profile.supportedSymptom,
    capability: exactPart ? "purchase-ready" : "guided-checks",
    profile: profile.profile,
    ...(profile.loadStyle ? { loadStyle: profile.loadStyle } : {}),
    topology: profile.topology,
    ...(profile.checkProfile
      ? { checkProfile: profile.checkProfile }
      : profile.kind === "dishwasher"
        ? { checkProfile: "sink-then-service" as const }
        : {}),
    modelSource: {
      id: `${model.id}-model`,
      kind: "manufacturer-model",
      title: `${profile.brand} ${model.model} official model/support page`,
      url: model.officialUrl,
      publisher: profile.brand,
      appliesTo: model.verifiedProductCodes.length
        ? model.verifiedProductCodes.join(", ")
        : `${model.model} family; rating-label revision still required`,
      lastVerified: model.retrievedOn ?? data.retrievedOn,
    },
    troubleshootingSources,
    ...(exactPart ? { exactPart } : {}),
  };
});

export const CATALOG_EXPANSION_RETRIEVED_ON = data.retrievedOn;
export const CATALOG_EXPANSION_MODEL_COUNT = data.models.length;
