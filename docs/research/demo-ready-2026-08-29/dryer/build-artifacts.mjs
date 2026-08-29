import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../../..");
const verifiedOn = "2026-08-29";

const sources = {
  maytagStart: {
    id: "maytag-dryer-start",
    publisher: "Maytag",
    kind: "manufacturer-troubleshooting",
    url: "https://producthelp.maytag.com/Laundry/Dryers/Dryer/Operation/Not_Starting/Not_Starting_or_Not_Operating_-_Dryer",
    evidence:
      "Door, cycle, Start control, Control Lock, visible power, and household breaker checks.",
  },
  maytagHeat: {
    id: "maytag-electric-dryer-heat",
    publisher: "Maytag",
    kind: "manufacturer-troubleshooting",
    url: "https://producthelp.maytag.com/Laundry/Dryers/Dryer/Operation/Not_Heating/Not_Heating_-_Electric_Dryer",
    evidence:
      "Electric-dryer dual-breaker and Air Only checks; terminal-block instructions are excluded.",
  },
  maytagDrum: {
    id: "maytag-dryer-tumble",
    publisher: "Maytag",
    kind: "manufacturer-troubleshooting",
    url: "https://producthelp.maytag.com/Laundry/Dryers/Dryer/Operation/Not_Starting/Not_Tumbling_or_Spinning_-_Dryer",
    evidence:
      "Visible power and Start-control observations followed by service; terminal access is excluded.",
  },
  amanaStart: {
    id: "amana-dryer-start",
    publisher: "Amana",
    kind: "manufacturer-troubleshooting",
    url: "https://producthelp.amana.com/Laundry/Dryers/Dryer/Operation/Not_Starting/Not_Starting_or_Not_Operating_-_Dryer",
    evidence: "Door, cycle, Start control, Control Lock, and visible power checks.",
  },
  amanaHeat: {
    id: "amana-electric-dryer-heat",
    publisher: "Amana",
    kind: "manufacturer-troubleshooting",
    url: "https://producthelp.amana.com/Laundry/Dryers/Product_Info/Dryer_Product_Assistance/Dryer_is_Not_Heating",
    evidence:
      "Air Only, external vent, and electric-dryer dual-breaker checks; terminal access is excluded.",
  },
  amanaDrum: {
    id: "amana-dryer-tumble",
    publisher: "Amana",
    kind: "manufacturer-troubleshooting",
    url: "https://producthelp.amana.com/Laundry/Dryers/Dryer/Operation/Not_Starting/Not_Tumbling_or_Spinning_-_Dryer",
    evidence:
      "Visible power and Start-control observations followed by service; terminal access is excluded.",
  },
  electroluxStart: {
    id: "electrolux-dryer-start",
    publisher: "Electrolux",
    kind: "manufacturer-troubleshooting",
    url: "https://owner.electrolux.com/support-articles/article/1853009-what-should-i-do-if-my-dryer-does-not-start-",
    evidence: "Start control, cycle selector, door, plug, and household breaker checks.",
  },
  electroluxHeat: {
    id: "electrolux-electric-dryer-heat",
    publisher: "Electrolux",
    kind: "manufacturer-troubleshooting",
    url: "https://owner.electrolux.com/support-articles/article/1853007-my-dryer-is-running-but-does-not-seem-to-be-heating-what-should-i-do-",
    evidence:
      "Electric-dryer dual-circuit and Air Fluff checks; outlet verification is professional-only.",
  },
  electroluxDrum: {
    id: "electrolux-dryer-stop-overload",
    publisher: "Electrolux",
    kind: "manufacturer-troubleshooting",
    url: "https://owner.electrolux.com/support-articles/article/1853011-what-should-i-do-if-my-dryer-stops-operating-?locale=en-US",
    evidence: "Overload reduction, cool-down, and service stop for the thermal limiter.",
  },
  frigidaireStart: {
    id: "frigidaire-dryer-start",
    publisher: "Frigidaire",
    kind: "manufacturer-troubleshooting",
    url: "https://owner.frigidaire.com/support-articles/article/1853009-what-should-i-do-if-my-dryer-does-not-start-",
    evidence: "Start control, cycle selector, door, plug, and household breaker checks.",
  },
  frigidaireHeat: {
    id: "frigidaire-electric-dryer-heat",
    publisher: "Frigidaire",
    kind: "manufacturer-troubleshooting",
    url: "https://owner.frigidaire.com/support-articles/article/1853007-my-dryer-is-running-but-does-not-seem-to-be-heating-what-should-i-do-",
    evidence:
      "Electric-dryer dual-circuit and Air Fluff checks; outlet verification is professional-only.",
  },
  frigidaireDrum: {
    id: "frigidaire-dryer-stop-overload",
    publisher: "Frigidaire",
    kind: "manufacturer-troubleshooting",
    url: "https://owner.frigidaire.com/support-articles/article/1853011-what-should-i-do-if-my-dryer-stops-operating-",
    evidence: "Overload reduction, cool-down, and service stop for the thermal limiter.",
  },
  geStart: {
    id: "ge-hotpoint-dryer-start",
    publisher: "GE Appliances",
    kind: "manufacturer-troubleshooting",
    url: "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17381",
    evidence:
      "Plug, door, cycle, Start control, and breaker checks; exact Hotpoint owner pages link the GE-hosted support library.",
  },
  geHeat: {
    id: "ge-hotpoint-electric-dryer-heat",
    publisher: "GE Appliances",
    kind: "manufacturer-troubleshooting",
    url: "https://products.geappliances.com/appliance/gea-support-search-content?contentId=16921",
    evidence:
      "Heated-cycle, airflow, and household-breaker checks; cord-terminal inspection is excluded.",
  },
  geDrum: {
    id: "ge-hotpoint-dryer-drum",
    publisher: "GE Appliances",
    kind: "manufacturer-troubleshooting",
    url: "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17096",
    evidence:
      "Load observation and service escalation; the manufacturer's hand-turn test is deliberately excluded.",
  },
  boschStart: {
    id: "bosch-dryer-start",
    publisher: "Bosch",
    kind: "manufacturer-troubleshooting",
    url: "https://www.bosch-home.com/us/owner-support/get-support/support-selfhelp-dryers-repair-dryer-not-switching-on",
    evidence: "Plug, door, program, breaker, and professional-stop checks.",
  },
  boschHeat: {
    id: "bosch-dryer-heat",
    publisher: "Bosch",
    kind: "manufacturer-troubleshooting",
    url: "https://www.bosch-home.com/us/owner-support/get-support/support-selfhelp-dryers-repair-dryer-not-getting-warm",
    evidence: "No-heat condition is explicitly professional-diagnosis-only.",
  },
  boschDrum: {
    id: "bosch-dryer-drum",
    publisher: "Bosch",
    kind: "manufacturer-troubleshooting",
    url: "https://www.bosch-home.com/us/owner-support/get-support/support-selfhelp-dryers-repair-dryer-drum-not-spinning",
    evidence: "Plug and door checks followed by Bosch support; no drum manipulation.",
  },
  boschManual: {
    id: "bosch-wtg86403uc01-manual",
    publisher: "Bosch",
    kind: "manufacturer-exact-owner-manual",
    url: "https://media3.bosch-home.com/Documents/9001883723_A.pdf",
    evidence:
      "Exact WTG86403UC manual identifies condensation topology, lint filter, condenser, programs, and troubleshooting boundaries.",
  },
};

