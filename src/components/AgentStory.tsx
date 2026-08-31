import { ArrowRight, Eye, Search, ShieldCheck } from "lucide-react";

export function AgentStory() {
  return (
    <section className="agent-story" aria-labelledby="agent-story-title">
      <p className="agent-story__eyebrow">Built for WebMCP</p>
      <h2 id="agent-story-title">The page is the protocol.</h2>
      <p className="agent-story__lead">
        Use Clunk yourself, or let a browser agent move through the same visible guide. Either way,
        the model, safety checks, and part rules stay the same.
      </p>
      <ol className="agent-story__steps">
        <li>
          <Search size={18} aria-hidden="true" />
          <span>
            <strong>Find the exact model</strong>
            <small>The agent can search the same supported catalog you see.</small>
          </span>
        </li>
        <li>
          <Eye size={18} aria-hidden="true" />
          <span>
            <strong>You report what is there</strong>
            <small>Clunk asks for physical observations an agent cannot invent.</small>
          </span>
        </li>
        <li>
          <ShieldCheck size={18} aria-hidden="true" />
          <span>
            <strong>The next tool unlocks</strong>
            <small>A part lookup appears only when the model and observations allow it.</small>
          </span>
        </li>
      </ol>
      <p className="agent-story__point">
        Clunk keeps one guarded repair state for the person and the browser agent.
        <ArrowRight size={16} aria-hidden="true" />
      </p>
    </section>
  );
}
