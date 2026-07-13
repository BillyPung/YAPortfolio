// Hero (strip view, draggable name) + Marquee (list view) + Footer
import { useState, useRef } from "react";
import { prefersReducedMotion } from "../motion.js";

// Shared pointer-drag logic for the draggable name
function useDraggableName({ resolved, onDragBack, dropTargetRef, onDragStateChange }) {
  const nameRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const overRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const lastPointRef = useRef(null); // where the pointer released — the iris origin

  function onPointerDown(e) {
    if (resolved === false) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    nameRef.current?.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    overRef.current = false;
    setDragging(true);
    setDragOffset({ x: 0, y: 0 });
    onDragStateChange && onDragStateChange({ dragging: true, over: false });
    // Keep the destination centered without scrolling the page under the
    // user's finger. scrollIntoView() can nudge the mobile viewport vertically.
    if (dropTargetRef && dropTargetRef.current) {
      const target = dropTargetRef.current;
      const strip = target.closest(".filmstrip");
      if (strip) {
        const left = target.offsetLeft + target.offsetWidth / 2 - strip.clientWidth / 2;
        if (prefersReducedMotion()) strip.scrollLeft = left;
        else strip.scrollTo({ left, behavior: "smooth" });
      }
    }
  }

  function onPointerMove(e) {
    if (!dragging) return;
    e.preventDefault();
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    setDragOffset({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
    let nowOver = false;
    if (dropTargetRef && dropTargetRef.current) {
      const r = dropTargetRef.current.getBoundingClientRect();
      nowOver =
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom;
    }
    if (nowOver !== overRef.current) {
      overRef.current = nowOver;
      onDragStateChange && onDragStateChange({ dragging: true, over: nowOver });
    }
  }

  function onPointerUp() {
    if (!dragging) return;
    const wasOver = overRef.current;
    setDragging(false);
    setDragOffset({ x: 0, y: 0 });
    overRef.current = false;
    onDragStateChange && onDragStateChange({ dragging: false, over: false });
    if (wasOver) onDragBack(lastPointRef.current);
  }

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onContextMenu: (e) => e.preventDefault(),
    onDragStart: (e) => e.preventDefault(),
  };
  const style = dragging
    ? { transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)` }
    : null;
  return { nameRef, dragging, handlers, style };
}

// Strip-view hero — restrained, left-aligned. Marquee is hidden for immersion.
export function Hero({ resolved, setView, onDragBack, showTugCue, dropTargetRef, onDragStateChange, dragState }) {
  const { nameRef, dragging, handlers, style } = useDraggableName({
    resolved, onDragBack, dropTargetRef, onDragStateChange,
  });
  const over = dragState && dragState.over;

  return (
    <header className="hero view-anim">
      <div className="hero-left">
        <div className="hero-eyebrow">Portfolio · Director's Notebook</div>
        <div
          ref={nameRef}
          className={`hero-name${dragging ? " dragging" : ""}`}
          style={style}
          {...handlers}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onDragBack();
            }
          }}
          title="Drag my name into the empty frame in the reel"
          draggable={false}
          tabIndex={0}
          role="button"
          aria-label="Open the archive view — drag the name into the empty frame, or press Enter"
        >
          Shengyang
        </div>
        <div className="hero-role">Game creator, multimedia artist &amp; mixed reality creator</div>
        <div className={`hero-tip${dragging ? " holding" : ""}`}>
          <span className="grip" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
          <span className="hero-tip-text">
            {over
              ? <><span className="hand">let go — </span>flip the reel into the archive</>
              : dragging
                ? <><span className="hand">keep going → </span>the empty frame in the middle</>
                : <>Pick up my name and <span className="hand">drop it in the empty frame ↘</span> to open the archive</>}
          </span>
        </div>
        {showTugCue && !dragging && (
          <div className="hero-tug" aria-hidden="true">grab me ↑</div>
        )}
      </div>
      <div className="hero-right">
        <button className="hero-listview" onClick={() => setView("list")}>
          ↳ list view
        </button>
      </div>
    </header>
  );
}

// List-view marquee — full chrome returns; name is "home", not draggable.
// Nav is trimmed to sections that exist; more return with their destinations.
export function Marquee({ setView }) {
  return (
    <header className="marquee view-anim">
      <div className="marquee-name" title="Shengyang">Shengyang</div>
      <nav className="marquee-nav" aria-label="Sections">
        <button className="active">Work</button>
      </nav>
      <button className="marquee-listview" onClick={() => setView("strip")}>
        ↳ filmstrip
      </button>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="left">© 2026 — Shengyang</div>
      <div className="center">A record playing two rooms over.</div>
      <div className="right">EN · ZH (soon)</div>
    </footer>
  );
}