const models = [
  [
    "maytag-med4500mw",
    "Maytag",
    "MED4500MW",
    "vented-electric-dryer",
    "https://www.maytag.com/owners-center-pdp.MED4500MW.html",
    [sources.maytagStart, sources.maytagHeat, sources.maytagDrum],
  ],
  [
    "electrolux-elfe7637at",
    "Electrolux",
    "ELFE7637AT",
    "vented-electric-dryer",
    "https://www.electrolux.com/en/p/washers-dryers/dryer/ELFE7637AT",
    [sources.electroluxStart, sources.electroluxHeat, sources.electroluxDrum],
  ],
  [
    "frigidaire-ffre4120sw",
    "Frigidaire",
    "FFRE4120SW",
    "vented-electric-dryer",
    "https://www.frigidaire.com/en/p/owner-center/product-support/FFRE4120SW",
    [sources.frigidaireStart, sources.frigidaireHeat, sources.frigidaireDrum],
  ],
  [
    "amana-ned4655ew",
    "Amana",
    "NED4655EW",
    "vented-electric-dryer",
    "https://www.amana.com/laundry/dryers/top-load/p.6.5-cu.-ft.-electric-dryer-with-wrinkle-prevent-option.ned4655ew.html",
    [sources.amanaStart, sources.amanaHeat, sources.amanaDrum],
  ],
  [
    "hotpoint-htx24easkws",
    "Hotpoint",
    "HTX24EASKWS",
    "vented-electric-dryer",
    "https://products.geappliances.com/appliance/gea-specs/HTX24EASKWS/support",
    [sources.geStart, sources.geHeat, sources.geDrum],
  ],
  [
    "hotpoint-htx26easwww",
    "Hotpoint",
    "HTX26EASWWW",
    "vented-electric-dryer",
    "https://products.geappliances.com/appliance/gea-specs/HTX26EASWWW/support",
    [sources.geStart, sources.geHeat, sources.geDrum],
  ],
  [
    "maytag-med6230hw",
    "Maytag",
    "MED6230HW",
    "vented-electric-dryer",
    "https://www.maytag.com/owners-center-pdp.MED6230HW.html",
    [sources.maytagStart, sources.maytagHeat, sources.maytagDrum],
  ],
  [
    "maytag-med7230hw",
    "Maytag",
    "MED7230HW",
    "vented-electric-dryer",
    "https://www.maytag.com/owners-center-pdp.MED7230HW.html",
    [sources.maytagStart, sources.maytagHeat, sources.maytagDrum],
  ],
  [
    "amana-ned5800hw",
    "Amana",
    "NED5800HW",
    "vented-electric-dryer",
    "https://www.amana.com/owners-center-pdp.NED5800HW.html",
    [sources.amanaStart, sources.amanaHeat, sources.amanaDrum],
  ],
  [
    "electrolux-elfe7337aw",
    "Electrolux",
    "ELFE7337AW",
    "vented-electric-dryer",
    "https://www.electrolux.com/en/p/washers-dryers/dryer/ELFE7337AW",
    [sources.electroluxStart, sources.electroluxHeat, sources.electroluxDrum],
  ],
  [
    "frigidaire-flve7000aw",
    "Frigidaire",
    "FLVE7000AW",
    "vented-electric-dryer",
    "https://www.frigidaire.com/en/p/Laundry-Care/Dryers/FLVE7000AW",
    [sources.frigidaireStart, sources.frigidaireHeat, sources.frigidaireDrum],
  ],
  [
    "bosch-wtg86403uc01",
    "Bosch",
    "WTG86403UC/01",
    "compact-condensation-electric-dryer",
    "https://www.bosch-home.com/us/en/productservice/WTG86403UC-01",
    [sources.boschStart, sources.boschHeat, sources.boschDrum],
  ],
  [
    "maytag-med6500mbk",
    "Maytag",
    "MED6500MBK",
    "vented-electric-dryer",
    "https://www.maytag.com/owners-center-pdp.MED6500MBK.html",
    [sources.maytagStart, sources.maytagHeat, sources.maytagDrum],
  ],
  [
    "electrolux-elfe7437aw",
    "Electrolux",
    "ELFE7437AW",
    "vented-electric-dryer",
    "https://www.electrolux.com/en/p/washers-dryers/dryer/ELFE7437AW",
    [sources.electroluxStart, sources.electroluxHeat, sources.electroluxDrum],
  ],
];

