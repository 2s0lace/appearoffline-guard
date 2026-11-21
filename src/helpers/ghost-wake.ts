// Wakes the mascot on the blocked page once the pause is over:
// sleep → waking (eyes half open) → awake (eyes open, smile).

const WAKING_MS = 450;

export const wakeGhost = (ghost: SVGSVGElement | null) => {
  if (!ghost || ghost.dataset.state !== "sleep") {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    ghost.dataset.state = "awake";
    return;
  }

  ghost.dataset.state = "waking";
  window.setTimeout(() => {
    ghost.dataset.state = "awake";
  }, WAKING_MS);
};
