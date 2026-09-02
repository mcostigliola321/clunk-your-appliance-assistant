import { defineMcp } from "@lovable.dev/mcp-js";

import findModelNumberTool from "./tools/find-model-number";
import getApplianceCoverageTool from "./tools/get-appliance-coverage";
import getRepairGuideTool from "./tools/get-repair-guide";
import runDiagnosisTool from "./tools/run-diagnosis";
import searchAppliancesTool from "./tools/search-appliances";

export default defineMcp({
  name: "clunk-your-appliance-assistant",
  title: "Clunk: Your Appliance Assistant",
  version: "0.1.0",
  instructions:
    "Clunk is a deterministic, source-backed appliance repair guide for a bounded catalog of U.S. washers, dishwashers, electric dryers, and refrigerators. Start with search_appliances, then get_appliance_coverage, then get_repair_guide. Ask the person to perform each safe check and report what they saw, then pass those observations to run_diagnosis. Use find_model_number to help the person read their complete model code; an exact-part answer requires it. Never infer a model, a nearby SKU, or an observation on the person's behalf, and never advise work beyond the guide's stated safe boundary.",
  tools: [
    searchAppliancesTool,
    getApplianceCoverageTool,
    getRepairGuideTool,
    runDiagnosisTool,
    findModelNumberTool,
  ],
});
