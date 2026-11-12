/**
 * Mutable state shared between the DOM (GSAP / ScrollTrigger / pointer events) and the
 * WebGL scene (read every frame inside useFrame). Plain object = zero React re-renders.
 */

export type SegmentName =
  | "pourEnter"
  | "pour"
  | "ingredientsEnter"
  | "ingredients"
  | "ritualEnter"
  | "ritual"
  | "menuEnter"
  | "storyEnter";

export const DEFAULT_LIQUID = "#9a5b2e";

/** Render layer for decorative objects (spices, dust) so contact shadows ignore them. */
export const FX_LAYER = 1;

export const sceneState = {
  /** Normalised pointer, -1..1 */
  mouse: { x: 0, y: 0 },
  /** 0..1 progress for each scroll segment, written by ScrollTriggers */
  segments: {
    pourEnter: 0,
    pour: 0,
    ingredientsEnter: 0,
    ingredients: 0,
    ritualEnter: 0,
    ritual: 0,
    menuEnter: 0,
    storyEnter: 0,
  } as Record<SegmentName, number>,
  /** Target chai colour (menu hover) */
  liquidColor: DEFAULT_LIQUID,
  /** Ingredients: which spice is featured. Desktop = continuous panel index, mobile = integer */
  featured: -1,
  /** True when the ingredients section uses vertical stacking (mobile / reduced motion) */
  stacked: false,
  isMobile: false,
  reducedMotion: false,
  /** Hero intro progress 0..1 (cup rises in after the preloader) */
  intro: 0,
};

export type Pose = {
  x: number;
  y: number;
  z: number;
  scale: number;
  /** liquid fill, 0..1 of the inner height */
  level: number;
  /** pour stream: head (0..1 reveal from top) and tail (0..1 retract) */
  pourHead: number;
  pourTail: number;
  /** camera orbit, 0..1 = one full revolution */
  orbit: number;
  /** 0 = spices orbit the cup, 1 = spices move to their ingredient panels */
  showcase: number;
  steam: number;
};

export const createPose = (): Pose => ({
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
  level: 0.42,
  pourHead: 0,
  pourTail: 0,
  orbit: 0,
  showcase: 0,
  steam: 1,
});

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * The "director": walks the story in order. Each segment blends the pose from wherever
 * the previous segment left it toward its own target, so scrolling up or down (or
 * jumping straight to the middle of the page) always resolves to the right pose.
 */
export function computePose(out: Pose) {
  const s = sceneState.segments;
  const m = sceneState.isMobile;

  let x = 0;
  let y = lerp(-2.6, 0, ease(clamp01(sceneState.intro)));
  let scale = m ? 0.78 : 1;
  let level = 0.42;
  let steam = 1;
  let showcase = 0;

  // 2. The Pour — cup glides aside, stream fills it
  const a = ease(s.pourEnter);
  x = lerp(x, m ? 0 : 1.35, a);
  y = lerp(y, m ? -1.3 : -0.25, a);
  scale = lerp(scale, m ? 0.68 : 1, a);

  const p = s.pour;
  const pourHead = smoothstep(0.02, 0.16, p);
  const pourTail = smoothstep(0.8, 0.96, p);
  level = lerp(level, 0.9, smoothstep(0.1, 0.86, p));
  steam = lerp(steam, 0.55, pourHead * (1 - pourTail));

  // 3. Ingredients — cup sinks out of frame, spices take the stage
  const b = ease(s.ingredientsEnter);
  y = lerp(y, -4.4, b);
  x = lerp(x, 0, b);
  steam = lerp(steam, 0, b);
  showcase = b;

  // 4. The Ritual — back to centre, camera orbits
  const c = ease(s.ritualEnter);
  x = lerp(x, 0, c);
  y = lerp(y, m ? 0.75 : -0.1, c);
  scale = lerp(scale, m ? 0.62 : 1.12, c);
  steam = lerp(steam, 1, c);
  showcase = lerp(showcase, 0, c);
  const orbit = s.ritual;
  // the first step is "boil": a burst of steam
  steam = lerp(steam, 1.4, smoothstep(0.0, 0.1, orbit) * (1 - smoothstep(0.2, 0.32, orbit)));

  // 5. Menu — cup steps to the side, liquid takes the colour of the hovered chai
  const d = ease(s.menuEnter);
  x = lerp(x, m ? 0 : 2.05, d);
  y = lerp(y, m ? 0.95 : 0.15, d);
  scale = lerp(scale, m ? 0.55 : 0.9, d);
  steam = lerp(steam, 1, d);

  // 6. Story — cup floats up and out
  const e = ease(s.storyEnter);
  y = lerp(y, 4.6, e);

  out.x = x;
  out.y = y;
  out.z = 0;
  out.scale = scale;
  out.level = level;
  out.pourHead = pourHead;
  out.pourTail = pourTail;
  out.orbit = orbit;
  out.showcase = showcase;
  out.steam = steam;
  return out;
}
