#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const researchDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(researchDir, "../../../..");
const implementationDir = join(root, "src/data/demoReady");
const verifiedOn = "2026-08-29";
const symptomIds = [
  "will-not-drain",
  "door-will-not-close",
  "will-not-start",
  "will-not-spin",
  "is-leaking",
];

mkdirSync(researchDir, { recursive: true });
mkdirSync(implementationDir, { recursive: true });

const catalogScript = `
  import { APPLIANCE_CATALOG } from './src/data/applianceCatalog';
  const rows = APPLIANCE_CATALOG.filter((item) => item.kind === 'washer').map((item) => ({
    id: item.id,
    category: item.kind,
    brand: item.brand,
    model: item.model,
    loadStyle: item.loadStyle,
    topology: item.topology,
    modelSource: item.modelSource,
    verifiedProductCodes: item.verifiedProductCodes || [],
    coverage: item.symptomCoverage.map((row) => ({
      symptomId: row.symptomId,
      capability: row.capability,
      sku: row.parts?.[0]?.sku || null,
    })),
  }));
  process.stdout.write(JSON.stringify(rows));
`;

const washers = JSON.parse(
  execFileSync(join(root, "node_modules/.bin/tsx"), ["-e", catalogScript], {
    cwd: root,
    encoding: "utf8",
  }),
);

