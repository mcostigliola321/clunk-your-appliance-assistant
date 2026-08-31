export function AgentStory() {
  return (
    <section className="agent-story" aria-labelledby="agent-story-title">
      <p className="agent-story__eyebrow">WebMCP with a human boundary</p>
      <h2 id="agent-story-title">A browser can help. It cannot say what you see.</h2>
      <p className="agent-story__lead">
        Clunk gives a browser agent the same guide you use, but keeps physical observations with the
        person standing in front of the appliance.
      </p>
      <dl className="agent-story__roles">
        <div>
          <dt>Browser agent</dt>
          <dd>Searches supported models and moves the guide to the current location.</dd>
        </div>
        <div>
          <dt>Person</dt>
          <dd>Reads the label and reports only what is physically there.</dd>
        </div>
        <div>
          <dt>Clunk</dt>
          <dd>Unlocks only the next allowed action and removes the buying path after a hazard.</dd>
        </div>
      </dl>
      <p className="agent-story__point">
        Both use one repair state, so the safety rules cannot drift.
      </p>
    </section>
  );
}
