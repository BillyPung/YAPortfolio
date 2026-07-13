// Main app — orchestrates splash → home (filmstrip + name slot / list) → preview card
import { useState, useEffect, useRef } from "react";
import { PROJECTS } from "./data.js";
import { viewFlip } from "./motion.js";
import Splash from "./components/Splash.jsx";
import { Hero, Marquee, Footer } from "./components/Chrome.jsx";
import FilmStrip from "./components/FilmStrip.jsx";
import { PreviewCard, ListView } from "./components/Preview.jsx";

export default function App() {
  const splashSeen =
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem("dn:splash-seen") === "1";
  const [resolved, setResolved] = useState(splashSeen);
  const [view, setView] = useState("strip"); // "strip" | "list"
  const [preview, setPreview] = useState(null);

  const tugSeen =
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem("dn:tug-seen") === "1";
  const [showTugCue, setShowTugCue] = useState(!tugSeen);

  // Drag-back state — Hero writes to it, name slot reads from it
  const dropTargetRef = useRef(null);
  const [dragState, setDragState] = useState({ dragging: false, over: false });
  const [dropped, setDropped] = useState(false); // brief success flash

  useEffect(() => {
    if (resolved && showTugCue) {
      const t = setTimeout(() => {
        setShowTugCue(false);
        try { sessionStorage.setItem("dn:tug-seen", "1"); } catch {}
      }, 8000);
      return () => clearTimeout(t);
    }
  }, [resolved, showTugCue]);

  function handleSplashDismiss() {
    setResolved(true);
    try { sessionStorage.setItem("dn:splash-seen", "1"); } catch {}
  }

  // Button flips read as the reel advancing a frame: forward into the
  // archive, back to the strip.
  function flipTo(next) {
    viewFlip(() => setView(next), next === "list" ? "advance-fwd" : "advance-back");
  }

  function handleDragBack(point) {
    setDropped(true);
    setShowTugCue(false);
    try { sessionStorage.setItem("dn:tug-seen", "1"); } catch {}
    // brief flash before flipping to list
    setTimeout(() => {
      // the archive irises open from the exact point the name was released
      // (or clicked); keyboard activation falls back to the frame's center
      let { x, y } = point || {};
      if (x == null || y == null) {
        const slot = dropTargetRef.current;
        if (slot) {
          const r = slot.getBoundingClientRect();
          x = r.left + r.width / 2;
          y = r.top + r.height / 2;
        }
      }
      if (x != null && y != null) {
        const root = document.documentElement;
        root.style.setProperty("--vt-x", `${Math.round(x)}px`);
        root.style.setProperty("--vt-y", `${Math.round(y)}px`);
      }
      viewFlip(() => {
        setView("list");
        setDropped(false);
      }, "iris");
    }, 380);
  }

  return (
    <div className="app" data-resolved={resolved}>
      {!splashSeen && <Splash skip={false} onDismiss={handleSplashDismiss} />}
      {view === "strip" ? (
        <Hero
          resolved={resolved}
          setView={flipTo}
          onDragBack={handleDragBack}
          showTugCue={resolved && showTugCue}
          dropTargetRef={dropTargetRef}
          onDragStateChange={setDragState}
          dragState={dragState}
        />
      ) : (
        <Marquee setView={flipTo} />
      )}
      {view === "strip" ? (
        <FilmStrip
          projects={PROJECTS}
          onOpen={setPreview}
          onArchive={handleDragBack}
          modalOpen={preview != null}
          dropTargetRef={dropTargetRef}
          dragState={dragState}
          dropped={dropped}
        />
      ) : (
        <ListView projects={PROJECTS} onOpen={setPreview} />
      )}
      <Footer />
      {preview && <PreviewCard project={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