const sourceCatalog = {
  "amana-front-start": {
    publisher: "Amana",
    kind: "manufacturer-support",
    appliesTo: "Amana front-load washers",
    url: "https://producthelp.amana.com/Laundry/Washers/Front_Load_Washers/Not_Starting_or_Not_Operating/Not_Starting_or_Not_Operating/Not_Starting_or_Not_Operating_-_Front_Load_Washer",
  },
  "amana-front-spin": {
    publisher: "Amana",
    kind: "manufacturer-support",
    appliesTo: "Amana front-load washers",
    url: "https://producthelp.amana.com/Laundry/Washers/Front_Load_Washers/Not_Starting_or_Not_Operating/Not_Spinning/Not_Spinning_-_Front_Load_Washer",
  },
  "amana-front-leak": {
    publisher: "Amana",
    kind: "manufacturer-support",
    appliesTo: "Amana front-load washers",
    url: "https://producthelp.amana.com/Laundry/Washers/Front_Load_Washers/Leaking/Leaking_from_Underneath_or_Bottom_-_Front_Load_Washer",
  },
  "amana-top-closure": {
    publisher: "Amana",
    kind: "manufacturer-support",
    appliesTo: "Amana top-load washers",
    url: "https://producthelp.amana.com/Laundry/Washers/Top_Load_Washer/Operation/Not_Operating/Lid_Not_Latching_-_Washer",
  },
  "amana-top-start": {
    publisher: "Amana",
    kind: "manufacturer-support",
    appliesTo: "Amana top-load washers",
    url: "https://producthelp.amana.com/Laundry/Washers/Top_Load_Washer/Operation/Not_Operating/Not_Starting_-_Washer",
  },
  "amana-top-spin": {
    publisher: "Amana",
    kind: "manufacturer-support",
    appliesTo: "Amana top-load washers",
    url: "https://producthelp.amana.com/Laundry/Washers/Top_Load_Washer/Cycle_Concerns/Not_Spinning_-_Washer",
  },
  "amana-top-leak": {
    publisher: "Amana",
    kind: "manufacturer-support",
    appliesTo: "Amana top-load washers",
    url: "https://producthelp.amana.com/Laundry/Washers/Top_Load_Washer/Water/Leaking/Leaking_Water_Underneath_-_Washer",
  },
  "maytag-front-start": {
    publisher: "Maytag",
    kind: "manufacturer-support",
    appliesTo: "Maytag front-load washers",
    url: "https://producthelp.maytag.com/Laundry/Washers/Front_Load_Washers/Not_Starting_or_Not_Operating/Not_Starting_or_Not_Operating/Not_Starting_or_Not_Operating_-_Front_Load_Washer",
  },
  "maytag-front-spin": {
    publisher: "Maytag",
    kind: "manufacturer-support",
    appliesTo: "Maytag front-load washers",
    url: "https://producthelp.maytag.com/Laundry/Washers/Front_Load_Washers/Not_Starting_or_Not_Operating/Not_Spinning/Not_Spinning_-_Front_Load_Washer",
  },
  "maytag-front-leak": {
    publisher: "Maytag",
    kind: "manufacturer-support",
    appliesTo: "Maytag front-load washers",
    url: "https://producthelp.maytag.com/Laundry/Washers/Front_Load_Washers/Leaking/Leaking_from_Underneath_or_Bottom_-_Front_Load_Washer",
  },
  "maytag-top-closure": {
    publisher: "Maytag",
    kind: "manufacturer-support",
    appliesTo: "Maytag top-load washers",
    url: "https://producthelp.maytag.com/Laundry/Washers/Top_Load_Washer/Operation/Not_Operating/Lid_Not_Latching_-_Washer",
  },
  "maytag-top-start": {
    publisher: "Maytag",
    kind: "manufacturer-support",
    appliesTo: "Maytag top-load washers",
    url: "https://producthelp.maytag.com/Laundry/Washers/Top_Load_Washer/Operation/Not_Operating/Not_Starting_-_Washer",
  },
  "maytag-top-spin": {
    publisher: "Maytag",
    kind: "manufacturer-support",
    appliesTo: "Maytag top-load washers",
    url: "https://producthelp.maytag.com/Laundry/Washers/Top_Load_Washer/Cycle_Concerns/Not_Spinning_-_Washer",
  },
  "maytag-top-leak": {
    publisher: "Maytag",
    kind: "manufacturer-support",
    appliesTo: "Maytag top-load washers",
    url: "https://producthelp.maytag.com/Laundry/Washers/Top_Load_Washer/Water/Leaking/Leaking_from_Front_or_Top_-_Washer",
  },
  "whirlpool-top-closure": {
    publisher: "Whirlpool",
    kind: "manufacturer-support",
    appliesTo: "Whirlpool top-load washers",
    url: "https://producthelp.whirlpool.com/Laundry/Washers/Top_Load_Washer/Operation/Not_Operating/Lid_Not_Latching_-_Washer",
  },
  "lg-front-closure": {
    publisher: "LG",
    kind: "manufacturer-support",
    appliesTo: "LG front-load washers",
    url: "https://www.lg.com/us/support/help-library/lg-front-load-washer-error-code-list-CT10000010-20155069413456",
  },
  "electrolux-start": {
    publisher: "Electrolux",
    kind: "manufacturer-support",
    appliesTo: "Electrolux front-load washers",
    url: "https://owner.electrolux.com/support-articles/article/1853594-how-to-fix-your-front-load-washer-not-starting",
  },
  "electrolux-spin-manual-7337": {
    publisher: "Electrolux",
    kind: "manufacturer-manual",
    appliesTo: "ELFW7337AW; linked as Complete Owner's Guide from the exact Electrolux model page",
    url: "https://frigidaire.bynder.com/asset/eba93fb2-1a4d-4766-b03a-81b69b8eba26/A20448610-en-pdf.pdf",
  },
  "electrolux-spin-manual-7437-7738": {
    publisher: "Electrolux",
    kind: "manufacturer-manual",
    appliesTo:
      "ELFW7437AW, ELFW7537AT, ELFW7637AT and ELFW7738AA; each exact Electrolux model page links this Complete Owner's Guide",
    url: "https://frigidaire.bynder.com/m/673fe45bbf48d90f/original/A20448609-en-pdf.pdf",
  },
  "electrolux-leak": {
    publisher: "Electrolux",
    kind: "manufacturer-support",
    appliesTo: "Electrolux front-load washers",
    url: "https://owner.electrolux.com/support-articles/article/1831358-laundry-front-loading-washer-is-leaking-water-",
  },
  "electrolux-closure": {
    publisher: "Electrolux",
    kind: "manufacturer-support",
    appliesTo: "Electrolux front-load washers",
    url: "https://owner.electrolux.com/support-articles/article/1820509-laundry-front-loading-washer-displaying-error-code-e41-door-is-open-",
  },
  "frigidaire-top-closure": {
    publisher: "Frigidaire",
    kind: "manufacturer-support",
    appliesTo: "Frigidaire top-load washers",
    url: "https://owner.frigidaire.com/support-articles/article/1829706-laundry-top-loading-washer-displaying-error-code-e3-washer-lid-open-or-lid-lock-failed-",
  },
  "ge-front-owner-manual": {
    publisher: "GE Appliances",
    kind: "manufacturer-manual",
    appliesTo: "GFW850, GFW655, GFW650 and GFW550 model families named in the manual",
    url: "https://images.salsify.com/image/upload/s--Q2ZqW1dH--/207c3da007ffc1f522fe0a1723081c5d6c09941e.pdf",
  },
  "ge-front-owner-manual-850": {
    publisher: "GE Appliances",
    kind: "manufacturer-manual",
    appliesTo: "GFW850 model family named in the manual",
    url: "https://images.salsify.com/image/upload/s--7SJ2Cn5O--/c7cd23acabd0dde381486804fd70bf93a72f5b8b.pdf",
  },
  "ge-hotpoint-top-owner-manual": {
    publisher: "GE Appliances",
    kind: "manufacturer-manual",
    appliesTo:
      "GTW485, GTW465, GTW385, GTW335, GTW325, HTW265 and HTW240 families named in the manual",
    url: "https://images.salsify.com/image/upload/s--AKgAhUAs--/r4yctjlrytehsjedypih.pdf",
  },
};

