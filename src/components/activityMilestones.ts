import type { ActivityEvent } from "@/domain/types";

export function getActivityMilestone(event: ActivityEvent | undefined): string {
  if (!event) return "Repair catalog ready";
  if (event.outcome === "rejected") return "Request rejected safely";
  switch (event.action) {
    case "catalog_ready":
      return "Repair catalog ready";
    case "search_supported_appliances":
      return event.message.startsWith("No matching")
        ? "Unsupported model confirmed"
        : "Model search completed";
    case "select_appliance":
      return "Appliance selected";
    case "get_repair_state":
      return "Shared repair state checked";
    case "start_diagnosis":
      return "Waiting for your inspection";
    case "show_component":
      return "Inspection point highlighted";
    case "record_observation":
      return event.message.toLowerCase().includes("stop")
        ? "Safety stop recorded"
        : "Observation recorded";
    case "find_compatible_part":
      return "Part lookup unlocked and used";
    case "stop_and_escalate":
      return "Safety stop recorded";
    default:
      return "Shared repair bench updated";
  }
}
