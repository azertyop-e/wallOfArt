"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const IMAGE_ZOOM = 1.25;
const FRAME_SHIFT = 2;
const IMAGE_SHIFT = 15;
// Maximum tilt of the frames towards the mouse, in degrees at full depth.
const FRAME_TILT = 8;
// Depth of each painting, left to right. Edge paintings stay shallow so they
// don't leave the screen, and neighbours never differ by more than 0.3, so
// they move at most 0.3 × 2 = 0.6 gutter towards each other.
const DEPTHS = [0.35, 0.65, 0.5, 0.8, 0.6, 0.35];

type HeroIntroProps = {
  children: React.ReactNode;
  className?: string;
};

// Entrance animation of the home hero. Children are server-rendered and tagged
// with data attributes: `data-hero-char` (title letters), `data-hero-wall` (the
// paintings grid), `data-hero-work` (painting frames, clipping their image),
// `data-hero-drift` (layers moved by the mouse parallax) and `data-hero-fade`
// (labels). Paintings are rendered by `HomeArtwork`.
export function HeroIntro({ children, className }: HeroIntroProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // The hero is hidden in CSS until now, so nothing flashes before hydration.
      gsap.set(root.current, { autoAlpha: 1 });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const works = gsap.utils.toArray<HTMLElement>("[data-hero-work]");
      const images = works.map((work) => work.querySelector("img"));
      const stagger = { each: 0.08, from: "center" } as const;

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from("[data-hero-char]", {
          yPercent: 110,
          duration: 1.6,
          stagger: 0.04,
        })
        .fromTo(
          works,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.6,
            stagger,
            clearProps: "clipPath",
          },
          0.3,
        )
        .fromTo(
          images,
          { scale: 1.4 },
          { scale: IMAGE_ZOOM, duration: 2, stagger },
          0.3,
        )
        .from(
          "[data-hero-fade]",
          { autoAlpha: 0, y: 12, duration: 1.2, stagger: 0.1 },
          0.9,
        );

      // Mouse parallax, only with a real pointer: each frame moves against the
      // mouse at its own depth and tilts towards it, while its image slides the
      // other way inside the frame, like a view through a window.
      const frames = gsap.utils.toArray<HTMLElement>("[data-hero-drift]");
      if (!frames.length || !window.matchMedia("(pointer: fine)").matches) {
        return;
      }

      const follow = (target: gsap.TweenTarget, property: string) =>
        gsap.quickTo(target, property, { duration: 1.2, ease: "power3.out" });

      gsap.set(frames, { transformPerspective: 1200 });

      const layers = frames.map((frame, index) => {
        const image = frame.querySelector("img");
        return {
          depth: DEPTHS[index % DEPTHS.length],
          frameX: follow(frame, "x"),
          frameY: follow(frame, "y"),
          frameRotateX: follow(frame, "rotationX"),
          frameRotateY: follow(frame, "rotationY"),
          imageX: follow(image, "xPercent"),
          imageY: follow(image, "yPercent"),
        };
      });

      // `offsetX` and `offsetY` go from -1 to 1 across the viewport.
      const move = (offsetX: number, offsetY: number) => {
        // The gutter is fluid (a share of the viewport width): read it from the
        // wall's grid gap so the travel always matches the space between paintings.
        const wall = frames[0].closest<HTMLElement>("[data-hero-wall]");
        const gutter = wall
          ? Number.parseFloat(getComputedStyle(wall).columnGap)
          : 0;

        for (const { depth, ...layer } of layers) {
          layer.frameX(-offsetX * FRAME_SHIFT * gutter * depth);
          layer.frameY(-offsetY * FRAME_SHIFT * gutter * depth);
          layer.frameRotateX(-offsetY * FRAME_TILT * depth);
          layer.frameRotateY(offsetX * FRAME_TILT * depth);
          layer.imageX(offsetX * IMAGE_SHIFT * depth);
          layer.imageY(offsetY * IMAGE_SHIFT * depth);
        }
      };

      const onPointerMove = (event: PointerEvent) => {
        move(
          (event.clientX / window.innerWidth) * 2 - 1,
          (event.clientY / window.innerHeight) * 2 - 1,
        );
      };

      // Back to rest when the mouse leaves the window.
      const onMouseLeave = () => move(0, 0);

      window.addEventListener("pointermove", onPointerMove);
      document.documentElement.addEventListener("mouseleave", onMouseLeave);

      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener(
          "mouseleave",
          onMouseLeave,
        );
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`invisible ${className ?? ""}`}>
      {children}
    </div>
  );
}