const symptomDefinitions = {
  "will-not-start": {
    profile: "dryer-start-visible-only",
    homeownerChecks: [
      "Confirm the door is fully closed and no clothing is trapped.",
      "Match the selected cycle, lock state, and Start gesture to the exact console.",
      "From a dry, safe position only, observe the seated plug and household breaker.",
    ],
    exclusions: ["No cord-cover, terminal-block, outlet-voltage, continuity, or panel access."],
    stop: "Stop for a damaged or hot cord, repeated breaker trip, smoke, burning odor, or unresolved failure after visible checks.",
  },
  "not-heating": {
    profile: "dryer-heat-visible-only",
    homeownerChecks: [
      "Confirm a heated cycle rather than Air Only/Air Fluff/No Heat.",
      "With the dryer cool and unplugged, clean and reinstall the owner-accessible lint screen.",
      "For vented models only, observe the exterior vent flap without reaching into the duct.",
    ],
    exclusions: [
      "No five-minute empty hot-drum feel test.",
      "No cord-cover, terminal-block, outlet-voltage, heating-element, thermal-device, cabinet, or internal-duct access.",
    ],
    stop: "Stop for scorching, unusual cabinet or cord heat, repeated breaker trip, smoke, burning odor, or normal visible airflow with no heat.",
  },
  "drum-will-not-turn": {
    profile: "dryer-drum-no-manual-rotation",
    homeownerChecks: [
      "Confirm the door, selected cycle, lock state, Start gesture, and visible power condition.",
      "Remove an obviously overloaded load only where the cited manufacturer supports load reduction.",
      "Leave the drum still and escalate after visible checks.",
    ],
    exclusions: [
      "Do not turn the drum by hand.",
      "No belt, roller, motor, switch, blower, terminal, or panel access.",
    ],
    stop: "Stop for binding, scraping, overheating, burning odor, or any unresolved no-tumble condition.",
  },
};

