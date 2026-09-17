"use client";

import { useRef } from "react";
import { usePageTransition } from "@/components/providers/page-transition";
import { revealArtworks } from "@/lib/artwork-reveal";
import { gsap, useGSAP } from "@/lib/gsap";

const IMAGE_ZOOM = 1.25;
const FRAME_SHIFT = 2;
const IMAGE_SHIFT = 15;
const FRAME_TILT = 8;
const DEPTHS = [0.35, 0.65, 0.5, 0.8, 0.6, 0.35];

type HeroIntroProps = {
  children: React.ReactNode;
  className?: string;
};

export function HeroIntro({ children, className }: HeroIntroProps) {
  const root = useRef<HTMLDivElement>(null);
  const { onReveal } = usePageTransition();

  useGSAP(
    () => {
      gsap.set(root.current, { autoAlpha: 1 });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const select = gsap.utils.selector(root);

      const timeline = gsap
        // Paused in its initial state until the page is visible.
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from("[data-title-char]", {
          yPercent: 110,
          duration: 1.6,
          stagger: 0.04,
        });

      revealArtworks(select("[data-artwork-frame]"), {
        timeline,
        position: 0.3,
        // The frame crops the image on purpose: the drift pans inside of it.
        zoom: IMAGE_ZOOM,
      });

      timeline.from(
        "[data-hero-fade]",
        { autoAlpha: 0, y: 12, duration: 1.2, stagger: 0.1 },
        0.9,
      );

      const stopWaiting = onReveal(() => timeline.play());

      const frames = select<HTMLElement>("[data-hero-drift]");
      if (!frames.length || !window.matchMedia("(pointer: fine)").matches) {
        return stopWaiting;
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

      const move = (offsetX: number, offsetY: number) => {
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

      const onMouseLeave = () => move(0, 0);

      window.addEventListener("pointermove", onPointerMove);
      document.documentElement.addEventListener("mouseleave", onMouseLeave);

      return () => {
        stopWaiting();
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
