// Splash — name + quote, dismisses after 1.5s or on any input
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, canViewFlip, viewFlip } from "../motion.js";

const MODIFIER_KEYS = ["Shift", "Alt", "Meta", "Control"];

export default function Splash({ onDismiss, skip }) {
  const [hidden, setHidden] = useState(skip);
  const [astOpen, setAstOpen] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (skip) return;
    // Reduced motion: the CSS fade is instant, so don't make users wait for it
    const fadeMs = prefersReducedMotion() ? 0 : 700;

    function dismiss() {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      clearTimeout(timer);
      if (canViewFlip()) {
        // dip to slate: lights down for a beat, the reel comes up, and the
        // name travels from the splash into the hero (identity survives the cut)
        viewFlip(() => {
          setHidden(true);
          onDismiss();
        }, "dip");
      } else {
        setHidden(true);
        setTimeout(onDismiss, fadeMs);
      }
    }

    const timer = setTimeout(dismiss, 1500);

    function dismissEarly(e) {
      // ignore clicks on the asterisk
      if (e.target && e.target.closest && e.target.closest(".asterisk")) return;
      // a lone modifier press isn't an "enter" gesture
      if (e.key && MODIFIER_KEYS.includes(e.key)) return;
      dismiss();
    }
    window.addEventListener("click", dismissEarly);
    window.addEventListener("keydown", dismissEarly);
    window.addEventListener("touchstart", dismissEarly);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", dismissEarly);
      window.removeEventListener("keydown", dismissEarly);
      window.removeEventListener("touchstart", dismissEarly);
    };
  }, [skip, onDismiss]);

  return (
    <div className="splash" data-hidden={hidden} aria-hidden={hidden}>
      <div className="splash-inner">
        <h1 className="splash-name">
          Shengyang
          <span
            className="asterisk"
            data-open={astOpen}
            onClick={(e) => { e.stopPropagation(); setAstOpen(!astOpen); }}
            tabIndex={0}
          >
            *
            <span className="asterisk-tip">— notebook, undated</span>
          </span>
        </h1>
        <p className="splash-quote">
          40% of my body is made of games.
        </p>
        <div className="splash-hint">
          <span className="dot"></span>tap anywhere to enter
        </div>
      </div>
    </div>
  );
}
