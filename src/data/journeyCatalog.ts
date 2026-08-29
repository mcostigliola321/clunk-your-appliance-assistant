import { APPLIANCE_CATALOG } from "@/data/applianceCatalog";
import type { ApplianceKind, SupportedSymptomId } from "@/domain/types";
import { PRIMARY_SYMPTOMS_BY_KIND, SYMPTOM_PRESENTATION } from "./symptomCatalog";

export { SYMPTOM_PRESENTATION } from "./symptomCatalog";

export interface ApplianceJourney {
  id: ApplianceKind;
  label: string;
  noun: string;
  image: {
    src: string;
    srcSet: string;
    alt: string;
  };
  flagshipId: string;
}

export const APPLIANCE_JOURNEYS: ApplianceJourney[] = [
  {
    id: "washer",
    label: "Washer",
    noun: "washer",
    image: {
      src: "/assets/thumbs/clunk-washer-240.png",
      srcSet: "/assets/thumbs/clunk-washer-240.png 240w, /assets/thumbs/clunk-washer.png 480w",
      alt: "Cutaway view of a front-load washer",
    },
    flagshipId: "ge-gfw550ssnww",
  },
  {
    id: "dishwasher",
    label: "Dishwasher",
    noun: "dishwasher",
    image: {
      src: "/assets/thumbs/clunk-dishwasher-240.png",
      srcSet:
        "/assets/thumbs/clunk-dishwasher-240.png 240w, /assets/thumbs/clunk-dishwasher.png 480w",
      alt: "Cutaway view of a built-in dishwasher",
    },
    flagshipId: "whirlpool-wdt750sakz1",
  },
  {
    id: "dryer",
    label: "Electric dryer",
    noun: "dryer",
    image: {
      src: "/assets/thumbs/clunk-dryer-240.png",
      srcSet: "/assets/thumbs/clunk-dryer-240.png 240w, /assets/thumbs/clunk-dryer.png 480w",
      alt: "Cutaway view of an electric dryer",
    },
    flagshipId: "ge-gtd42easj2ww",
  },
  {
    id: "refrigerator",
    label: "Refrigerator",
    noun: "refrigerator",
    image: {
      src: "/assets/thumbs/clunk-refrigerator-240.png",
      srcSet:
        "/assets/thumbs/clunk-refrigerator-240.png 240w, /assets/thumbs/clunk-refrigerator.png 480w",
      alt: "Cutaway view of a side-by-side refrigerator",
    },
    flagshipId: "ge-gss25gypfs",
  },
];

export function getApplianceJourney(kind: ApplianceKind) {
  return APPLIANCE_JOURNEYS.find((journey) => journey.id === kind)!;
}

export function getSupportedSymptoms(kind: ApplianceKind) {
  return [
    ...new Set(
      APPLIANCE_CATALOG.filter((entry) => entry.kind === kind).flatMap((entry) =>
        entry.symptomCoverage.map((coverage) => coverage.symptomId),
      ),
    ),
  ];
}

export function getPrimarySymptoms(kind: ApplianceKind) {
  const supported = new Set(getSupportedSymptoms(kind));
  return PRIMARY_SYMPTOMS_BY_KIND[kind].filter((symptomId) => supported.has(symptomId));
}

export function getMoreSymptoms(kind: ApplianceKind) {
  const primary = new Set(getPrimarySymptoms(kind));
  return getSupportedSymptoms(kind).filter((symptomId) => !primary.has(symptomId));
}

export function getCatalogEntriesForSymptom(kind: ApplianceKind, symptomId: SupportedSymptomId) {
  return APPLIANCE_CATALOG.filter(
    (entry) =>
      entry.kind === kind &&
      entry.symptomCoverage.some((coverage) => coverage.symptomId === symptomId),
  );
}

export function getSymptomCoverage(
  entry: (typeof APPLIANCE_CATALOG)[number],
  symptomId: SupportedSymptomId,
) {
  return entry.symptomCoverage.find((coverage) => coverage.symptomId === symptomId) ?? null;
}

export function getCategoryCount(kind: ApplianceKind) {
  return APPLIANCE_CATALOG.filter((entry) => entry.kind === kind).length;
}
