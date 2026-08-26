import type { RankedCause } from "@/domain/types";

export function CauseStack({ causes, visible }: { causes: RankedCause[]; visible: boolean }) {
  return (
    <section className={`cause-stack ${visible ? "is-visible" : ""}`} aria-labelledby="cause-title">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Evidence ranking</div>
          <h2 id="cause-title">Likely causes</h2>
        </div>
        <span className="scenario-label">Deterministic</span>
      </div>
      {visible ? (
        <ol className="cause-list" aria-label="Likely causes">
          {causes.map((cause, index) => (
            <li key={cause.id}>
              <span className="cause-rank">{index + 1}</span>
              <span className="cause-copy">
                <strong>{cause.label}</strong>
                <span>{cause.explanation}</span>
              </span>
              <span className={`confidence confidence--${cause.confidence.replace(" ", "-")}`}>
                {cause.confidence}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-copy">
          Results will reorder as you report what you can physically observe.
        </p>
      )}
    </section>
  );
}
