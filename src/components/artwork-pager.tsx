"use client";

import type Lenis from "lenis";
import { useLenis } from "lenis/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePageTransition } from "@/components/providers/page-transition";
import { gsap, useGSAP } from "@/lib/gsap";

const EDGE = 25;
const PULL_DISTANCE = 1750;
const MAX_SHADE = 1 / 3;
const ENABLE_DELAY = 1;

const BACK_HREF = "/paintings";

type Direction = "back" | "next";

type ArtworkPagerProps = {
  next: { slug: string; title: string };
};

export function ArtworkPager({ next }: ArtworkPagerProps) {
  const lenis = useLenis();
  const { navigate, onReveal } = usePageTransition();
  const [mounted, setMounted] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const backLabel = useRef<HTMLAnchorElement>(null);
  const nextLabel = useRef<HTMLAnchorElement>(null);
  const nextBar = useRef<HTMLSpanElement>(null);

  useEffect(() => setMounted(true), []);

  useGSAP(
    () => {
      if (!mounted || !lenis) return;

      const labels = {
        back: backLabel.current,
        next: nextLabel.current,
      };
      const targets = { back: BACK_HREF, next: `/paintings/${next.slug}` };
      const offsets = { back: -50, next: 50 };

      const visible = { back: false, next: false };
      const pulled = { back: 0, next: 0 };
      const progress = { back: 0, next: 0 };
      let enabled = false;
      let leaving = false;

      gsap.set(labels.back, { autoAlpha: 0, yPercent: offsets.back });
      gsap.set(labels.next, { autoAlpha: 0, yPercent: offsets.next });

      const render = () => {
        labels.back?.style.setProperty("--fill", `${progress.back}%`);
        gsap.set(nextBar.current, { scaleX: progress.next / 100 });
        gsap.set(shade.current, {
          opacity: (Math.max(progress.back, progress.next) / 100) * MAX_SHADE,
        });
      };

      const follow = (direction: Direction) =>
        gsap.quickTo(progress, direction, {
          duration: 0.4,
          ease: "power3.out",
          onUpdate: render,
        });
      const tweens = { back: follow("back"), next: follow("next") };

      const pull = (direction: Direction, amount: number) => {
        pulled[direction] = gsap.utils.clamp(0, PULL_DISTANCE, amount);
        tweens[direction]((pulled[direction] / PULL_DISTANCE) * 100);
      };

      const toggle = (direction: Direction, show: boolean) => {
        if (visible[direction] === show) return;
        visible[direction] = show;

        gsap.to(
          labels[direction],
          show
            ? {
                autoAlpha: 1,
                yPercent: 0,
                filter: "blur(0px)",
                duration: 0.6,
                ease: "power2.out",
              }
            : {
                autoAlpha: 0,
                yPercent: -offsets[direction],
                filter: "blur(2px)",
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                  gsap.set(labels[direction], { yPercent: offsets[direction] });
                },
              },
        );
        if (!show) pull(direction, 0);
      };

      const atStart = (instance: Lenis) => instance.animatedScroll <= EDGE;
      const atEnd = (instance: Lenis) =>
        instance.animatedScroll >= instance.limit - EDGE;

      const update = () => {
        if (!enabled || leaving) return;
        toggle("back", atStart(lenis));
        toggle("next", atEnd(lenis));
      };

      const onWheel = (event: WheelEvent) => {
        if (!enabled || leaving) return;

        const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
        const direction: Direction | null =
          pulled.next > 0 || (delta > 0 && atEnd(lenis))
            ? "next"
            : pulled.back > 0 || (delta < 0 && atStart(lenis))
              ? "back"
              : null;

        if (!direction) return;

        event.preventDefault();
        event.stopPropagation();

        toggle(direction, true);
        pull(
          direction,
          pulled[direction] + (direction === "next" ? delta : -delta),
        );

        if (pulled[direction] >= PULL_DISTANCE) {
          leaving = true;
          navigate(targets[direction]);
        }
      };

      const enable = gsap
        .delayedCall(ENABLE_DELAY, () => {
          enabled = true;
          update();
        })
        .pause();
      const stopWaiting = onReveal(() => enable.play());

      const stopListening = lenis.on("scroll", update);
      window.addEventListener("wheel", onWheel, {
        capture: true,
        passive: false,
      });
      window.addEventListener("resize", update);

      return () => {
        stopWaiting();
        stopListening();
        window.removeEventListener("wheel", onWheel, { capture: true });
        window.removeEventListener("resize", update);
      };
    },
    { scope: root, dependencies: [mounted, lenis] },
  );

  if (!mounted) return null;

  return createPortal(
    <div
      ref={root}
      className="text-[10px] leading-3 font-medium text-foreground uppercase"
    >
      <div
        ref={shade}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 bg-foreground opacity-0"
      />

      <nav aria-label="Other paintings">
        <div className="pointer-events-none fixed inset-x-0 top-0 z-30 grid grid-cols-6 gap-gutter px-gutter pt-page-top">
          <Link
            ref={backLabel}
            href={BACK_HREF}
            className="invisible pointer-events-auto col-span-4 col-start-2 w-fit text-nowrap bg-[linear-gradient(to_right,var(--color-foreground)_var(--fill,0%),var(--color-muted)_var(--fill,0%))] bg-clip-text text-transparent"
          >
            <span className="hidden pointer-coarse:inline">
              ← All paintings
            </span>
          </Link>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 grid h-[18vh] grid-cols-6 items-center gap-gutter px-gutter">
          <Link
            ref={nextLabel}
            href={`/paintings/${next.slug}`}
            className="invisible pointer-events-auto col-span-6 col-start-0 flex items-center gap-gutter"
          >
            <span className="shrink-0 text-nowrap pointer-coarse:hidden text-muted">
              Scroll down to next painting
            </span>
            <span className="hidden shrink-0 text-nowrap pointer-coarse:inline text-muted">
              Next painting →
            </span>
            <span className="sr-only">: </span>
            <span className="min-w-0 truncate bold">{next.title}</span>
            <span
              aria-hidden
              className="h-0.5 flex-1 bg-foreground/20 pointer-coarse:hidden"
            >
              <span
                ref={nextBar}
                className="block h-full origin-left scale-x-0 bg-foreground"
              />
            </span>
          </Link>
        </div>
      </nav>
    </div>,
    document.body,
  );
}
