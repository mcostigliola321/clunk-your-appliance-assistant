import { Bot, Check, CircleUserRound, Code2, X } from "lucide-react";

import type { ActivityEvent } from "@/domain/types";

import { getActivityMilestone } from "./activityMilestones";

const SOURCE_LABELS: Record<ActivityEvent["source"], string> = {
  agent: "Agent",
  human: "You",
  manual: "Inspector",
  system: "Clunk",
  example: "Example",
};

function SourceIcon({ source }: { source: ActivityEvent["source"] }) {
  if (source === "agent") return <Bot size={16} aria-hidden="true" />;
  if (source === "manual") return <Code2 size={16} aria-hidden="true" />;
  if (source === "human") return <CircleUserRound size={16} aria-hidden="true" />;
  return <Check size={16} aria-hidden="true" />;
}

export function ActivityLog({ activity }: { activity: ActivityEvent[] }) {
  const recent = activity.slice(-8);

  return (
    <section className="activity-log" aria-labelledby="activity-title" role="region">
      <div className="section-heading">
        <h2 id="activity-title">Shared activity</h2>
        <span className="activity-count">{activity.length} updates</span>
      </div>
      <ol className="activity-list">
        {recent.map((event) => (
          <li key={event.id}>
            <span className={`activity-source activity-source--${event.source}`}>
              <SourceIcon source={event.source} />
            </span>
            <span className="activity-event">
              <span>
                <strong>{SOURCE_LABELS[event.source]}</strong>
                <span className="activity-milestone">{getActivityMilestone(event)}</span>
              </span>
              <span>{event.message}</span>
              <code className="activity-action">{event.action}</code>
            </span>
            <span className={`activity-outcome activity-outcome--${event.outcome}`}>
              {event.outcome === "accepted" ? (
                <Check size={14} aria-label="Accepted" />
              ) : (
                <X size={14} aria-label="Rejected" />
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
