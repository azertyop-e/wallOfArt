"use client";

import { useRef } from "react";
import { usePageTransition } from "@/components/providers/page-transition";
import { gsap, useGSAP } from "@/lib/gsap";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
};

export function Reveal({ children, className }: RevealProps) {
  const container = useRef<HTMLDivElement>(null);
  const { onReveal } = usePageTransition();

  useGSAP(
    (_context, contextSafe) => {
      const hidden = { autoAlpha: 0, y: 80 };
      gsap.set(container.current, hidden);

      // Created once the page is visible, so an element already in view
      // doesn't play its reveal behind the transition curtain.
      const play = () => {
        gsap.fromTo(container.current, hidden, {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 85%",
          },
        });
      };

      return onReveal(contextSafe?.(play) ?? play);
    },
    { scope: container },
  );

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
}
