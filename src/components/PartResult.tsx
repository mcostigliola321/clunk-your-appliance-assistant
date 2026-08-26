import { BadgeCheck, Wrench } from "lucide-react";

import type { RepairPackPart } from "@/domain/types";

export function PartResult({ part }: { part: RepairPackPart | null }) {
  if (!part) return null;

  return (
    <section className="part-result" aria-labelledby="part-title">
      <div className="part-result__icon" aria-hidden="true">
        <Wrench size={20} />
      </div>
      <div className="part-result__body">
        <div className="section-kicker">Fictional part match</div>
        <h2 id="part-title">{part.name}</h2>
        <div className="part-sku">{part.sku}</div>
        <dl className="part-details">
          <div>
            <dt>Demo model</dt>
            <dd>
              <BadgeCheck size={15} aria-hidden="true" /> {part.compatibleModel}
            </dd>
          </div>
          <div>
            <dt>Illustrative effort</dt>
            <dd>{part.effort}</dd>
          </div>
          <div>
            <dt>Install boundary</dt>
            <dd>
              {part.installBoundary === "professional-only"
                ? "Professional only"
                : "User-cleanable demo item"}
            </dd>
          </div>
        </dl>
        <p className="part-disclaimer">
          Not a real product, price, compatibility claim, or purchase link.
        </p>
      </div>
    </section>
  );
}
