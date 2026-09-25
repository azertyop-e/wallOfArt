"use client";

import { useId, useRef, useState } from "react";
import { AnimatedAmount } from "@/components/animated-amount";
import { usePageTransition } from "@/components/providers/page-transition";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatAmount, summariseOrder } from "@/lib/tickets";
import { useOrderStore } from "@/stores/order-store";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function OrderBar() {
  const quantities = useOrderStore((state) => state.quantities);
  const options = useOrderStore((state) => state.options);
  const booked = useOrderStore((state) => state.booked);
  const book = useOrderStore((state) => state.book);
  const reset = useOrderStore((state) => state.reset);

  const [open, setOpen] = useState(false);
  const detailId = useId();
  const bar = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLDivElement>(null);
  const { onReveal } = usePageTransition();

  const { lines, visitors, total } = summariseOrder({ quantities, options });
  const empty = visitors === 0;
  const expanded = open && !empty;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const rise = gsap.from(bar.current, {
        yPercent: 100,
        duration: 1.2,
        delay: 0.6,
        ease: "expo.out",
        paused: true,
      });

      return onReveal(() => rise.play());
    },
    { scope: bar },
  );

  useGSAP(
    () => {
      if (!expanded || prefersReducedMotion()) return;

      gsap.from("[data-order-line]", {
        autoAlpha: 0,
        y: 12,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out",
      });
    },
    { scope: bar, dependencies: [expanded] },
  );

  const wasBooked = useRef(booked);
  useGSAP(
    () => {
      if (wasBooked.current === booked) return;
      wasBooked.current = booked;
      if (prefersReducedMotion() || !status.current) return;

      gsap.from(status.current.children, {
        autoAlpha: 0,
        y: 12,
        duration: 0.8,
        stagger: 0.08,
        ease: "expo.out",
      });
    },
    { scope: bar, dependencies: [booked] },
  );

  const actionClass =
    "cursor-pointer text-nowrap transition-colors duration-300 disabled:cursor-default disabled:text-background/40";

  return (
    <div
      ref={bar}
      className="fixed bottom-0 left-0 z-30 w-screen bg-foreground text-background"
    >
      <h2 className="sr-only">Your visit</h2>

      <div
        id={detailId}
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-3 px-gutter pt-gutter text-[10px] leading-3 font-medium uppercase">
            {lines.map((line) => (
              <li
                key={line.id}
                data-order-line
                className="grid grid-cols-[1fr_auto] items-baseline gap-gutter border-t border-background/20 pt-3 md:grid-cols-6"
              >
                <span className="md:col-span-2">{line.label}</span>
                <span className="col-start-1 text-background/50 tabular-nums md:col-span-3 md:col-start-3 md:row-start-1">
                  {line.detail}
                </span>
                <span className="col-start-2 row-start-1 justify-self-end tabular-nums md:col-start-6">
                  {formatAmount(line.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        ref={status}
        aria-live="polite"
        className="flex flex-wrap items-center justify-between gap-x-gutter gap-y-3 p-gutter text-[10px] leading-3 font-medium uppercase"
      >
        {booked ? (
          <>
            <p>Order saved — tickets are paid at the front desk.</p>
            <p className="flex items-center gap-gutter">
              <AnimatedAmount value={total} />
              <button
                type="button"
                onClick={reset}
                className={`${actionClass} text-background/60 hover:text-background`}
              >
                Start a new order
              </button>
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={empty}
              aria-expanded={expanded}
              aria-controls={detailId}
              onClick={() => setOpen(!open)}
              className={`${actionClass} flex items-center gap-2 hover:text-background/60`}
            >
              {empty ? (
                "No ticket selected"
              ) : (
                <>
                  <span className="tabular-nums">
                    {visitors === 1 ? "1 visitor" : `${visitors} visitors`}
                  </span>
                  <span className="text-background/50 tabular-nums">
                    {lines.length === 1 ? "1 line" : `${lines.length} lines`}
                  </span>
                  <span aria-hidden>{open ? "↓" : "↑"}</span>
                </>
              )}
            </button>

            <p className="flex items-center gap-gutter">
              <span className="flex items-center gap-2">
                <span className="text-background/50">Total</span>
                <AnimatedAmount value={total} />
              </span>

              <button
                type="button"
                disabled={empty}
                onClick={book}
                className={`${actionClass} hover:text-background/60`}
              >
                Book →
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
