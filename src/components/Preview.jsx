// PreviewCard (modal) + ListView
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../motion.js";

export function PreviewCard({ project, onClose }) {
  const cardRef = useRef(null);
  const closeRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const titleId = `preview-title-${project.id}`;

  function requestClose() {
    setClosing(true);
  }

  // Exit animation plays (180ms), then the modal actually unmounts
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(onClose, prefersReducedMotion() ? 0 : 200);
    return () => clearTimeout(t);
  }, [closing, onClose]);

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current && closeRef.current.focus();

    function onKey(e) {
      if (e.key === "Escape") {
        requestClose();
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      // Keep Tab cycling inside the card
      const focusables = cardRef.current.querySelectorAll(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!cardRef.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener && typeof opener.focus === "function" && opener.focus();
    };
  }, []);

  return (
    <div
      className={`scrim${closing ? " closing" : ""}`}
      onClick={requestClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={cardRef}
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ "--tc": project.tint }}
      >
        <button ref={closeRef} className="card-close" onClick={requestClose} aria-label="Close">×</button>
        <div className="card-image">
          <div className="wash"></div>
          <span className="stamp">{project.imgLabel}</span>
          <span className="corner-num">{project.num}</span>
          <span className="pencil">{project.pencil}</span>
        </div>
        <div className="card-body">
          <div className="meta">
            <span>{project.year}</span>
            <span>{project.medium}</span>
            <span>{project.role}</span>
            {project.tools && project.tools !== "—" && <span>{project.tools}</span>}
          </div>
          <h2 id={titleId}>{project.title}</h2>
          <p className="desc">{project.description}</p>
          <div className="tags">
            {project.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          {project.link ? (
            <a href={project.link} className="open" target="_blank" rel="noreferrer">
              <span className="tint-dot"></span>
              Open project →
            </a>
          ) : (
            <span className="open soon">
              <span className="tint-dot"></span>
              Case study — coming soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ListView({ projects, onOpen }) {
  return (
    <section className="listview view-anim">
      <div className="intertitle">
        <hr />
        <span className="label">All Work · A–Z by reel</span>
        <hr />
      </div>
      <div className="list-rows">
        {projects.map((p, i) => (
          <div
            key={p.id}
            className="list-row"
            style={{ "--tc": p.tint, "--i": i }}
            onClick={() => onOpen(p)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen(p);
              }
            }}
          >
            <div className="swatch" aria-hidden="true"></div>
            <div className="title">
              {p.num} &nbsp; {p.title}
              <span className="pencil">{p.pencil}</span>
            </div>
            <div className="meta">{p.medium} · {p.year}</div>
            <div className="desc">{p.description}</div>
            <div className="open-arrow">→</div>
          </div>
        ))}
      </div>
    </section>
  );
}
