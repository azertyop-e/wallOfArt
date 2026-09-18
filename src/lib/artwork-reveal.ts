import { gsap } from "@/lib/gsap";

/** How far the image is zoomed past its resting scale before it settles. */
const OVERSCAN = 1.12;

export const FRAME_DURATION = 1.6;
const IMAGE_DURATION = 2;
const HIDE_DURATION = 0.35;

export const REVEAL_EASE = "expo.out";
export const HIDE_EASE = "power2.in";

/** The mask the reveal runs between: hidden is collapsed onto the bottom edge. */
export const MASK_HIDDEN = "inset(100% 0% 0% 0%)";
export const MASK_SHOWN = "inset(0% 0% 0% 0%)";

/**
 * Stagger presets, in pairs: a reveal runs one way and its exit unwinds it the
 * other way. `fromCenter` suits a row centred on screen like the home page
 * wall; `fromLeft` suits a list that reads from its left edge.
 */
export const STAGGER = {
  fromCenter: { each: 0.08, from: "center" },
  toCenter: { each: 0.04, from: "edges" },
  fromLeft: { each: 0.08, from: "start" },
  toLeft: { each: 0.04, from: "end" },
} as const;

const imagesOf = (frames: HTMLElement[]) =>
  frames.flatMap((frame) => {
    const image = frame.querySelector("img");
    return image ? [image] : [];
  });

type RevealOptions = {
  timeline?: gsap.core.Timeline;
  position?: number | string;
  zoom?: number;
  stagger?: gsap.StaggerVars;
};

export function revealArtworks(
  frames: HTMLElement[],
  {
    timeline = gsap.timeline(),
    position = 0,
    zoom = 1,
    stagger = STAGGER.fromCenter,
  }: RevealOptions = {},
) {
  return timeline
    .fromTo(
      frames,
      { clipPath: MASK_HIDDEN },
      {
        clipPath: MASK_SHOWN,
        duration: FRAME_DURATION,
        ease: REVEAL_EASE,
        stagger,
        clearProps: "clipPath",
      },
      position,
    )
    .fromTo(
      imagesOf(frames),
      { scale: zoom * OVERSCAN },
      {
        scale: zoom,
        duration: IMAGE_DURATION,
        ease: REVEAL_EASE,
        stagger,
        clearProps: zoom === 1 ? "scale" : "",
      },
      position,
    );
}

type HideOptions = gsap.TimelineVars & {
  zoom?: number;
  duration?: number;
  stagger?: gsap.StaggerVars;
};

export function hideArtworks(
  frames: HTMLElement[],
  {
    zoom = 1,
    duration = HIDE_DURATION,
    stagger = STAGGER.toCenter,
    ...vars
  }: HideOptions = {},
) {
  const step = { duration, ease: HIDE_EASE, stagger };

  return gsap
    .timeline(vars)
    .to(frames, { clipPath: MASK_HIDDEN, ...step }, 0)
    .to(imagesOf(frames), { scale: zoom * OVERSCAN, ...step }, 0);
}
