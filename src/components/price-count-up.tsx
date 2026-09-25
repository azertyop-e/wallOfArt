"use client";

import { useRef } from "react";
import { usePageTransition } from "@/components/providers/page-transition";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatAmount, formatPrice } from "@/lib/tickets";

type PriceCountUpProps = {
  price: number;
  delay?: number;
  className?: string;
};

export function PriceCountUp({
  price,
  delay = 0,
  className,
}: PriceCountUpProps) {
  const display = useRef<HTMLSpanElement>(null);
  const { onReveal } = usePageTransition();

  useGSAP(
    (_context, contextSafe) => {
      const element = display.current;
      if (
        !element ||
        price === 0 ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const counter = { value: 0 };
      const write = () => {
        element.textContent = formatAmount(Math.round(counter.value));
      };
      write();

      const play = () =>
        gsap.to(counter, {
          value: price,
          duration: 1.4,
          delay,
          ease: "power3.out",
          onUpdate: write,
          scrollTrigger: { trigger: element, start: "top 88%" },
        });

      return onReveal(contextSafe?.(play) ?? play);
    },
    { dependencies: [price] },
  );

  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      <span aria-hidden ref={display}>
        {formatPrice(price)}
      </span>
      <span className="sr-only">{formatPrice(price)}</span>
    </span>
  );
}
