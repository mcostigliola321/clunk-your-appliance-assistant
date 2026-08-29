import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { APPLIANCE_CATALOG } from "../src/data/applianceCatalog";
import type { ApplianceKind, BrandName, SupportedSymptomId } from "../src/domain/types";

const VERIFIED_ON = "2026-08-29";

type Source = {
  id: string;
  kind: "manufacturer-troubleshooting";
  title: string;
  url: string;
  publisher: string;
  appliesTo: string;
  verifiedOn: string;
  quality: "primary";
};

const source = (
  id: string,
  title: string,
  url: string,
  publisher: string,
  appliesTo: string,
): Source => ({
  id,
  kind: "manufacturer-troubleshooting",
  title,
  url,
  publisher,
  appliesTo,
  verifiedOn: VERIFIED_ON,
  quality: "primary",
});

const sources = Object.fromEntries(
  [
    source(
      "ge-washer-front-start",
      "GE front-load washer start checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=23094",
      "GE Appliances",
      "GE front-load washers; visible controls, door, pause, and water supply only",
    ),
    source(
      "ge-washer-top-start",
      "GE top-load washer start checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17383",
      "GE Appliances",
      "GE top-load washers; visible controls, lid, pause, and water supply only",
    ),
    source(
      "ge-washer-front-spin",
      "GE front-load washer spin checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=16243",
      "GE Appliances",
      "GE front-load washers; load, drain, and visible closure checks only",
    ),
    source(
      "ge-washer-top-spin",
      "GE top-load washer spin checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=23082",
      "GE Appliances",
      "GE top-load washers; load, drain, and visible lid checks only",
    ),
    source(
      "ge-washer-front-leak",
      "GE front-load washer leak checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17532",
      "GE Appliances",
      "GE front-load washers; visible gasket, detergent, dispenser, and external hose checks",
    ),
    source(
      "ge-washer-top-leak",
      "GE top-load washer leak checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17530",
      "GE Appliances",
      "GE top-load washers; visible tub edge, detergent, loading, and external hose checks",
    ),
    source(
      "lg-washer-start",
      "LG washer unresponsive-control checks",
      "https://www.lg.com/us/support/help-library/lg-washer-troubleshooting-unresponsive-washer-buttons-CT10000012-20152367429605",
      "LG",
      "LG front- and top-load washers; visible controls and lock state only",
    ),
    source(
      "lg-washer-spin",
      "LG washer drum-not-spinning checks",
      "https://www.lg.com/us/support/help-library/lg-washer-troubleshooting-washing-machine-drum-not-spinning-CT10000010-20150584818000",
      "LG",
      "LG front- and top-load washers; load, drain, and closure observations only",
    ),
    source(
      "lg-washer-leak",
      "LG washer leak troubleshooting",
      "https://www.lg.com/us/support/help-library/leaking-washing-machine-troubleshooting-guide-CT10000010-20150295652820",
      "LG",
      "LG front- and top-load washers; topology-selected visible leak checks only",
    ),
    source(
      "samsung-washer-start",
      "Samsung washer start and power checks",
      "https://www.samsung.com/us/support/troubleshoot/TSG10007300/",
      "Samsung",
      "Samsung front- and top-load washers; visible power, control-lock, door/lid, and cycle checks",
    ),
    source(
      "samsung-washer-spin",
      "Samsung washer spin checks",
      "https://www.samsung.com/us/support/troubleshoot/TSG10003486/",
      "Samsung",
      "Samsung front- and top-load washers; load, drain, and closure observations; pump-filter access excluded unless separately confirmed",
    ),
    source(
      "samsung-washer-leak",
      "Samsung washer leak checks",
      "https://www.samsung.com/us/support/troubleshoot/TSG10001007/",
      "Samsung",
      "Samsung front- and top-load washers; topology-selected visible leak checks only",
    ),
    source(
      "whirlpool-washer-front-start",
      "Whirlpool front-load washer start checks",
      "https://producthelp.whirlpool.com/Laundry/Washers/Front_Load_Washers/Not_Starting_or_Not_Operating/Not_Starting_or_Not_Operating/Not_Starting_or_Not_Operating_-_Front_Load_Washer",
      "Whirlpool",
      "Whirlpool front-load washers; visible controls, door, and water supply only",
    ),
    source(
      "whirlpool-washer-top-start",
      "Whirlpool top-load washer start checks",
      "https://producthelp.whirlpool.com/Laundry/Washers/Top_Load_Washer/Operation/Not_Operating/Not_Starting_-_Washer",
      "Whirlpool",
      "Whirlpool top-load washers; visible controls, lid, and water supply only",
    ),
    source(
      "whirlpool-washer-front-spin",
      "Whirlpool front-load washer spin checks",
      "https://producthelp.whirlpool.com/Laundry/Washers/Front_Load_Washers/Not_Starting_or_Not_Operating/Not_Spinning/Not_Spinning_-_Front_Load_Washer",
      "Whirlpool",
      "Whirlpool front-load washers; cycle, load, suds, drain, and closure observations only",
    ),
    source(
      "whirlpool-washer-top-spin",
      "Whirlpool top-load washer spin checks",
      "https://producthelp.whirlpool.com/Laundry/Washers/Top_Load_Washer/Cycle_Concerns/Not_Spinning_-_Washer",
      "Whirlpool",
      "Whirlpool top-load washers; cycle, load, drain, and lid observations only",
    ),
    source(
      "whirlpool-washer-front-leak",
      "Whirlpool front-load washer leak checks",
      "https://producthelp.whirlpool.com/Laundry/Washers/Front_Load_Washers/Leaking/Leaking_from_Underneath_or_Bottom_-_Front_Load_Washer",
      "Whirlpool",
      "Whirlpool front-load washers; visible front boundary and external hose checks only",
    ),
    source(
      "whirlpool-washer-top-leak",
      "Whirlpool top-load washer leak checks",
      "https://producthelp.whirlpool.com/Laundry/Washers/Top_Load_Washer/Water/Leaking/Leaking_from_Front_or_Top_-_Washer",
      "Whirlpool",
      "Whirlpool top-load washers; visible tub edge, loading, detergent, and external hose checks",
    ),
    source(
      "frigidaire-washer-start",
      "Frigidaire washer start checks",
      "https://owner.frigidaire.com/support-articles/article/1853029-what-should-i-do-if-my-washer-does-not-start-",
      "Frigidaire",
      "Frigidaire washers; visible power, controls, closure, and water supply only",
    ),
    source(
      "frigidaire-washer-spin",
      "Frigidaire washer spin checks",
      "https://owner.frigidaire.com/support-articles/article/1853131-how-to-fix-your-washer-not-spinning",
      "Frigidaire",
      "Frigidaire washers; visible load, drain, and closure observations only",
    ),
    source(
      "frigidaire-washer-leak",
      "Frigidaire washer leak checks",
      "https://owner.frigidaire.com/support-articles/article/1853025-what-should-i-do-if-my-washer-is-leaking-",
      "Frigidaire",
      "Frigidaire washers; visible drain, hose, detergent, and suds checks only",
    ),

    source(
      "ge-dishwasher-cleaning",
      "GE dishwasher cleaning-performance checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=38933",
      "GE Appliances",
      "GE built-in dishwashers; loading, cycle, detergent, and visible spray obstruction only",
    ),
    source(
      "ge-dishwasher-fill",
      "GE dishwasher no-fill checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=38924",
      "GE Appliances",
      "GE built-in dishwashers; household water, door, and visible supply checks only",
    ),
    source(
      "ge-dishwasher-leak",
      "GE dishwasher leak prevention and stop guidance",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=18954",
      "GE Appliances",
      "GE built-in dishwashers; suds, loading, gasket, and visible plumbing checks only",
    ),
    source(
      "lg-dishwasher-cleaning",
      "LG dishwasher cleaning-performance maintenance",
      "https://www.lg.com/us/support/help-library/lg-dishwasher-maintenance--1433962981524",
      "LG",
      "LG dishwashers; loading, water temperature, and visible spray obstruction; filter removal excluded unless the exact manual matches",
    ),
    source(
      "lg-dishwasher-fill",
      "LG dishwasher no-water checks",
      "https://www.lg.com/us/support/help-library/dishwasher-no-water-ie-error-code--20154712581272",
      "LG",
      "All LG dishwasher models; household water and visible supply-hose checks only",
    ),
    source(
      "lg-dishwasher-leak",
      "LG dishwasher leak-code and suds guidance",
      "https://www.lg.com/us/support/help-library/lg-dishwasher-guide-to-error-codes--20154464775480",
      "LG",
      "LG dishwashers; stop, suds, and error-code observations only",
    ),
    source(
      "bosch-dishwasher-cleaning",
      "Bosch dishwasher not-cleaning checks",
      "https://www.bosch-home.com/us/owner-support/get-support/support-selfhelp-dishwasher-not-cleaning-dishes",
      "Bosch",
      "Bosch dishwashers; loading, detergent, water temperature, and visible spray observations only",
    ),
    source(
      "bosch-dishwasher-fill",
      "Bosch dishwasher not-drawing-water checks",
      "https://www.bosch-home.com/us/owner-support/get-support/support-selfhelp-dishwasher-not-drawing-water",
      "Bosch",
      "Bosch dishwashers; household supply, visible hose, and door observations only",
    ),
    source(
      "bosch-dishwasher-leak",
      "Bosch dishwasher leak error guidance",
      "https://www.bosch-home.com/us/owner-support/error-codes/dishwashers",
      "Bosch",
      "Bosch dishwashers; visible leak or E15 condition is a stop and service boundary",
    ),
    source(
      "whirlpool-dishwasher-cleaning",
      "Whirlpool dishwasher cleaning-performance checks",
      "https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Wash_Performance/Other_Cookware_and_Dishes/Dull_Surfaces_on_Dishes",
      "Whirlpool",
      "Whirlpool built-in dishwashers; loading, detergent, cycle, and visible spray observations only",
    ),
    source(
      "whirlpool-dishwasher-fill",
      "Whirlpool dishwasher no-fill checks",
      "https://producthelp.whirlpool.com/Dishwashers/Dishwasher/Cycle_Concerns/Not_Filling%2F%2FNo_Water/Not_Filling_With_Water_-_Dishwasher",
      "Whirlpool",
      "Whirlpool built-in dishwashers; household water, door, and visible supply checks only",
    ),
    source(
      "whirlpool-dishwasher-leak",
      "Whirlpool dishwasher leak troubleshooting",
      "https://producthelp.whirlpool.com/Dishwashers/Product_Info/Dishwasher_Product_Assistance/Dishwasher_Leaking_Troubleshooting_Guide",
      "Whirlpool",
      "Whirlpool built-in dishwashers; suds, loading, and visible leak-location checks only",
    ),
    source(
      "frigidaire-dishwasher-cleaning",
      "Frigidaire dishwasher not-cleaning checks",
      "https://owner.frigidaire.com/support-articles/article/1831286-dishwasher-not-cleaning",
      "Frigidaire",
      "Frigidaire dishwashers; cycle, loading, detergent, and visible spray observations only",
    ),
    source(
      "frigidaire-dishwasher-fill",
      "Frigidaire dishwasher not-filling checks",
      "https://owner.frigidaire.com/support-articles/article/1835628-dishwasher-not-filling",
      "Frigidaire",
      "Frigidaire dishwashers; household water and visible supply-line checks only",
    ),
    source(
      "frigidaire-dishwasher-leak",
      "Frigidaire dishwasher water-leak checks",
      "https://owner.frigidaire.com/support-articles/article/1838717-dishwasher-water-leaking",
      "Frigidaire",
      "Frigidaire dishwashers; suds, loading, and visible hose checks only",
    ),

    source(
      "ge-dryer-start",
      "GE dryer will-not-start checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17381",
      "GE Appliances",
      "GE electric dryers; visible plug, door, controls, and breaker observations only",
    ),
    source(
      "ge-dryer-heat",
      "GE electric dryer runs-without-heat checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=16921",
      "GE Appliances",
      "GE electric dryers; cycle, airflow, and household breaker observations only; no terminal access",
    ),
    source(
      "ge-dryer-drum",
      "GE dryer drum-does-not-turn checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=17096",
      "GE Appliances",
      "GE dryers; load observation and professional stop; no internal access",
    ),
    source(
      "lg-dryer-start",
      "LG dryer power and start checks",
      "https://www.lg.com/us/support/help-library/power-issues-laundry-dryer--20150394890820",
      "LG",
      "LG electric dryers; visible power, control-lock, door, and cycle observations only",
    ),
    source(
      "lg-dryer-heat",
      "LG dryer not-heating checks",
      "https://www.lg.com/us/support/help-library/not-heating-not-drying-or-long-time-drying-CT10000011-1432223739634",
      "LG",
      "LG electric dryers; cycle, lint screen, and household vent observations only",
    ),
    source(
      "lg-dryer-drum",
      "LG dryer drum-not-turning checks",
      "https://www.lg.com/us/support/help-library/lg-dryer-dryer-drum-not-turning--20154713270264",
      "LG",
      "All LG dryer models; load, door, and service-stop observations only",
    ),
    source(
      "samsung-dryer-start-drum",
      "Samsung dryer start and spin checks",
      "https://www.samsung.com/us/support/troubleshoot/TSG10007168/",
      "Samsung",
      "Samsung dryers; error, child-lock, cycle-start, door, and service-stop observations only",
    ),
    source(
      "samsung-dryer-heat",
      "Samsung dryer no-heat and airflow checks",
      "https://www.samsung.com/us/support/troubleshoot/TSG10001001/",
      "Samsung",
      "Samsung vented electric dryers; timed-cycle, lint screen, and visible vent observations only",
    ),
    source(
      "whirlpool-dryer-start",
      "Whirlpool dryer not-starting checks",
      "https://producthelp.whirlpool.com/Laundry/Dryers/Dryer/Operation/Not_Starting/Not_Starting_or_Not_Operating_-_Dryer",
      "Whirlpool",
      "Whirlpool electric dryers; visible controls, door, cycle, and power observations only",
    ),
    source(
      "whirlpool-dryer-heat",
      "Whirlpool electric dryer not-heating checks",
      "https://producthelp.whirlpool.com/Laundry/Dryers/Dryer/Operation/Not_Heating/Not_Heating_-_Electric_Dryer",
      "Whirlpool",
      "Whirlpool electric dryers; heated cycle, airflow, and household breaker observations only",
    ),
    source(
      "whirlpool-dryer-drum",
      "Whirlpool dryer not-tumbling checks",
      "https://producthelp.whirlpool.com/Laundry/Dryers/Dryer/Operation/Not_Starting/Not_Tumbling_or_Spinning_-_Dryer",
      "Whirlpool",
      "Whirlpool electric dryers; power, start, and professional-stop observations only",
    ),

    source(
      "ge-refrigerator-cooling",
      "GE refrigerator not-cooling-enough checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=21185",
      "GE Appliances",
      "GE full-size refrigerators; settings, room conditions, airflow, door, and light observations only",
    ),
    source(
      "ge-refrigerator-leak",
      "GE refrigerator icemaker leak stop guidance",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=19092",
      "GE Appliances",
      "GE refrigerators with factory icemakers; turn-off and household-water stop only",
    ),
    source(
      "ge-refrigerator-ice",
      "GE refrigerator icemaker no-ice checks",
      "https://products.geappliances.com/appliance/gea-support-search-content?contentId=39364",
      "GE Appliances",
      "GE refrigerators with factory icemakers; power, temperature, filter-age, and visible ice-bin checks only",
    ),
    source(
      "lg-refrigerator-cooling",
      "LG refrigerator cooling troubleshooting",
      "https://www.lg.com/us/support/help-library/lg-refrigerator-not-cooling-CT10000021-1429710717769",
      "LG",
      "LG full-size refrigerators; settings, door, airflow, and food-safety observations only",
    ),
    source(
      "lg-refrigerator-leak",
      "LG refrigerator leak troubleshooting",
      "https://www.lg.com/us/support/help-library/lg-refrigerator-troubleshooting-a-leaking-refrigerator--20152715569705",
      "LG",
      "LG refrigerators with factory water/ice systems; visible source, shutoff, filter, and service-stop observations only",
    ),
    source(
      "lg-refrigerator-ice",
      "LG refrigerator no-ice checks",
      "https://www.lg.com/us/support/help-library/lg-refrigerator-why-is-my-refrigerator-not-making-ice-CT10000021-1400773605181",
      "LG",
      "LG refrigerators with factory icemakers; temperature, power, water, and visible bin checks only; test-mode instructions excluded",
    ),
    source(
      "samsung-refrigerator-cooling",
      "Samsung refrigerator cooling checks",
      "https://www.samsung.com/us/support/troubleshoot/TSG10003479/",
      "Samsung",
      "Samsung full-size refrigerators; error, settings, cooling mode, door seal, and food-safety observations only",
    ),
    source(
      "samsung-refrigerator-leak",
      "Samsung refrigerator leak checks",
      "https://www.samsung.com/us/support/troubleshoot/TSG10003766/",
      "Samsung",
      "Samsung refrigerators with factory water/ice systems; visible source, filter, supply, and service-stop observations only",
    ),
    source(
      "samsung-refrigerator-ice",
      "Samsung refrigerator ice-maker checks",
      "https://www.samsung.com/us/support/troubleshoot/TSG10002387/",
      "Samsung",
      "Samsung refrigerators with factory icemakers; seal, power, water supply, temperature, and visible bin checks only; model-specific reset excluded",
    ),
    source(
      "whirlpool-refrigerator-cooling",
      "Whirlpool refrigerator not-cooling checks",
      "https://producthelp.whirlpool.com/Refrigeration/Full-Size_Refrigerators/All_Refrigerator/Operation/Temperature_Concerns/Not_Cooling",
      "Whirlpool",
      "Whirlpool full-size refrigerators; settings, room conditions, airflow, door, and food-safety observations only",
    ),
    source(
      "whirlpool-refrigerator-leak",
      "Whirlpool refrigerator water-on-floor checks",
      "https://producthelp.whirlpool.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Installation_Support/What_to_Do_if_There_is_Water_on_the_Floor",
      "Whirlpool",
      "Whirlpool refrigerators with factory water/ice systems; visible filter, supply, and floor-water checks only",
    ),
    source(
      "whirlpool-refrigerator-ice",
      "Whirlpool refrigerator water-supply checks",
      "https://producthelp.whirlpool.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Installation_Support/How_to_Check_the_Water_Supply_Line",
      "Whirlpool",
      "Whirlpool refrigerators with factory icemakers; visible household water, supply-line, and leak observations only",
    ),
    source(
      "frigidaire-refrigerator-cooling",
      "Frigidaire refrigerator not-cooling checks",
      "https://owner.frigidaire.com/support-articles/article/1898299-refrigerators-not-cooling",
      "Frigidaire",
      "Frigidaire refrigerators; power, temperature, airflow, door-seal, and food-safety observations only",
    ),
    source(
      "frigidaire-refrigerator-leak",
      "Frigidaire refrigerator water-leak checks",
      "https://owner.frigidaire.com/support-articles/article/1847166-refrigerators-water-leaks",
      "Frigidaire",
      "Frigidaire refrigerators with factory water/ice systems; visible filter, dispenser, and connection observations only",
    ),
    source(
      "frigidaire-refrigerator-ice",
      "Frigidaire refrigerator low-ice checks",
      "https://owner.frigidaire.com/support-articles/article/1853036-what-should-i-do-if-my-ice-maker-is-not-making-enough-ice-in-my-refrigerator-",
      "Frigidaire",
      "Frigidaire French-door, side-by-side, and top-freezer refrigerators with factory icemakers; filter age, temperature, water supply, and door observations only",
    ),
    source(
      "electrolux-refrigerator-cooling",
      "Electrolux refrigerator not-cooling checks",
      "https://owner.electrolux.com/support-articles/article/1898299-refrigerators-not-cooling",
      "Electrolux",
      "Electrolux refrigerators; power, temperature, airflow, door-seal, and food-safety observations only",
    ),
    source(
      "electrolux-refrigerator-leak",
      "Electrolux refrigerator water-leak checks",
      "https://owner.electrolux.com/support-articles/article/1847166-refrigerators-water-leaks",
      "Electrolux",
      "Electrolux refrigerators with factory water/ice systems; visible filter, dispenser, and connection observations only",
    ),
    source(
      "electrolux-refrigerator-ice",
      "Electrolux refrigerator no-ice checks",
      "https://owner.electrolux.com/support-articles/article/1898308-refrigerators-no-ice",
      "Electrolux",
      "Electrolux refrigerators with factory icemakers; power, temperature, filter age, water supply, and visible bin observations only",
    ),
    source(
      "amana-refrigerator-cooling",
      "Amana refrigerator control-setting checks",
      "https://producthelp.amana.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Product_Assistance/Tips_for_Properly_Setting_the_Controls",
      "Amana",
      "Amana full-size refrigerators; temperature settings, room conditions, door, and airflow observations only",
    ),
    source(
      "amana-refrigerator-leak",
      "Amana refrigerator water-supply checks",
      "https://producthelp.amana.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Installation_Support/How_to_Check_the_Water_Supply_Line",
      "Amana",
      "Amana refrigerators with factory water/ice systems; visible household water, supply-line, and leak observations only",
    ),
    source(
      "amana-refrigerator-ice",
      "Amana refrigerator ice-maker checks",
      "https://producthelp.amana.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Product_Assistance/Ice_Maker_Not_Working_-_Troubleshooting",
      "Amana",
      "Amana refrigerators with factory icemakers; power, temperature, water supply, filter age, and visible bin observations only",
    ),
    source(
      "maytag-refrigerator-cooling",
      "Maytag refrigerator control-setting checks",
      "https://producthelp.maytag.com/Refrigeration/Full-size_Refrigerators/Product_Info/Product_Assistance/Tips_for_Properly_Setting_the_Controls",
      "Maytag",
      "Maytag full-size refrigerators; temperature settings, room conditions, door, and airflow observations only",
    ),
    source(
      "maytag-refrigerator-leak",
      "Maytag refrigerator water-on-floor checks",
      "https://producthelp.maytag.com/Refrigeration/Full-size_Refrigerators/Product_Info/Installation_Support/What_to_Do_if_There_is_Water_on_the_Floor",
      "Maytag",
      "Maytag refrigerators with factory water/ice systems; visible filter, supply, and floor-water observations only",
    ),
    source(
      "maytag-refrigerator-ice",
      "Maytag refrigerator ice-maker checks",
      "https://producthelp.maytag.com/Refrigeration/Full-size_Refrigerators/Product_Info/Product_Assistance/Ice_Maker_Not_Working_-_Troubleshooting",
      "Maytag",
      "Maytag refrigerators with factory icemakers; power, temperature, water supply, filter age, and visible bin observations only",
    ),
    source(
      "kitchenaid-refrigerator-cooling",
      "KitchenAid refrigerator control-setting checks",
      "https://producthelp.kitchenaid.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Product_Assistance/Tips_for_Properly_Setting_the_Controls",
      "KitchenAid",
      "KitchenAid full-size refrigerators; temperature settings, room conditions, door, and airflow observations only",
    ),
    source(
      "kitchenaid-refrigerator-leak",
      "KitchenAid refrigerator water-on-floor checks",
      "https://producthelp.kitchenaid.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Installation_Support/What_to_Do_if_There_is_Water_on_the_Floor",
      "KitchenAid",
      "KitchenAid refrigerators with factory water/ice systems; visible filter, supply, and floor-water observations only",
    ),
    source(
      "kitchenaid-refrigerator-ice",
      "KitchenAid refrigerator ice-maker checks",
      "https://producthelp.kitchenaid.com/Refrigeration/Full-Size_Refrigerators/Product_Info/Product_Assistance/Ice_Maker_Not_Working_-_Troubleshooting",
      "KitchenAid",
      "KitchenAid refrigerators with factory icemakers; power, temperature, water supply, filter age, and visible bin observations only",
    ),
    source(
      "bosch-refrigerator-cooling",
      "Bosch refrigerator not-cooling checks",
      "https://www.bosch-home.com/us/owner-support/get-support/self-help-fridge-has-stopped-cooling",
      "Bosch",
      "Bosch full-size refrigerators; power, temperature, airflow, door, and food-safety observations only",
    ),
  ].map((item) => [item.id, item]),
);