for (const source of Object.values(sourceCatalog)) {
  source.lastVerified = verifiedOn;
  source.quality = "primary";
}

const blockedGapReasons = new Map([
  [
    "frigidaire-fffw5000qw__door-will-not-close",
    "No current Frigidaire primary front-load closure article or exact-family manual was located. The top-load E3 article is inapplicable.",
  ],
  [
    "ge-gtw585bsvws__door-will-not-close",
    "The current exact GE support page did not expose a manual or model-applicable closure instruction. The older GTW/HTW manual does not name this family.",
  ],
  [
    "hotpoint-htw2065sbww__door-will-not-close",
    "The exact current support page did not expose a manual or model-applicable closure guidance, and the current HTW240/HTW265 manual does not name HTW2065SBWW.",
  ],
  [
    "hotpoint-htw2065sbww__will-not-start",
    "The exact current support page did not expose a manual or model-applicable start guidance, and the current HTW240/HTW265 manual does not name HTW2065SBWW.",
  ],
  [
    "hotpoint-htw2065sbww__will-not-spin",
    "The exact current support page did not expose a manual or model-applicable spin guidance, and the current HTW240/HTW265 manual does not name HTW2065SBWW.",
  ],
  [
    "hotpoint-htw2065sbww__is-leaking",
    "The exact current support page did not expose a manual or model-applicable leak guidance, and the current HTW240/HTW265 manual does not name HTW2065SBWW.",
  ],
]);

function sourceIdFor(model, symptomId) {
  const suffix = {
    "door-will-not-close": "closure",
    "will-not-start": "start",
    "will-not-spin": "spin",
    "is-leaking": "leak",
  }[symptomId];
  if (model.brand === "Amana")
    return `amana-${model.loadStyle === "front-load" ? "front" : "top"}-${suffix}`;
  if (model.brand === "Maytag")
    return `maytag-${model.loadStyle === "front-load" ? "front" : "top"}-${suffix}`;
  if (model.brand === "Whirlpool") return "whirlpool-top-closure";
  if (model.brand === "LG") return "lg-front-closure";
  if (model.brand === "Electrolux") {
    return {
      "door-will-not-close": "electrolux-closure",
      "will-not-start": "electrolux-start",
      "will-not-spin":
        model.id === "electrolux-elfw7337aw"
          ? "electrolux-spin-manual-7337"
          : "electrolux-spin-manual-7437-7738",
      "is-leaking": "electrolux-leak",
    }[symptomId];
  }
  if (model.brand === "Frigidaire") return "frigidaire-top-closure";
  if (model.brand === "GE") {
    if (model.loadStyle === "front-load") {
      return model.id === "ge-gfw850spnrs" ? "ge-front-owner-manual-850" : "ge-front-owner-manual";
    }
    return "ge-hotpoint-top-owner-manual";
  }
  if (model.brand === "Hotpoint") return "ge-hotpoint-top-owner-manual";
  throw new Error(`No source mapping for ${model.id} ${symptomId}`);
}

