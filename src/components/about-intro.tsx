"use client";

import { useRef } from "react";
import { usePageTransition } from "@/components/providers/page-transition";
import { gsap, useGSAP } from "@/lib/gsap";

type AboutIntroProps = {
  children: React.ReactNode;
  className?: string;
};

/** Entrance of the about page: the title letters, then the text around it. */
export function AboutIntro({ children, className }: AboutIntroProps) {
  const root = useRef<HTMLDivElement>(null);
  const { onReveal } = usePageTransition();

  useGSAP(
    () => {
      gsap.set(root.current, { autoAlpha: 1 });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const timeline = gsap
        // Paused in its initial state until the page is visible.
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from("[data-title-char]", {
          yPercent: 110,
          duration: 1.6,
          stagger: 0.05,
        })
        .from(
          "[data-about-fade]",
          { autoAlpha: 0, y: 12, duration: 1.2, stagger: 0.08 },
          0.4,
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
