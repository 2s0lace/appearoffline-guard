// Wakes the mascot on the blocked page once the pause is over:
// sleep → waking (eyes half open, arm raised) → awake (eyes open, smile, a few waves).

const WAKING_MS = 450;
const WAVE_CYCLES_PER_SECOND = 1.4;
const WAVE_CYCLES = 3;
const ARM_REST_ANGLE = -12;
const ARM_PIVOT = "975 830";

// t is measured in wave cycles (1 = one full back-and-forth).
export const waveAngle = (t: number) => ARM_REST_ANGLE + 10 * Math.sin(2 * Math.PI * t);

const setArm = (arm: Element, angle: number) => {
  arm.setAttribute("transform", `rotate(${angle} ${ARM_PIVOT})`);
};

export const wakeGhost = (ghost: SVGSVGElement | null) => {
  if (!ghost || ghost.dataset.state !== "sleep") {
    return;
  }
  const arm = ghost.querySelector("#ghost-arm");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const finish = () => {
    ghost.dataset.state = "awake";
    if (arm) {
      setArm(arm, ARM_REST_ANGLE);
    }
  };

  if (reducedMotion || !arm) {
    finish();
    return;
  }

  ghost.dataset.state = "waking";
  window.setTimeout(() => {
    finish();
    const start = performance.now();
    const step = (now: number) => {
      const t = ((now - start) / 1000) * WAVE_CYCLES_PER_SECOND;
      if (t >= WAVE_CYCLES) {
        setArm(arm, ARM_REST_ANGLE);
        return;
      }
      setArm(arm, waveAngle(t));
      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, WAKING_MS);
};