const repairCopy = {
  "door-will-not-close": {
    title: "Door or lid will not close",
    checkpoints: [
      "Remove laundry or debris caught in the visible door or lid opening.",
      "Inspect the visible gasket, striker, and latch opening for an obstruction without disassembly.",
      "Close normally without forcing it; if it still will not latch, stop and arrange service.",
    ],
  },
  "will-not-start": {
    title: "Washer will not start",
    checkpoints: [
      "Confirm the door or lid is fully closed and the controls are not locked or on Delay Start.",
      "Choose a cycle and use Start/Pause exactly as labeled on the control panel.",
      "Record any displayed code; do not bypass the latch, reset a breaker, or open the cabinet.",
    ],
  },
  "will-not-spin": {
    title: "Washer will not spin",
    checkpoints: [
      "Pause with the controls and redistribute an overloaded, very small, or visibly unbalanced load.",
      "Confirm the selected cycle includes spin and visually check the accessible drain hose for a kink.",
      "If the symptom persists, stop; internal drive, latch, pump, and electrical checks are professional-only.",
    ],
  },
  "is-leaking": {
    title: "Washer is leaking",
    checkpoints: [
      "Stop the cycle. Keep clear of water near the plug, outlet, cord, or controls.",
      "From a dry, accessible position, look for a caught item at the door seal, dispenser residue, or visible hose damage.",
      "Do not move, level, disconnect, tighten, or open the washer; shut off the water only if safely accessible and arrange service.",
    ],
  },
};

const gapRows = [];
for (const model of washers) {
  const covered = new Set(model.coverage.map((row) => row.symptomId));
  for (const symptomId of symptomIds) {
    if (covered.has(symptomId)) continue;
    const rowId = `${model.id}__${symptomId}`;
    const blockedReason = blockedGapReasons.get(rowId);
    const supportSourceId = blockedReason ? null : sourceIdFor(model, symptomId);
    gapRows.push({
      rowId,
      applianceId: model.id,
      category: "washer",
      brand: model.brand,
      modelFamily: model.model,
      loadStyle: model.loadStyle,
      topology: model.topology,
      symptomId,
      baselineStatus: "unsupported",
      researchOutcome: blockedReason ? "blocked" : "promotable-guided-checks",
      modelIdentitySource: {
        title: model.modelSource.title,
        publisher: model.modelSource.publisher,
        url: model.modelSource.url,
        appliesTo: model.modelSource.appliesTo,
      },
      supportSourceId,
      supportSource: supportSourceId ? sourceCatalog[supportSourceId] : null,
      evidenceStatement: blockedReason
        ? null
        : `The exact model-family identity source and the ${sourceCatalog[supportSourceId].appliesTo} primary guidance intersect for this row. Only the safe visible checks in the draft pack are proposed.`,
      blockedReason: blockedReason || null,
      safetyBoundary: blockedReason
        ? "No guidance is proposed without applicable primary evidence."
        : "Visible, non-invasive observations and control-panel actions only. No panel removal, energized test, latch bypass, breaker reset, appliance movement, leveling, hose disconnection/tightening, or internal part diagnosis.",
      professionalOnly: [
        "cabinet or panel removal",
        "energized or electrical testing",
        "latch bypass or internal latch testing",
        "moving or leveling the appliance",
        "disconnecting or tightening water hoses",
        "internal drive, pump, seal, or wiring work",
      ],
      draftRepairPack: blockedReason ? null : repairCopy[symptomId],
      verifiedOn,
    });
  }
}