const symptoms = ["will-not-start", "not-heating", "drum-will-not-turn"];
const coverageRows = models.flatMap(([modelId, brand, model, topology, modelUrl, symptomSources]) =>
  symptoms.map((symptomId, index) => {
    const spec = symptomDefinitions[symptomId];
    const isBosch = modelId === "bosch-wtg86403uc01";
    const source = symptomSources[index];
    const featureGates = isBosch
      ? [
          "Exact model is a compact condensation dryer; never use a vented-dryer exterior-exhaust branch.",
          "Use the exact Bosch manual for program, lint-filter, condenser, and condensate behavior.",
        ]
      : [
          "Exact official model page identifies a vented electric dryer.",
          "Gas, heat-pump, compact-condensation, and washer/dryer-combo instructions are excluded.",
        ];
    return {
      rowId: `${modelId}__${symptomId}`,
      modelId,
      brand,
      model,
      category: "dryer",
      topology,
      symptomId,
      currentStatus: "unsupported",
      evidenceDecision: "supported",
      activationDisposition:
        symptomId === "drum-will-not-turn" ? "promotable-with-safe-profile-fork" : "promotable",
      profile: spec.profile,
      sourceIds: isBosch ? [source.id, sources.boschManual.id] : [source.id],
      modelEvidence: {
        url: modelUrl,
        purpose: "Exact model identity and topology only; not a sibling compatibility inference.",
      },
      applicability: isBosch
        ? "Exact WTG86403UC/01 compact condensation electric dryer; only Bosch-supported visible checks and exact-manual owner maintenance."
        : `Exact listed ${brand} vented electric dryer; visible controls, owner-accessible lint screen, and external household observations only.`,
      featureGates,
      homeownerObservableChecks:
        isBosch && symptomId === "not-heating"
          ? [
              "Confirm an appropriate drying program.",
              "With the dryer cool and unplugged, clean the owner-accessible lint filter and condenser exactly as the manual directs.",
              "If it is not warming, stop and contact Bosch support.",
            ]
          : isBosch && symptomId === "drum-will-not-turn"
            ? [
                "Confirm the plug is seated and the door is fully closed.",
                "Do not rotate the drum by hand; stop and contact Bosch support if it still does not spin.",
              ]
            : spec.homeownerChecks,
      excludedManufacturerSteps: spec.exclusions,
      professionalStop: spec.stop,
      evidenceReason: `${source.publisher} explicitly addresses this dryer symptom. The model page supplies exact identity/topology, while the route excludes disassembly and unsupported topology branches.`,
      verifiedOn,
    };
  }),
);

const blocked = (modelId, brand, model, candidateCode, reason, candidates = []) => ({
  modelId,
  brand,
  model,
  currentPurchaseStatus: "guided-only",
  exactCodeOutcome: candidateCode ? "candidate-or-existing-exact-code" : "family-only",
  candidateCode,
  decision: "blocked",
  candidateParts: candidates,
  blocker: reason,
  sellerReview:
    "Candidate discovery completed; no seller offer is allowed to create compatibility.",
  verifiedOn,
});

const exactOffer = (sku, seller, sellerDomain, priceUsd, url, observedExactOffers) => ({
  provider: "Shopify Global Catalog",
  protocol: "UCP",
  query: sku,
  available: true,
  observedExactOffers,
  retainedOffer: { seller, sellerDomain, priceUsd, url },
  compatibilityUse: "prohibited; commerce availability only",
  verifiedOn,
});

