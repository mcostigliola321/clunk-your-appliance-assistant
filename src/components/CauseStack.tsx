import type { RankedCause } from "@/domain/types";

export function CauseStack({ causes, visible }: { causes: RankedCause[]; visible: boolean }) {
  return (
    <section className={`cause-stack ${visible ? "is-visible" : ""}`} aria-labelledby="cause-title">
      <div className="section-heading">
        <h2 id="cause-title">What could be wrong</h2>
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
                {cause.confidence === "strong match"
                  ? "Most likely"
                  : cause.confidence === "likely"
                    ? "Likely"
                    : "Possible"}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-copy">Clunk updates this list as you answer each question.</p>
      )}
    </section>
  );
}