const purchaseOutcomeById = {
  "lg-wm3400cw": {
    reason:
      "The exact Encompass variation lists more than one drain-pump assembly record/position; it does not prove one exact replacement SKU.",
    evidenceUrls: ["https://encompass.com/model/ZENWM3400CW/ABWEVUS/"],
    observedSkus: ["AHA75693425", "AHA75693450"],
  },
  "lg-wm4000hwa": {
    reason:
      "No indexed authorized content was located for stored suffix ABWEUUS; the available ABWEEUS listing is a different revision and exposes multiple drain-pump assemblies.",
    evidenceUrls: [
      "https://partstore.encompass.com/model/ZENWM4000HWA/ABWEUUS/",
      "https://partstore.encompass.com/model/ZENWM4000HWA/ABWEEUS/",
    ],
    observedSkus: [],
    rejectedNearbyRevision: "WM4000HWA.ABWEEUS",
  },
  "lg-wt7405cw": {
    reason:
      "No authorized exact listing was located for stored suffix ABWEUUS; the available ABWETUS listing is a different revision and has multiple pump rows.",
    evidenceUrls: [
      "https://partstore.encompass.com/model/ZENWT7405CW/ABWEUUS/",
      "https://partstore.encompass.com/model/ZENWT7405CW/ABWETUS/",
    ],
    observedSkus: [],
    rejectedNearbyRevision: "WT7405CW.ABWETUS",
  },
  "samsung-wf46bg6500av": {
    reason:
      "The complete Samsung identity is current, but no official or authorized page was located that maps WF46BG6500AVUS to exactly one drain-pump SKU.",
    evidenceUrls: [
      "https://www.samsung.com/us/support/service/warranty/WF46BG6500AVUS/",
      "https://samsungparts.com/collections/washer-parts",
    ],
    observedSkus: [],
  },
  "samsung-wa50r5200aw": {
    reason:
      "The complete Samsung identity is current, but no official or authorized page was located that maps WA50R5200AW/US to exactly one drain-pump SKU.",
    evidenceUrls: [
      "https://www.samsung.com/us/support/service/warranty/WA50R5200AW/US/",
      "https://samsungparts.com/collections/washer-parts",
    ],
    observedSkus: [],
  },
  "lg-wm3600hwa": {
    reason:
      "The stored suffix is ABWEUUS, while the current authorized result is ABWEVUS and lists several pump assemblies. Cross-suffix inference is prohibited.",
    evidenceUrls: [
      "https://partstore.encompass.com/model/ZENWM3600HWA/ABWEUUS/",
      "https://partstore.encompass.com/model/ZENWM3600HWA/ABWEVUS/",
    ],
    observedSkus: [],
    rejectedNearbyRevision: "WM3600HWA.ABWEVUS",
  },
  "lg-wm5500hwa": {
    reason:
      "No current authorized exact listing was located for ABWEUUS. The available ASSEVUS evidence is a different color/revision and cannot be borrowed.",
    evidenceUrls: [
      "https://partstore.encompass.com/model/ZENWM5500HWA/ABWEUUS/",
      "https://partstore.encompass.com/model/ZENWM5500HVA/ASSEVUS/",
    ],
    observedSkus: [],
    rejectedNearbyRevision: "WM5500HVA.ASSEVUS",
  },
  "lg-wt6105cw": {
    reason:
      "The exact BBWETUS listing contains at least two drain-pump assembly SKUs, without an explicit one-SKU replacement/supersession rule.",
    evidenceUrls: ["https://partstore.encompass.com/model/ZENWT6105CW/BBWETUS/"],
    observedSkus: ["AGF30196101", "AHA75673404"],
  },
  "lg-wt7150cw": {
    reason:
      "No current authorized exact-revision page was located that maps ABWETUS to one drain-pump SKU.",
    evidenceUrls: [
      "https://www.lg.com/us/support/product/lg-WT7150CW.ABWETUS",
      "https://partstore.encompass.com/model/ZENWT7150CW/ABWETUS/",
    ],
    observedSkus: [],
  },
  "lg-wt7300cw": {
    reason:
      "No authorized exact listing was located for ABWEUCI; nearby ABWETUS and ABWEUUS pages show multiple pump assemblies and cannot establish this revision.",
    evidenceUrls: [
      "https://partstore.encompass.com/model/ZENWT7300CW/ABWEUCI/",
      "https://partstore.encompass.com/model/ZENWT7300CW/ABWETUS/",
      "https://partstore.encompass.com/model/ZENWT7300CW/ABWEUUS/",
    ],
    observedSkus: [],
    rejectedNearbyRevision: "WT7300CW.ABWETUS / WT7300CW.ABWEUUS",
  },
  "lg-wm4000hba": {
    reason:
      "The exact ABLEVUS listing contains two drain-pump assembly SKU rows and no explicit supersession selecting one exact replacement.",
    evidenceUrls: ["https://partstore.encompass.com/model/ZENWM4000HBA/ABLEVUS/"],
    observedSkus: ["AHA75853816", "AHA75853813"],
  },
};

const purchaseRows = washers
  .filter((model) => !model.coverage.some((row) => row.capability === "purchase-ready"))
  .map((model) => {
    const completeCodes = model.verifiedProductCodes;
    const exactReview = purchaseOutcomeById[model.id];
    if (completeCodes.length > 0 && !exactReview) {
      throw new Error(`Missing exact purchase review for ${model.id}`);
    }
    const identityGate = completeCodes.length > 0 ? "complete-code" : "family-only";
    return {
      applianceId: model.id,
      category: "washer",
      brand: model.brand,
      modelFamily: model.model,
      completeProductCodes: completeCodes,
      identityGate,
      fitProofOutcome: "blocked",
      fitProofReason:
        exactReview?.reason ||
        "No complete rating-label revision is stored, so exact SKU research is not permitted.",
      modelIdentitySource: model.modelSource,
      fitEvidenceUrls: exactReview?.evidenceUrls || [],
      observedCandidateSkus: exactReview?.observedSkus || [],
      rejectedNearbyRevision: exactReview?.rejectedNearbyRevision || null,
      shopifyOfferSearch: {
        eligible: false,
        performed: false,
        reason:
          "Shopify discovery is downstream of exact complete-code to one-SKU fit proof; this identity did not pass that gate.",
        candidates: [],
      },
      promotable: false,
      verifiedOn,
    };
  });

