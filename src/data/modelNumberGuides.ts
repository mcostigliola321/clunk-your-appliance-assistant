import type { ApplianceKind, BrandName, WasherLoadStyle } from "@/domain/types";

export interface ModelNumberLocation {
  id: string;
  label: string;
  instruction: string;
}

export interface ModelNumberGuide {
  kind: ApplianceKind;
  title: string;
  safety: string;
  locations: ModelNumberLocation[];
  examples: string[];
  sources: Array<{ title: string; url: string; retrieved: string }>;
}

const RETRIEVED = "2026-08-27";

const guides: Record<ApplianceKind, ModelNumberGuide> = {
  washer: {
    kind: "washer",
    title: "Find the washer label",
    safety: "Stop the cycle and wait for the drum to be still. Do not move the washer.",
    locations: [
      {
        id: "front-load",
        label: "Front-load washer",
        instruction:
          "Open the door. Check the door rim, the front frame around the opening, and the cabinet face you can see with the door open. Some models use a lower outside corner.",
      },
      {
        id: "top-load",
        label: "Top-load washer",
        instruction:
          "Lift the lid. Check the tub rim, the area near the rear hinge, and the underside of the lid. If it is not there, inspect the rear control area or the back near the water connections without moving the washer.",
      },
    ],
    examples: ["WF45T6000AW/A5", "GFW550SSN0WW", "WM3400CW.ABWEVUS"],
    sources: [
      {
        title: "GE front-load washer label locations",
        url: "https://www.geappliances.com/ge/find-model-serial-number/front-load-washers.htm",
        retrieved: RETRIEVED,
      },
      {
        title: "GE top-load washer label locations",
        url: "https://www.geappliances.com/ge/find-model-serial-number/top-load-washers.htm",
        retrieved: RETRIEVED,
      },
      {
        title: "Frigidaire model and serial label guidance",
        url: "https://owner.frigidaire.com/support-articles/article/1858491-where-can-i-find-my-model-and-serial-number-",
        retrieved: RETRIEVED,
      },
    ],
  },
  dishwasher: {
    kind: "dishwasher",
    title: "Find the dishwasher label",
    safety: "Stop the cycle, let hot water cool, and open the door carefully.",
    locations: [
      {
        id: "open-door",
        label: "Open-door label",
        instruction:
          "Check the top and side edges of the open door, then the exposed tub frame on the left and right. The label may face sideways, so use a flashlight rather than removing anything.",
      },
    ],
    examples: ["WDT750SAKZ1", "SHEM63W55N/01", "DW80CG4021SR/AA"],
    sources: [
      {
        title: "GE dishwasher label locations",
        url: "https://www.geappliances.com/ge/find-model-serial-number/dishwashers.htm",
        retrieved: RETRIEVED,
      },
      {
        title: "Bosch dishwasher E-Nr finder",
        url: "https://www.bosch-home.com/us/owner-support/serial-number-finder/dishwashers",
        retrieved: RETRIEVED,
      },
      {
        title: "Frigidaire model and serial label guidance",
        url: "https://owner.frigidaire.com/support-articles/article/1858491-where-can-i-find-my-model-and-serial-number-",
        retrieved: RETRIEVED,
      },
    ],
  },
  dryer: {
    kind: "dryer",
    title: "Find the dryer label",
    safety: "Stop and unplug the dryer. Wait for the drum to be completely still.",
    locations: [
      {
        id: "door-opening",
        label: "Door opening",
        instruction:
          "Open the door. Check the front face around the opening, the top of the opening, the door rim, and the inside face of the door.",
      },
    ],
    examples: ["GTD42EASJ2WW", "DVE45T6000W/A3", "ELFE7637AT"],
    sources: [
      {
        title: "GE dryer label locations",
        url: "https://www.geappliances.com/ge/find-model-serial-number/dryers.htm",
        retrieved: RETRIEVED,
      },
      {
        title: "Whirlpool model and serial locator",
        url: "https://producthelp.whirlpool.com/FAQ/Where_is_my_Model_and_Serial_Number_Located%3F",
        retrieved: RETRIEVED,
      },
    ],
  },
  refrigerator: {
    kind: "refrigerator",
    title: "Find the refrigerator label",
    safety: "Keep food cold by closing the doors between checks. Do not move the refrigerator.",
    locations: [
      {
        id: "fresh-food",
        label: "Fresh-food compartment",
        instruction:
          "Start inside the main food compartment. Check the upper side walls and ceiling, then look beside or behind the crisper drawers. Some layouts use a freezer wall or an outside cabinet side instead.",
      },
    ],
    examples: ["GSS25GYPFS", "B36CL80ENS/01", "FRSS2623AS"],
    sources: [
      {
        title: "GE side-by-side refrigerator label locations",
        url: "https://www.geappliances.com/ge/find-model-serial-number/side-by-side-refrigerators.htm",
        retrieved: RETRIEVED,
      },
      {
        title: "GE bottom-freezer refrigerator label locations",
        url: "https://www.geappliances.com/ge/find-model-serial-number/bottom-freezer-refrigerators.htm",
        retrieved: RETRIEVED,
      },
      {
        title: "LG refrigerator model and serial guidance",
        url: "https://www.lg.com/us/support/help-library/lg-refrigerator-how-to-find-my-model-and-serial-number--20153578508912",
        retrieved: RETRIEVED,
      },
    ],
  },
};

export function getModelNumberGuide(
  kind: ApplianceKind,
  loadStyle?: WasherLoadStyle,
): ModelNumberGuide {
  const guide = guides[kind];
  if (kind !== "washer" || !loadStyle) return guide;
  return {
    ...guide,
    locations: guide.locations.filter((location) => location.id === loadStyle),
  };
}

export function getBrandIdentifierHint(brand: BrandName | null): string | null {
  if (brand === "Bosch")
    return "Bosch calls the model the E-Nr. Copy the slash and two-digit suffix, such as /01.";
  if (brand === "LG")
    return "LG labels may add a suffix after a dot. Keep that suffix when it is printed.";
  if (brand === "Samsung")
    return "Samsung model codes often end with a slash suffix such as /A5 or /AA. Copy it.";
  if (brand === "Frigidaire" || brand === "Electrolux")
    return "The label may also show a product number. Keep it for later parts verification.";
  if (brand === "GE" || brand === "Hotpoint")
    return "A final engineering digit can change part fit. Copy every character on the model line.";
  return null;
}