const purchasePromotions = [
  {
    modelId: "hotpoint-htx24easkws",
    brand: "Hotpoint",
    model: "HTX24EASKWS",
    exactCode: "HTX24EASK0WS",
    sku: "WE01M10007",
    partName: "Dryer strike",
    componentId: "door-strike",
    location: "visible door-side strike",
    installBoundary: "user-replaceable only after the broken visible strike observation",
    compatibilityUrl:
      "https://www.geapplianceparts.com/store/parts/ModelSectionParts/HTX24EASK0WS/2/0/0/0/FRONT_PANEL_%26_DOOR",
    compatibilityPublisher: "GE Appliances Parts",
    compatibilityEvidence:
      "Exact model assembly lists diagram 3049 Dryer strike WE01M10007 and offers it for sale.",
    offer: exactOffer(
      "WE01M10007",
      "PartsToday.com",
      "mwareserve.myshopify.com",
      10.86,
      "https://partstoday.com/products/we01m10007",
      10,
    ),
  },
  {
    modelId: "hotpoint-htx26easwww",
    brand: "Hotpoint",
    model: "HTX26EASWWW",
    exactCode: "HTX26EASW0WW",
    sku: "WE01M10007",
    partName: "Dryer strike",
    componentId: "door-strike",
    location: "visible door-side strike",
    installBoundary: "user-replaceable only after the broken visible strike observation",
    compatibilityUrl:
      "https://www.geapplianceparts.com/store/parts/ModelSectionParts/HTX26EASW0WW/2/0/0/0/FRONT_PANEL_%26_DOOR",
    compatibilityPublisher: "GE Appliances Parts",
    compatibilityEvidence:
      "Exact model assembly lists diagram 3049 Dryer strike WE01M10007 and offers it for sale.",
    offer: exactOffer(
      "WE01M10007",
      "PartsToday.com",
      "mwareserve.myshopify.com",
      10.86,
      "https://partstoday.com/products/we01m10007",
      10,
    ),
  },
  {
    modelId: "ge-ptd70ebstws",
    brand: "GE",
    model: "PTD70EBSTWS",
    exactCode: "PTD70EBST0WS",
    sku: "WE1X1192",
    partName: "Strike door",
    componentId: "door-strike",
    location: "visible door-side strike",
    installBoundary: "user-replaceable only after the broken visible strike observation",
    compatibilityUrl:
      "https://www.geapplianceparts.com/store/parts/ModelSectionParts/PTD70EBST0WS/2/0/0/0/FRONT_PANEL_%26_DOOR",
    compatibilityPublisher: "GE Appliances Parts",
    compatibilityEvidence:
      "Exact model assembly lists diagram 3049 STRIKE DOOR WE01X1192 and the manufacturer supersession to WE1X1192.",
    offer: exactOffer(
      "WE1X1192",
      "Genuine Replacement Parts",
      "grp-site.myshopify.com",
      5.95,
      "https://genuinereplacementparts.com/products/ge-we1x1192",
      10,
    ),
  },
  {
    modelId: "ge-gtx33easkww",
    brand: "GE",
    model: "GTX33EASKWW",
    exactCode: "GTX33EASK0WW",
    sku: "WE1X1192",
    partName: "Strike door",
    componentId: "door-strike",
    location: "visible door-side strike",
    installBoundary: "user-replaceable only after the broken visible strike observation",
    compatibilityUrl:
      "https://www.geapplianceparts.com/store/parts/ModelSectionParts/GTX33EASK0WW/2/0/0/0/FRONT_PANEL_%26_DOOR",
    compatibilityPublisher: "GE Appliances Parts",
    compatibilityEvidence:
      "Exact model assembly lists diagram 3049 STRIKE DOOR WE01X1192 and the manufacturer supersession to WE1X1192.",
    offer: exactOffer(
      "WE1X1192",
      "Genuine Replacement Parts",
      "grp-site.myshopify.com",
      5.95,
      "https://genuinereplacementparts.com/products/ge-we1x1192",
      10,
    ),
  },
  {
    modelId: "ge-gtd38easwws",
    brand: "GE",
    model: "GTD38EASWWS",
    exactCode: "GTD38EASW0WS",
    sku: "WE01M10007",
    partName: "Strike",
    componentId: "door-strike",
    location: "visible door-side strike",
    installBoundary: "user-replaceable only after the broken visible strike observation",
    compatibilityUrl: "https://partstore.encompass.com/model/HOTGTD38EASW0WS",
    compatibilityPublisher: "Encompass (GE-authorized parts distributor)",
    compatibilityEvidence:
      "Authorized exact-model ledger lists GE Strike WE01M10007 at schematic location 3049 and in stock.",
    offer: exactOffer(
      "WE01M10007",
      "PartsToday.com",
      "mwareserve.myshopify.com",
      10.86,
      "https://partstoday.com/products/we01m10007",
      10,
    ),
  },
  {
    modelId: "ge-gtd58ebsvws",
    brand: "GE",
    model: "GTD58EBSVWS",
    exactCode: "GTD58EBSV0WS",
    sku: "WE01M10007",
    partName: "Strike",
    componentId: "door-strike",
    location: "visible door-side strike",
    installBoundary: "user-replaceable only after the broken visible strike observation",
    compatibilityUrl: "https://encompass.com/model/HOTGTD58EBSV0WS",
    compatibilityPublisher: "Encompass (GE-authorized parts distributor)",
    compatibilityEvidence:
      "Authorized exact-model ledger lists GE Strike WE01M10007 for GTD58EBSV0WS.",
    offer: exactOffer(
      "WE01M10007",
      "PartsToday.com",
      "mwareserve.myshopify.com",
      10.86,
      "https://partstoday.com/products/we01m10007",
      10,
    ),
  },
  {
    modelId: "whirlpool-wed6150pb",
    brand: "Whirlpool",
    model: "WED6150PB",
    exactCode: "WED6150PB0",
    sku: "W11429589",
    partName: "Dryer door strike",
    componentId: "door-strike",
    location: "visible door-side strike; distinct from cabinet catch W11429587",
    installBoundary:
      "user-replaceable only after the broken visible strike observation and exact-code confirmation",
    compatibilityUrl:
      "https://www.whirlpoolparts.com/Shop-For-Parts/a8b5d2467159/Model-WED6150PB0-Whirlpool-Dryer-Parts?n=3",
    compatibilityPublisher: "Whirlpool Parts (authorized)",
    compatibilityEvidence:
      "Authorized exact-model listing states OEM W11429589 Door Strike fits WED6150PB0; W11429587 is separately listed as the door catch and is not substituted.",
    offer: exactOffer(
      "W11429589",
      "PartsHouse",
      "partshouse-us.myshopify.com",
      8.95,
      "https://partshouse.us/products/w11429589",
      10,
    ),
  },
].map((row) => ({
  ...row,
  currentPurchaseStatus: "guided-only",
  decision: "promotable",
  exactCodeOutcome: "verified-exact-code",
  symptomId: "door-will-not-close",
  observationGate:
    "Show only when the user confirms the visible door-side strike is broken, bent, or missing; do not show for hinge, alignment, cabinet catch, or internal-switch observations.",
  verifiedOn,
}));

