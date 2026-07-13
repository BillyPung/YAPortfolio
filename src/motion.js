// Central check so JS-driven motion (smooth scrolling, exit-animation waits)
// honors the same preference the CSS media query does.
import { flushSync } from "react-dom";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function canViewFlip() {
  return (
    !prefersReducedMotion() &&
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function"
  );
}

// Film match-cut between views: the View Transitions API morphs elements
// that share a view-transition-name (the identity name, the intertitle).
// `kind` picks the editing grammar — CSS scopes each treatment to
// html[data-vt="<kind>"]: "dip" (splash → home), "advance-fwd" /
// "advance-back" (button flips), "iris" (the name-drop flip).
// Falls back to a plain state swap — CSS keeps the .view-anim entrance there.
export function viewFlip(update, kind = "cut") {
  if (!canViewFlip()) {
    update();
    return;
  }
  const root = document.documentElement;
  root.setAttribute("data-vt", kind);
  const transition = document.startViewTransition(() => {
    flushSync(update);
  });
  transition.finished.finally(() => {
    if (root.getAttribute("data-vt") === kind) root.removeAttribute("data-vt");
  });
}
