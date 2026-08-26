import { Bot, CircleCheck, CircleDashed, CircleOff } from "lucide-react";

import type { WebMcpStatus } from "@/domain/types";

const STATUS_COPY: Record<WebMcpStatus, { label: string; detail: string }> = {
  detecting: { label: "Checking WebMCP", detail: "Looking for browser tool support" },
  ready: { label: "Agent tools ready", detail: "Eight WebMCP tools registered" },
  unavailable: { label: "Manual mode ready", detail: "This browser does not expose WebMCP" },
  partial: { label: "Some tools ready", detail: "Manual mode remains available" },
  failed: { label: "Manual mode ready", detail: "Tool registration was blocked" },
};

export function StatusPill({ status }: { status: WebMcpStatus }) {
  const copy = STATUS_COPY[status];
  const Icon =
    status === "ready"
      ? CircleCheck
      : status === "detecting"
        ? CircleDashed
        : status === "unavailable" || status === "failed"
          ? CircleOff
          : Bot;

  return (
    <div className={`status-pill status-pill--${status}`} title={copy.detail}>
      <Icon aria-hidden="true" size={16} strokeWidth={2} />
      <span>{copy.label}</span>
    </div>
  );
}
