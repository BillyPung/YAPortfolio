// FilmStrip + FilmCell + NameSlotCell — horizontal scrollable filmstrip
import React, { useState, useEffect, useRef, useLayoutEffect, forwardRef } from "react";
import { prefersReducedMotion } from "../motion.js";

function Sprockets({ where }) {
  const holes = Array.from({ length: 24 }).map((_, i) => (
    <span key={i} className="sprocket-hole"></span>
  ));
  return <div className={`sprockets ${where}`}>{holes}</div>;
}

const NameSlotCell = forwardRef(function NameSlotCell(
  { dragging, over, dropped, onActivate },
  ref
) {
  const cls = [
    "cell", "name-slot",
    dragging ? "drag-active" : "",
    over ? "drag-over" : "",
    dropped ? "drag-dropped" : "",
  ].filter(Boolean).join(" ");
  return (
    <article
      ref={ref}
      className={cls}
      style={{ "--cell-w": "400px", "--cell-ar": "400 / 300" }}
      tabIndex={0}
      role="button"
      onClick={(e) =>
        // real clicks seed the iris origin; synthetic (0,0) activations don't
        onActivate(e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : undefined)
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      aria-label="Title card — open the archive view, or drop the name here"
    >
      <div className="cell-frame">
        <Sprockets where="top" />
        <Sprockets where="bot" />
        <div className="name-slot-inner">
          <span className="corner-mark">drop here</span>
          <span className="ghost">Shengyang</span>
          <span className="hint">
            {over ? "let go to flip the reel" :
             dragging ? "right here ↓" :
             "drag the name here — or just click this frame"}
          </span>
        </div>
      </div>
      <div className="cell-caption">
        <span className="num">—</span>
        <span className="title">Title card</span>
        <span className="medium">Drag-back · Archive</span>
      </div>
    </article>
  );
});

function FilmCell({ project, index, onOpen, focused, setFocused, autoScroll }) {
  const ref = useRef(null);

  useEffect(() => {
    if (autoScroll && focused === index && ref.current) {
      ref.current.focus({ preventScroll: false });
      ref.current.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [focused, index, autoScroll]);

  return (
    <article
      ref={ref}
      className="cell"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(project);
        }
      }}
      onFocus={() => setFocused(index)}
      style={{
        "--tc": project.tint,
        "--cell-w": project.aspect.w + "px",
        "--cell-ar": `${project.aspect.w} / ${project.aspect.h}`,
      }}
      aria-label={`${project.title}, ${project.medium}, ${project.year}`}
    >
      <div className="cell-frame">
        <Sprockets where="top" />
        <Sprockets where="bot" />
        <div className="cell-img" aria-hidden="true">
          <span className="cell-img-label">{project.imgLabel}</span>
        </div>
        <span className="cell-pencil" data-pos={project.pencilPos}>
          {project.pencil}
        </span>
        <div className="cell-band">
          <div className="meta">
            {project.num} · {project.medium} · {project.year}
          </div>
          <div className="title">{project.title}</div>
        </div>
      </div>
      <div className="cell-caption">
        <span className="num">{project.num}</span>
        <span className="title">{project.title}</span>
        <span className="medium">{project.medium} · {project.year}</span>
      </div>
    </article>
  );
}

export default function FilmStrip({ projects, onOpen, onArchive, modalOpen, dropTargetRef, dragState, dropped }) {
  const stripRef = useRef(null);
  const [focused, setFocused] = useState(1); // arrow-step start (project index)
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Center the strip on initial mount — anchor on the name slot itself,
  // which sits between projects 02 and 03 (child index 2).
  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    // children: 0=Foley(01), 1=Tide Atlas(02), 2=NAME SLOT, 3=Cutting Room(03), 4=Greenhouse(04)
    const target = strip.children[2];
    if (!target) return;
    const left = (target.offsetLeft + target.offsetWidth / 2) - strip.clientWidth / 2;
    const prev = strip.style.scrollBehavior;
    strip.style.scrollBehavior = "auto";
    strip.scrollLeft = left;
    requestAnimationFrame(() => {
      const t2 = strip.children[2];
      if (t2) {
        strip.scrollLeft = (t2.offsetLeft + t2.offsetWidth / 2) - strip.clientWidth / 2;
      }
      strip.style.scrollBehavior = prev;
    });
  }, []);

  // Arrow keys step through projects (skipping the name slot);
  // stand down while the preview modal owns the keyboard.
  useEffect(() => {
    function onKey(e) {
      if (modalOpen) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocused((i) => Math.min(i + 1, projects.length - 1));
        setHasInteracted(true);
        setShowHint(true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocused((i) => Math.max(i - 1, 0));
        setHasInteracted(true);
        setShowHint(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [projects.length, modalOpen]);

  // Map vertical wheel → horizontal scroll, but only while the strip can
  // still move in that direction — otherwise let the page scroll normally.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    function onWheel(e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = strip.scrollWidth - strip.clientWidth;
      const canScroll = e.deltaY > 0 ? strip.scrollLeft < max - 1 : strip.scrollLeft > 1;
      if (!canScroll) return;
      strip.scrollLeft += e.deltaY;
      e.preventDefault();
    }
    strip.addEventListener("wheel", onWheel, { passive: false });
    return () => strip.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 1800);
    return () => clearTimeout(t);
  }, []);

  function step(dir) {
    setFocused((i) => Math.max(0, Math.min(projects.length - 1, i + dir)));
    setHasInteracted(true);
    setShowHint(true);
  }

  return (
    <section className="view-anim">
      <div className="intertitle">
        <hr />
        <span className="label">Featured · 2026</span>
        <hr />
      </div>
      <div className="filmstrip-wrap">
        <div className="filmstrip" ref={stripRef} role="list">
          {projects.map((p, i) => {
            const cell = (
              <FilmCell
                key={p.id}
                project={p}
                index={i}
                onOpen={onOpen}
                focused={focused}
                setFocused={setFocused}
                autoScroll={hasInteracted}
              />
            );
            // Insert the name slot between projects 02 and 03
            if (i === 2) {
              return (
                <React.Fragment key="slot-and-cell">
                  <NameSlotCell
                    ref={dropTargetRef}
                    dragging={dragState && dragState.dragging}
                    over={dragState && dragState.over}
                    dropped={dropped}
                    onActivate={onArchive}
                  />
                  {cell}
                </React.Fragment>
              );
            }
            return cell;
          })}
        </div>
        <div className="strip-foot">
          <div className="left">
            <button className="step-btn" aria-label="Previous" onClick={() => step(-1)}>←</button>
            <button className="step-btn" aria-label="Next" onClick={() => step(1)} style={{ marginLeft: 8 }}>→</button>
          </div>
          <div className="indicator" aria-live="polite">
            <span>{String(focused + 1).padStart(2, "0")}</span>
            <span className="total"> / {String(projects.length).padStart(2, "0")}</span>
          </div>
          <div className="right">
            <span className={`kbd-hint ${showHint ? "visible" : ""}`}>
              <span className="kbd">←</span><span className="kbd">→</span> to step
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
