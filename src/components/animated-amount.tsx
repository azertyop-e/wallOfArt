"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatAmount } from "@/lib/tickets";

export function AnimatedAmount({ value }: { value: number }) {
  const display = useRef<HTMLSpanElement>(null);
  const [initial] = useState(value);
  const shown = useRef({ value });

  useGSAP(
    () => {
      const counter = shown.current;
      const write = () => {
        if (display.current) {
          display.current.textContent = formatAmount(Math.round(counter.value));
        }
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        counter.value = value;
        write();
        return;
      }

      gsap.to(counter, {
        value,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true,
        onUpdate: write,
      });
    },
    { dependencies: [value] },
  );

  return (
    <span className="tabular-nums">
      <span aria-hidden ref={display}>
        {formatAmount(initial)}
      </span>
      <span className="sr-only">{formatAmount(value)}</span>
    </span>
  );
}
