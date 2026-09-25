"use client";

import { useRef } from "react";
import { usePageTransition } from "@/components/providers/page-transition";
import { revealArtworks, STAGGER } from "@/lib/artwork-reveal";
import { gsap, useGSAP } from "@/lib/gsap";

type NotFoundIntroProps = {
  children: React.ReactNode;
  className?: string;
};

export function NotFoundIntro({ children, className }: NotFoundIntroProps) {
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
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from("[data-title-char]", {
          yPercent: 110,
          duration: 1.6,
          stagger: 0.04,
        })
        .from(
          "[data-not-found-fade]",
          { autoAlpha: 0, y: 12, duration: 1.2, stagger: 0.1 },
          0.3,
        );

      revealArtworks(select("[data-artwork-frame]"), {
        timeline,
        position: 0.5,
        stagger: STAGGER.fromLeft,
      });

      timeline.from(
        "[data-artwork-caption]",
        { autoAlpha: 0, y: 12, duration: 1.2, stagger: 0.08 },
        0.9,
      );

      return onReveal(() => timeline.play());
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`invisible ${className ?? ""}`}>
      {children}
    </div>
  );
}