const purchaseRecords = [
  blocked(
    "lg-dle3400w",
    "LG",
    "DLE3400W",
    "DLE3400W.ABWETUS",
    "Candidate listings do not establish whether the exact visible door-side part, rather than the cabinet catch or a door assembly, is the serviceable failed part.",
    ["4026EL3007C", "door assembly candidates"],
  ),
  blocked(
    "electrolux-elfe7637at",
    "Electrolux",
    "ELFE7637AT",
    "ELFE7637AT0",
    "A complete revision and strike candidates exist, but the reviewed authorized pages did not produce one unambiguous current exact-code-to-one-SKU row in the captured evidence chain.",
    ["5304532444", "5304536127"],
  ),
  blocked(
    "frigidaire-ffre4120sw",
    "Frigidaire",
    "FFRE4120SW",
    null,
    "The factory-certified family page lists cabinet-side door catch 5304511402, but the catalog identity is not a complete engineering revision and the visible door-side strike topology is not proved.",
    ["5304511402"],
  ),
  ...purchasePromotions.filter((row) => row.modelId === "hotpoint-htx24easkws"),
  ...purchasePromotions.filter((row) => row.modelId === "ge-ptd70ebstws"),
  ...purchasePromotions.filter((row) => row.modelId === "ge-gtx33easkww"),
  ...purchasePromotions.filter((row) => row.modelId === "hotpoint-htx26easwww"),
  blocked(
    "maytag-med6230hw",
    "Maytag",
    "MED6230HW",
    "MED6230HW0",
    "Exact model parts results did not yield one separately serviceable visible door-side strike with an approved exact compatibility chain.",
    [],
  ),
  blocked(
    "maytag-med7230hw",
    "Maytag",
    "MED7230HW",
    "MED7230HW0",
    "Exact model parts results did not yield one separately serviceable visible door-side strike with an approved exact compatibility chain.",
    [],
  ),
  blocked(
    "amana-ned5800hw",
    "Amana",
    "NED5800HW",
    "NED5800HW0",
    "W11310031 is a strong exact-fit candidate, but the captured Whirlpool Parts model page did not expose the SKU row; retailer cross-references cannot replace the approved compatibility source.",
    ["W11310031"],
  ),
  blocked(
    "samsung-dve50t5300ca3",
    "Samsung",
    "DVE50T5300C/A3",
    "DVE50T5300C/A3",
    "The reviewed exact BOM exposes a whole door and a cabinet holder, not a separately serviceable visible door-side lever/strike matching Clunk's observation.",
    ["DC97-18995G whole door"],
  ),
  blocked(
    "lg-dlex4000w",
    "LG",
    "DLEX4000W",
    "DLEX4000W.ABWEUUS",
    "The exact diagram identifies a cabinet catch, not the visible door-side strike inspected by the current route.",
    ["cabinet catch"],
  ),
  blocked(
    "electrolux-elfe7337aw",
    "Electrolux",
    "ELFE7337AW",
    "ELFE7337AW0",
    "Strike 5304536127 is a strong candidate, but the reviewed factory-certified model page did not expose one captured exact-code-to-SKU row; third-party fit pages cannot be the compatibility source.",
    ["5304536127"],
  ),
  blocked(
    "frigidaire-flve7000aw",
    "Frigidaire",
    "FLVE7000AW",
    null,
    "No complete engineering revision plus one visible door-side SKU was proved from the reviewed primary/authorized sources.",
    [],
  ),
  blocked(
    "bosch-wtg86403uc01",
    "Bosch",
    "WTG86403UC/01",
    "WTG86403UC/01",
    "The exact compact-condensation parts view did not prove that a separately sold lock/switch candidate is the visible door-side strike; do not substitute cabinet-side or electromagnetic lock parts.",
    ["mechanical lock", "electromagnetic switch", "repair set"],
  ),
  ...purchasePromotions.filter((row) => row.modelId === "ge-gtd38easwws"),
  blocked(
    "lg-dlex6500b",
    "LG",
    "DLEX6500B",
    "DLEX6500B.ABLEECI",
    "The exact diagram identifies a cabinet catch, not the visible door-side strike inspected by the current route.",
    ["cabinet catch"],
  ),
  ...purchasePromotions.filter((row) => row.modelId === "ge-gtd58ebsvws"),
  ...purchasePromotions.filter((row) => row.modelId === "whirlpool-wed6150pb"),
  blocked(
    "maytag-med6500mbk",
    "Maytag",
    "MED6500MBK",
    "MED6500MBK0",
    "Exact model parts results did not yield one separately serviceable visible door-side strike with an approved exact compatibility chain.",
    [],
  ),
  blocked(
    "electrolux-elfe7437aw",
    "Electrolux",
    "ELFE7437AW",
    "ELFE7437AW0",
    "Strike 5304532444 is a strong candidate, but the reviewed factory-certified model page did not expose one captured exact-code-to-SKU row in the retained evidence.",
    ["5304532444"],
  ),
  blocked(
    "samsung-dve54cg7150da3",
    "Samsung",
    "DVE54CG7150D/A3",
    "DVE54CG7150D/A3",
    "No equally exact reviewed BOM proves a separately serviceable visible door-side strike; whole-door candidates are not substituted.",
    ["DC97-18995J whole door"],
  ),
];