type Cohort = {
  id: string;
  category: ApplianceKind;
  symptomId: SupportedSymptomId;
  brands: BrandName[];
  sourceFor: (brand: BrandName, loadStyle?: string) => string[];
  profile: string;
  applicability: string;
  featureGates: string[];
  exceptions: string[];
};

const brandKey = (brand: BrandName) => brand.toLowerCase();
const standardBrands: BrandName[] = ["GE", "LG", "Samsung", "Whirlpool"];

const washerCohort = (
  symptomId: SupportedSymptomId,
  suffix: "start" | "spin" | "leak",
  profile: string,
): Cohort => ({
  id: `washer-${suffix}-broad-2026-08-29`,
  category: "washer",
  symptomId,
  brands: [...standardBrands, "Frigidaire"],
  sourceFor: (brand, loadStyle) => [
    brand === "GE" || brand === "Whirlpool"
      ? `${brandKey(brand)}-washer-${loadStyle === "top-load" ? "top" : "front"}-${suffix}`
      : `${brandKey(brand)}-washer-${suffix}`,
  ],
  profile,
  applicability:
    "Exact listed washer model; common exterior observations only, selected by front-load or top-load topology where the manufacturer separates guidance.",
  featureGates: [
    "Use door and dispenser language only for front-load models.",
    "Use lid and basket language only for top-load models.",
    "No pump-filter, leveling, panel, or internal-drive action without separate exact-manual evidence.",
  ],
  exceptions: [
    "Control names and cycle labels vary by exact revision; the consumer must follow the label on their own console.",
    "A locked closure, standing hot water, active leak near power, burning smell, or damaged cord is an immediate stop.",
  ],
});