function countBy(rows, key) {
  return Object.fromEntries(
    [...new Set(rows.map((row) => row[key]))]
      .sort()
      .map((value) => [value, rows.filter((row) => row[key] === value).length]),
  );
}

const promotedGapRows = gapRows.filter((row) => row.researchOutcome === "promotable-guided-checks");
const blockedGapRows = gapRows.filter((row) => row.researchOutcome === "blocked");
const purchaseReadyRows = washers.filter((model) =>
  model.coverage.some((row) => row.capability === "purchase-ready"),
);
const supportedPairs = washers.reduce((sum, model) => sum + model.coverage.length, 0);

const gapReview = {
  schemaVersion: 1,
  category: "washer",
  verifiedOn,
  methodology: {
    baseline: "Current composed APPLIANCE_CATALOG in this worktree.",
    evidenceRule:
      "Current primary manufacturer model pages, manuals, and support articles only; no brand-neighbor or model-neighbor inference.",
    applicabilityRule:
      "Every promoted row requires exact model-family identity plus a same-brand source that explicitly applies to the model family or its front-/top-load topology.",
    safetyRule:
      "Only the intersection of source guidance with Clunk's non-invasive safety boundary is retained.",
  },
  counts: {
    washerIdentities: washers.length,
    totalPossiblePairs: washers.length * symptomIds.length,
    baselineSupportedPairs: supportedPairs,
    reviewedGaps: gapRows.length,
    promotableGuidedCheckRows: promotedGapRows.length,
    blockedRows: blockedGapRows.length,
    bySymptom: Object.fromEntries(
      symptomIds.map((symptomId) => [
        symptomId,
        {
          gaps: gapRows.filter((row) => row.symptomId === symptomId).length,
          promotable: promotedGapRows.filter((row) => row.symptomId === symptomId).length,
          blocked: blockedGapRows.filter((row) => row.symptomId === symptomId).length,
        },
      ]),
    ),
    promotableByBrand: countBy(promotedGapRows, "brand"),
  },
  sources: sourceCatalog,
  records: gapRows,
};

const purchaseReview = {
  schemaVersion: 1,
  category: "washer",
  verifiedOn,
  methodology: {
    exactFitGate: "complete rating-label product code -> one exact drain-pump SKU",
    offerGate: "Only after exact fit proof may a live Shopify seller offer be considered.",
    replacementGate:
      "Multiple pump rows, adjacent revisions, historical candidates, and implicit supersessions are blocked.",
  },
  baseline: {
    identities: washers.length,
    purchaseReadyIdentities: purchaseReadyRows.length,
    nonPurchaseReadyIdentities: purchaseRows.length,
    nonPurchaseReadyFamilyOnly: purchaseRows.filter((row) => row.identityGate === "family-only")
      .length,
    nonPurchaseReadyCompleteCode: purchaseRows.filter((row) => row.identityGate === "complete-code")
      .length,
  },
  outcome: {
    newExactFitProofs: purchaseRows.filter((row) => row.fitProofOutcome === "proved").length,
    newPurchasePromotions: purchaseRows.filter((row) => row.promotable).length,
    shopifyEligibleIdentities: purchaseRows.filter((row) => row.shopifyOfferSearch.eligible).length,
    shopifySearchesPerformed: purchaseRows.filter((row) => row.shopifyOfferSearch.performed).length,
    sellerCandidatesAccepted: purchaseRows.reduce(
      (sum, row) => sum + row.shopifyOfferSearch.candidates.length,
      0,
    ),
  },
  records: purchaseRows,
};

