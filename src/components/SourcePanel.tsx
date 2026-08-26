import { ExternalLink } from "lucide-react";

import type { SourceReference } from "@/domain/types";

export function SourcePanel({ sources }: { sources: SourceReference[] }) {
  if (!sources.length) return null;
  return (
    <section className="source-panel" aria-labelledby="source-panel-title">
      <div className="section-heading">
        <h2 id="source-panel-title">Manufacturer information</h2>
        <span className="source-count">{sources.length} sources</span>
      </div>
      <ul>
        {sources.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer">
              <span>
                <strong>{source.title}</strong>
                <small>
                  {source.publisher} · checked {source.lastVerified}
                </small>
              </span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
