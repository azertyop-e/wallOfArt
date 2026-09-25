"use client";

import { useRef } from "react";
import { usePageTransition } from "@/components/providers/page-transition";
import {
  MASK_HIDDEN,
  REVEAL_EASE,
  revealArtworks,
  STAGGER,
} from "@/lib/artwork-reveal";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type RevealVariant = "block" | "lines" | "items" | "artworks";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
};

const START = "top 88%";

export function Reveal({
  children,
  className,
  variant = "block",
  delay = 0,
}: RevealProps) {
  const container = useRef<HTMLDivElement>(null);
  const { onReveal } = usePageTransition();

  useGSAP(
    (_context, contextSafe) => {
      const root = container.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const select = gsap.utils.selector(root);
      const trigger = (element: Element = root) => ({
        trigger: element,
        start: START,
      });

      const setups: Record<RevealVariant, () => () => void> = {
        block: () => {
          const hidden = { autoAlpha: 0, y: 60 };
          gsap.set(root, hidden);
          return () =>
            gsap.fromTo(root, hidden, {
              autoAlpha: 1,
              y: 0,
              duration: 1.2,
              delay,
              ease: "power3.out",
              scrollTrigger: trigger(),
            });
        },

        lines: () => {
          gsap.set(root, { autoAlpha: 0 });
          return () => {
            gsap.set(root, { autoAlpha: 1 });
            const blocks = select("p, h1, h2");

            for (const block of blocks.length ? blocks : [root]) {
              SplitText.create(block, {
                type: "lines",
                mask: "lines",
                autoSplit: true,
                onSplit: (split) =>
                  gsap.from(split.lines, {
                    yPercent: 110,
                    duration: 1.2,
                    delay,
                    stagger: 0.08,
                    ease: REVEAL_EASE,
                    scrollTrigger: trigger(block),
                  }),
              });
            }
          };
        },

        items: () => {
          const items = select("[data-reveal-item]");
          const hidden = { autoAlpha: 0, y: 24 };
          gsap.set(items, hidden);
          return () =>
            gsap.fromTo(items, hidden, {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              delay,
              stagger: 0.06,
              ease: "power3.out",
              scrollTrigger: trigger(),
            });
        },

        artworks: () => {
          const frames = select<HTMLElement>("[data-artwork-frame]");
          const captions = select("[data-artwork-caption]");
          gsap.set(frames, { clipPath: MASK_HIDDEN });
          gsap.set(captions, { autoAlpha: 0 });
          return () => {
            const timeline = gsap.timeline({ delay, scrollTrigger: trigger() });
            revealArtworks(frames, { timeline, stagger: STAGGER.fromLeft });
            timeline.to(
              captions,
              { autoAlpha: 1, duration: 0.8, stagger: STAGGER.fromLeft },
              0.4,
            );
          };
        },
      };

      const play = setups[variant]();
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