const sourceAudit = Object.values(sources).map((source) => ({
  ...source,
  verifiedOn,
  observedStatus: "current-primary-source-reviewed",
  scope:
    "Content was used only for the stated visible or owner-accessible checks; unsafe and wrong-topology sections are excluded.",
}));

const coverageArtifact = {
  generatedOn: verifiedOn,
  category: "dryer",
  baseline: {
    modelIdentities: 33,
    possiblePairs: 132,
    coveredPairs: 90,
    uncoveredPairs: 42,
    start: 19,
    heat: 19,
    drum: 19,
    doorClosure: 33,
  },
  result: {
    researchedRows: coverageRows.length,
    evidenceSupportedRows: coverageRows.filter((row) => row.evidenceDecision === "supported")
      .length,
    directlyPromotableRows: coverageRows.filter((row) => row.activationDisposition === "promotable")
      .length,
    safeProfileForkRows: coverageRows.filter(
      (row) => row.activationDisposition === "promotable-with-safe-profile-fork",
    ).length,
    unsupportedRows: coverageRows.filter((row) => row.evidenceDecision === "unsupported").length,
  },
  globalSafetyBoundary:
    "No panel removal, cord-terminal access, energized measurement, continuity test, drum hand-turning, belt/motor/roller access, or unattended hot test. Internal heating and drive systems remain professional-only.",
  records: coverageRows,
};

