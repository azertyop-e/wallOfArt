"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type ParallaxProps = {
  children: React.ReactNode;
  className?: string;
  speed?: number;
};

export function Parallax({ children, className, speed = 0.3 }: ParallaxProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.to(container.current, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: 0,
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: container, dependencies: [speed] },
  );

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
}
