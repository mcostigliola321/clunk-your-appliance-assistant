import { Bot, CircleCheck, CircleDashed, CircleOff } from "lucide-react";

import type { WebMcpStatus } from "@/domain/types";

const STATUS_COPY: Record<WebMcpStatus, { label: string; detail: string }> = {
  detecting: { label: "Connecting", detail: "Checking browser support" },
  ready: { label: "Browser agent ready", detail: "WebMCP tools are available" },
  unavailable: { label: "Guided mode", detail: "Use the same flow without WebMCP" },
  partial: { label: "Guided mode", detail: "Some browser tools are unavailable" },
  failed: { label: "Guided mode", detail: "Use the same flow without WebMCP" },
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