const implementation = {
  schemaVersion: 1,
  category: "washer",
  verifiedOn,
  status: "integration-ready-research-data-not-runtime-wired",
  safetyBoundary:
    "Guided checks only. These rows must not create purchase cards or diagnose internal parts.",
  records: promotedGapRows.map((row) => ({
    applianceId: row.applianceId,
    symptomId: row.symptomId,
    capability: "guided-checks",
    title: row.draftRepairPack.title,
    checkpoints: row.draftRepairPack.checkpoints,
    stopConditions: [
      "Water is near the plug, outlet, cord, controls, or another electrical source.",
      "A step would require moving, opening, bypassing, disconnecting, tightening, or testing the washer.",
      "The visible checks do not resolve the symptom.",
    ],
    supportSourceId: row.supportSourceId,
    supportSourceUrl: row.supportSource.url,
    modelIdentitySourceUrl: row.modelIdentitySource.url,
    evidenceTier: "primary-guided-checks",
  })),
};

const auditRecords = [];
const seenUrls = new Set();
for (const row of gapRows) {
  const sources = [
    {
      role: "model-identity",
      publisher: row.modelIdentitySource.publisher,
      url: row.modelIdentitySource.url,
      appliesTo: row.modelFamily,
    },
    ...(row.supportSource ? [{ role: "symptom-guidance", ...row.supportSource }] : []),
  ];
  for (const source of sources) {
    const key = `${source.role}__${source.url}`;
    if (seenUrls.has(key)) continue;
    seenUrls.add(key);
    auditRecords.push({
      category: "washer",
      role: source.role,
      publisher: source.publisher,
      url: source.url,
      appliesTo: source.appliesTo,
      domain: new URL(source.url).hostname,
      primaryManufacturerEvidence: true,
      reviewedOn: verifiedOn,
      reviewObservation:
        source.role === "symptom-guidance"
          ? "Content/applicability reviewed; row-level safety intersection recorded in the gap ledger."
          : "Exact family identity source from the current catalog; paired with row-level symptom evidence.",
    });
  }
}

for (const row of purchaseRows.filter((item) => item.identityGate === "complete-code")) {
  for (const url of row.fitEvidenceUrls) {
    const key = `exact-fit-review__${url}`;
    if (seenUrls.has(key)) continue;
    seenUrls.add(key);
    const domain = new URL(url).hostname;
    const isManufacturer = domain.endsWith("lg.com") || domain.endsWith("samsung.com");
    auditRecords.push({
      category: "washer",
      role: "exact-fit-review",
      publisher: isManufacturer
        ? domain.endsWith("lg.com")
          ? "LG"
          : "Samsung"
        : domain.endsWith("samsungparts.com")
          ? "Samsung Parts"
          : "Encompass / PartStore",
      url,
      appliesTo: `${row.completeProductCodes.join(" | ")} exact-fit review`,
      domain,
      primaryManufacturerEvidence: isManufacturer,
      authorizedFitEvidence: !isManufacturer,
      reviewedOn: verifiedOn,
      reviewObservation: `Blocked: ${row.fitProofReason}`,
    });
  }
}

const sourceAudit = {
  schemaVersion: 1,
  category: "washer",
  verifiedOn,
  note: "HTTP automation status is not treated as evidence quality: several manufacturer sites use bot protection. Run validate-washer-research.mjs --network for a fresh best-effort reachability snapshot.",
  records: auditRecords,
};

