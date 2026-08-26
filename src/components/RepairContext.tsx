export function RepairContext() {
  return (
    <section className="repair-context" aria-labelledby="repair-context-title">
      <div className="section-kicker">Repair or replace?</div>
      <h2 id="repair-context-title">Keep the decision in context.</h2>
      <div className="context-scale">
        <div>
          <span className="context-scale__marker context-scale__marker--low" />
          <strong>Clean</strong>
          <span>Accessible filter</span>
        </div>
        <div>
          <span className="context-scale__marker context-scale__marker--mid" />
          <strong>Service</strong>
          <span>Hose or pump</span>
        </div>
        <div>
          <span className="context-scale__marker context-scale__marker--high" />
          <strong>Consider replace</strong>
          <span>Repeated major faults</span>
        </div>
      </div>
      <p>
        Educational context only. Age, condition, warranty, and real service quotes are not modeled.
      </p>
    </section>
  );
}