const categoryCohort = (
  category: ApplianceKind,
  symptomId: SupportedSymptomId,
  suffix: string,
  brands: BrandName[],
  profile: string,
  applicability: string,
  featureGates: string[],
  exceptions: string[],
): Cohort => ({
  id: `${category}-${suffix}-broad-2026-08-29`,
  category,
  symptomId,
  brands,
  sourceFor: (brand) => [
    category === "dryer" && brand === "Samsung" && (suffix === "start" || suffix === "drum")
      ? "samsung-dryer-start-drum"
      : `${brandKey(brand)}-${category}-${suffix}`,
  ],
  profile,
  applicability,
  featureGates,
  exceptions,
});

const cohorts: Cohort[] = [
  washerCohort("will-not-start", "start", "washer-start-observation"),
  washerCohort("will-not-spin", "spin", "washer-spin-observation"),
  washerCohort("is-leaking", "leak", "washer-leak-observation"),
  categoryCohort(
    "dishwasher",
    "not-cleaning",
    "cleaning",
    ["GE", "LG", "Bosch", "Whirlpool", "Frigidaire"],
    "dishwasher-cleaning-observation",
    "Exact listed built-in dishwasher; common loading, cycle, detergent, water-temperature, and visible spray-path observations only.",
    [
      "Filter removal is excluded unless the exact model manual independently confirms the procedure.",
      "Feature-specific spray systems and auto-open hardware are not generalized.",
    ],
    [
      "Cycle names, filter layouts, and spray systems vary by exact revision.",
      "Hot water, steam, broken glass, active leaking, or internal access is an immediate stop.",
    ],
  ),
  categoryCohort(
    "dishwasher",
    "will-not-fill",
    "fill",
    ["GE", "LG", "Bosch", "Whirlpool", "Frigidaire"],
    "dishwasher-fill-observation",
    "Exact listed built-in dishwasher; household water, visible supply path, door state, and displayed fill error observations only.",
    [
      "Use only a dry, reachable household shutoff; do not move the appliance.",
      "No inlet-valve, float, kickplate, or panel access.",
    ],
    [
      "Display codes and control names vary by exact revision.",
      "Wet electrical areas, stuck valves, or inaccessible plumbing require a professional stop.",
    ],
  ),
  categoryCohort(
    "dishwasher",
    "is-leaking",
    "leak",
    ["GE", "LG", "Bosch", "Whirlpool", "Frigidaire"],
    "dishwasher-leak-observation",
    "Exact listed built-in dishwasher; visible water location, suds, loading, door seal, and reachable household plumbing observations only.",
    [
      "Bosch E15 and manufacturer leak-detected conditions stop at service.",
      "Do not level, loosen mounting screws, remove a kickplate, or manipulate internal leak sensors.",
    ],
    [
      "Leak-protection and auto-open features vary by exact revision.",
      "Water near power, spreading water, hot water, or an inaccessible shutoff is an immediate stop.",
    ],
  ),
  categoryCohort(
    "dryer",
    "will-not-start",
    "start",
    standardBrands,
    "dryer-start-observation",
    "Exact listed vented electric dryer; visible power, door, control-lock, cycle, and start observations only.",
    [
      "Electric-dryer household breaker guidance applies; no outlet, cord-terminal, or panel access.",
      "Control Lock and cycle names must be read from the exact console/manual.",
    ],
    [
      "Smart controls and start gestures vary by exact revision.",
      "Burn marks, damaged cords, repeated breaker trips, smoke, or burning odor require an immediate electrician/service stop.",
    ],
  ),
  categoryCohort(
    "dryer",
    "not-heating",
    "heat",
    standardBrands,
    "dryer-heat-observation",
    "Exact listed vented electric dryer; heated-cycle, lint screen, load, and visible household vent observations only.",
    [
      "This cohort excludes compact ventless/heat-pump dryers.",
      "No terminal-block, heating-element, cabinet, or internal-duct access.",
    ],
    [
      "Eco/energy modes and diagnostic tests vary by exact revision and are not generalized.",
      "Burning odor, smoke, scorched lint, repeated breaker trips, or a hot cord requires an immediate stop.",
    ],
  ),
  categoryCohort(
    "dryer",
    "drum-will-not-turn",
    "drum",
    standardBrands,
    "dryer-drum-observation",
    "Exact listed vented electric dryer; load, door, error, cycle-start, and visible drum-motion observations only.",
    [
      "Do not turn the drum by hand or inspect a belt.",
      "No internal drive diagnosis or part inference.",
    ],
    [
      "Display behavior varies by exact revision.",
      "Scraping, burning odor, smoke, a jammed drum, or damaged power connection requires service without another test.",
    ],
  ),
  categoryCohort(
    "refrigerator",
    "not-cooling",
    "cooling",
    [...standardBrands, "Frigidaire", "Electrolux", "Amana", "Maytag", "KitchenAid", "Bosch"],
    "refrigerator-cooling-observation",
    "Exact listed full-size French-door or side-by-side refrigerator; temperature setting, cooling mode, door seal, airflow, room condition, and food-safety observations only.",
    [
      "Use the exact console/manual for cooling-mode controls; no generic button sequence.",
      "No panel, coil, fan, compressor, or refrigerant-system access.",
    ],
    [
      "Compartment controls and convertible zones vary by exact revision.",
      "Unsafe food temperature, electrical damage, smoke, chemical odor, or water near power is an immediate stop.",
    ],
  ),
  categoryCohort(
    "refrigerator",
    "is-leaking",
    "leak",
    [...standardBrands, "Frigidaire", "Electrolux", "Amana", "Maytag", "KitchenAid"],
    "refrigerator-leak-observation",
    "Exact listed full-size refrigerator with a factory water/ice system; visible source, filter area, dispenser, supply line, and dry reachable shutoff observations only.",
    [
      "Factory water/ice feature is confirmed on the exact model source before activation.",
      "Do not pull the refrigerator, remove covers, disconnect tubing, or infer a filter/valve part.",
    ],
    [
      "Filter type, reservoir, pitcher, and ice layout vary by exact revision.",
      "Spreading water, water near power, a hidden shutoff, or a damaged line is an immediate stop.",
    ],
  ),
  categoryCohort(
    "refrigerator",
    "ice-maker-not-making-ice",
    "ice",
    [...standardBrands, "Frigidaire", "Electrolux", "Amana", "Maytag", "KitchenAid"],
    "refrigerator-ice-observation",
    "Exact listed full-size refrigerator with a factory ice maker; power state, compartment temperature, water supply, filter age, door seal, and visible ice-bin observations only.",
    [
      "Factory ice-maker presence is confirmed on the exact model source before activation.",
      "No generic reset/test-button sequence, internal access, or replacement-part inference.",
    ],
    [
      "Ice-maker location, controls, and dual-ice features vary by exact revision.",
      "A leak, damaged wiring, hot/burning odor, sharp obstruction, or unresolved error requires service.",
    ],
  ),
];

