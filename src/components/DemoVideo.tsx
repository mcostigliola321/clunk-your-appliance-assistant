import { ExternalLink, Play, X } from "lucide-react";
import { useId, useState } from "react";

export function DemoVideo() {
  const [open, setOpen] = useState(false);
  const playerId = useId();

  return (
    <div className="demo-video">
      <div className="demo-video__actions">
        <button
          type="button"
          className="demo-video__toggle"
          aria-expanded={open}
          aria-controls={playerId}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
          {open ? "Close demo" : "Watch the 2:30 demo"}
        </button>
        <a href="https://youtu.be/9eQbt7B8rQs" target="_blank" rel="noopener noreferrer">
          Open on YouTube <ExternalLink size={14} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <p className="demo-video__note">
        See a person and browser agent find an exact dryer part. YouTube loads only when you open
        the demo.
      </p>
      <div id={playerId} hidden={!open}>
        {open ? (
          <iframe
            className="demo-video__player"
            src="https://www.youtube-nocookie.com/embed/9eQbt7B8rQs?autoplay=0&playsinline=1&cc_lang_pref=en"
            title="Clunk demo: a person and browser agent find an exact dryer part"
            width="800"
            height="450"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : null}
      </div>
    </div>
  );
}