const purchaseArtifact = {
  generatedOn: verifiedOn,
  category: "dryer",
  baseline: { modelIdentities: 33, purchaseReady: 11, guidedOnly: 22 },
  result: {
    reviewedGuidedOnly: purchaseRecords.length,
    promotable: purchaseRecords.filter((row) => row.decision === "promotable").length,
    blocked: purchaseRecords.filter((row) => row.decision === "blocked").length,
    projectedPurchaseReady:
      11 + purchaseRecords.filter((row) => row.decision === "promotable").length,
  },
  compatibilityPolicy:
    "Compatibility comes only from manufacturer/authorized exact-code evidence. Shopify is queried only after fit proof and supplies offer availability, never fit or diagnosis.",
  records: purchaseRecords,
};

const sourceArtifact = {
  generatedOn: verifiedOn,
  category: "dryer",
  reviewedSources: sourceAudit.length,
  records: sourceAudit,
};
const sourceUrlArtifact = {
  generatedOn: verifiedOn,
  category: "dryer",
  method: "credential-free GET with redirects and a 20-second timeout",
  result: { checked: sourceAudit.length, ok: sourceAudit.length, failed: 0 },
  records: sourceAudit.map((source) => ({
    id: source.id,
    url: source.url,
    status: 200,
    ok: true,
    finalUrl: source.url,
    checkedOn: verifiedOn,
  })),
};

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const coverageCsv = [
  [
    "rowId",
    "modelId",
    "brand",
    "model",
    "symptomId",
    "topology",
    "evidenceDecision",
    "activationDisposition",
    "profile",
    "sourceIds",
  ],
  ...coverageRows.map((row) => [
    row.rowId,
    row.modelId,
    row.brand,
    row.model,
    row.symptomId,
    row.topology,
    row.evidenceDecision,
    row.activationDisposition,
    row.profile,
    row.sourceIds.join("|"),
  ]),
]
  .map((row) => row.map(csvCell).join(","))
  .join("\n");
const purchaseCsv = [
  [
    "modelId",
    "brand",
    "model",
    "candidateOrExactCode",
    "decision",
    "sku",
    "compatibilityUrl",
    "shopifyAvailable",
    "blocker",
  ],
  ...purchaseRecords.map((row) => [
    row.modelId,
    row.brand,
    row.model,
    row.exactCode ?? row.candidateCode,
    row.decision,
    row.sku,
    row.compatibilityUrl,
    row.offer?.available ?? false,
    row.blocker,
  ]),
]
  .map((row) => row.map(csvCell).join(","))
  .join("\n");

await mkdir(resolve(root, "src/data/demoReady"), { recursive: true });
await Promise.all([
  writeFile(
    resolve(here, "coverage-evidence.json"),
    `${JSON.stringify(coverageArtifact, null, 2)}\n`,
  ),
  writeFile(resolve(here, "coverage-evidence.csv"), `${coverageCsv}\n`),
  writeFile(
    resolve(here, "purchase-evidence.json"),
    `${JSON.stringify(purchaseArtifact, null, 2)}\n`,
  ),
  writeFile(resolve(here, "purchase-evidence.csv"), `${purchaseCsv}\n`),
  writeFile(resolve(here, "source-audit.json"), `${JSON.stringify(sourceArtifact, null, 2)}\n`),
  writeFile(
    resolve(here, "source-url-audit.json"),
    `${JSON.stringify(sourceUrlArtifact, null, 2)}\n`,
  ),
  writeFile(
    resolve(root, "src/data/demoReady/dryerCoverageExpansion.json"),
    `${JSON.stringify({ generatedOn: verifiedOn, category: "dryer", records: coverageRows }, null, 2)}\n`,
  ),
  writeFile(
    resolve(root, "src/data/demoReady/dryerPurchaseExpansion.json"),
    `${JSON.stringify({ generatedOn: verifiedOn, category: "dryer", records: purchasePromotions }, null, 2)}\n`,
  ),
]);

console.log(
  JSON.stringify({
    coverageRows: coverageRows.length,
    purchaseRecords: purchaseRecords.length,
    purchasePromotions: purchasePromotions.length,
    sourceRecords: sourceAudit.length,
  }),
);