const records = cohorts.flatMap((cohort) =>
  APPLIANCE_CATALOG.filter(
    (entry) =>
      entry.kind === cohort.category &&
      cohort.brands.includes(entry.brand) &&
      !(entry.kind === "dryer" && entry.topology === "compact-ventless-electric-dryer"),
  ).map((entry) => {
    const sourceIds = cohort.sourceFor(entry.brand, entry.loadStyle);
    for (const sourceId of sourceIds) {
      if (!sources[sourceId]) throw new Error(`Missing source ${sourceId} for ${entry.id}.`);
    }
    return {
      rowId: `${entry.id}__${cohort.symptomId}`,
      cohortId: cohort.id,
      modelId: entry.id,
      category: entry.kind,
      symptomId: cohort.symptomId,
      brand: entry.brand,
      modelFamily: entry.model,
      topology: entry.topology,
      loadStyle: entry.loadStyle ?? null,
      sourceIds,
      modelEvidence: {
        sourceId: entry.modelSource.id,
        url: entry.modelSource.url,
        verifiedProductCodes: entry.verifiedProductCodes,
        purpose:
          "Exact model identity, topology, and feature-gate corroboration only; not troubleshooting evidence.",
      },
      applicability: cohort.applicability,
      featureGates: cohort.featureGates,
      homeownerObservableChecks: [
        "Use only the visible, exterior, or explicitly owner-accessible checks in the shared profile.",
        "Match any control, cycle, or feature name to the exact appliance console or owner manual.",
      ],
      safetyBoundaries: {
        homeowner: ["Dry, visible observations with no disassembly or appliance movement."],
        professional: [
          "Internal components, installation correction, wiring, and exact-part diagnosis.",
        ],
        stop: cohort.exceptions,
      },
      profile: cohort.profile,
      modelSpecificException: cohort.exceptions.join(" "),
      capabilityTier: "guided-checks",
      verifiedOn: VERIFIED_ON,
      unresolvedGaps: [
        "No exact failed part is identified by this guided profile.",
        "No purchase-ready compatibility claim is made for this symptom route.",
      ],
    };
  }),
);

const output = {
  schemaVersion: 1,
  verifiedOn: VERIFIED_ON,
  evidenceRules: [
    "Every activated row names one exact catalog model and one symptom; a catalog identity alone never creates coverage.",
    "Manufacturer troubleshooting guidance must explicitly match the brand, category, and applicable topology.",
    "Manufacturer model pages corroborate identity, topology, and feature gates only; they are not troubleshooting evidence.",
    "Shared profiles contain only the intersection of low-risk observable checks across the cohort.",
    "Feature-specific steps, internal access, exact-part claims, and commerce remain excluded without separate exact-revision proof.",
  ],
  cohorts: cohorts.map(({ sourceFor: _sourceFor, ...cohort }) => cohort),
  sources,
  records,
};

await writeFile(
  resolve("src/data/broadSymptomCoverage.json"),
  `${JSON.stringify(output, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${records.length} exact model × symptom evidence records.`);