function csvEscape(value) {
  const rendered = Array.isArray(value) ? value.join("|") : value == null ? "" : String(value);
  return /[",\n]/.test(rendered) ? `"${rendered.replaceAll('"', '""')}"` : rendered;
}

function writeCsv(filename, headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  writeFileSync(join(researchDir, filename), `${lines.join("\n")}\n`);
}

writeFileSync(
  join(researchDir, "model-symptom-gap-review.json"),
  `${JSON.stringify(gapReview, null, 2)}\n`,
);
writeFileSync(
  join(researchDir, "purchase-readiness-review.json"),
  `${JSON.stringify(purchaseReview, null, 2)}\n`,
);
writeFileSync(join(researchDir, "source-audit.json"), `${JSON.stringify(sourceAudit, null, 2)}\n`);
writeFileSync(
  join(implementationDir, "washerSymptomCoverage.json"),
  `${JSON.stringify(implementation, null, 2)}\n`,
);

writeCsv(
  "model-symptom-gap-review.csv",
  [
    "rowId",
    "applianceId",
    "brand",
    "modelFamily",
    "loadStyle",
    "symptomId",
    "researchOutcome",
    "supportSourceId",
    "supportSourceUrl",
    "blockedReason",
  ],
  gapRows.map((row) => ({ ...row, supportSourceUrl: row.supportSource?.url || "" })),
);
writeCsv(
  "purchase-readiness-review.csv",
  [
    "applianceId",
    "brand",
    "modelFamily",
    "completeProductCodes",
    "identityGate",
    "fitProofOutcome",
    "fitProofReason",
    "observedCandidateSkus",
    "rejectedNearbyRevision",
    "shopifyEligible",
    "shopifySearchPerformed",
  ],
  purchaseRows.map((row) => ({
    ...row,
    shopifyEligible: row.shopifyOfferSearch.eligible,
    shopifySearchPerformed: row.shopifyOfferSearch.performed,
  })),
);
writeCsv(
  "source-audit.csv",
  [
    "category",
    "role",
    "publisher",
    "domain",
    "url",
    "appliesTo",
    "primaryManufacturerEvidence",
    "authorizedFitEvidence",
    "reviewedOn",
    "reviewObservation",
  ],
  auditRecords,
);

const report = `# Washer demo-readiness evidence review

Verified: ${verifiedOn}

## Outcome

- Current catalog: **${washers.length} washer identities** and **${supportedPairs}/${washers.length * symptomIds.length} supported model × symptom pairs**.
- Reviewed: **${gapRows.length} remaining gaps**.
- Promotable to guided checks: **${promotedGapRows.length}**.
- Still blocked: **${blockedGapRows.length}**.
- Current purchase-ready baseline: **${purchaseReadyRows.length}/${washers.length} identities**.
- Reviewed every non-purchase-ready identity: **${purchaseRows.length}** (${purchaseRows.filter((row) => row.identityGate === "family-only").length} family-only; ${purchaseRows.filter((row) => row.identityGate === "complete-code").length} complete-code).
- New exact one-SKU fit proofs: **0**. New Shopify searches: **0**, because no identity passed the exact-fit gate.

## Promotable symptom rows

| Symptom | Gaps | Promotable | Blocked |
|---|---:|---:|---:|
${symptomIds
  .map((id) => {
    const rows = gapRows.filter((row) => row.symptomId === id);
    return `| ${id} | ${rows.length} | ${rows.filter((row) => row.researchOutcome.startsWith("promotable")).length} | ${rows.filter((row) => row.researchOutcome === "blocked").length} |`;
  })
  .join("\n")}

Promotable by brand: ${Object.entries(countBy(promotedGapRows, "brand"))
  .map(([brand, count]) => `${brand} ${count}`)
  .join(", ")}.

## Blocked symptom rows

${blockedGapRows.map((row) => `- \`${row.rowId}\` — ${row.blockedReason}`).join("\n")}

No blocked row borrows evidence from a neighboring model, revision, topology, or brand.

## Purchase review

The 30 family-only identities stop at the complete-code gate. The 11 complete-code identities were reviewed individually; all remain blocked because the current evidence either names multiple pump SKUs, is for a different suffix, or does not provide an exact one-SKU map. Therefore Shopify seller discovery was neither eligible nor run. The row ledger contains each exact outcome and rejected nearby-revision evidence.

## Safety boundary

The proposed guided checks retain only visible observations, ordinary control-panel actions, and load redistribution. They exclude cabinet/panel removal, energized tests, breaker resets, latch bypass, appliance movement/leveling, hose disconnection/tightening, internal diagnosis, and repair instructions. Water near any electrical source is an immediate stop condition. Internal latch, drive, pump, seal, and wiring work remains professional-only.

## Integration note

\`src/data/demoReady/washerSymptomCoverage.json\` contains the ${promotedGapRows.length} category-isolated, integration-ready rows. It is intentionally not wired into the shared catalog in this stream.
`;

writeFileSync(join(researchDir, "REPORT.md"), report);

console.log(
  JSON.stringify(
    {
      washerIdentities: washers.length,
      supportedPairs,
      reviewedGaps: gapRows.length,
      promotable: promotedGapRows.length,
      blocked: blockedGapRows.length,
      purchaseReadyBaseline: purchaseReadyRows.length,
      purchaseReviewed: purchaseRows.length,
      exactPurchaseReviewed: purchaseRows.filter((row) => row.identityGate === "complete-code")
        .length,
      newPurchasePromotions: 0,
    },
    null,
    2,
  ),
);
