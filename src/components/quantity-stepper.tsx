"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type QuantityStepperProps = {
  label: string;
  value: number;
  minimum?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

export function QuantityStepper({
  label,
  value,
  minimum = 1,
  disabled,
  onChange,
}: QuantityStepperProps) {
  const digit = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);

  // The new count rolls in from below when it grows, from above when it drops.
  useGSAP(
    () => {
      const direction = Math.sign(value - previous.current);
      previous.current = value;
      if (
        direction === 0 ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      gsap.fromTo(
        digit.current,
        { yPercent: direction * 100 },
        { yPercent: 0, duration: 0.5, ease: "expo.out", overwrite: true },
      );
    },
    { dependencies: [value] },
  );

  const buttonClass =
    "size-6 cursor-pointer leading-none transition-colors duration-300 hover:text-foreground disabled:cursor-default disabled:text-black/20";

  return (
    <span className="flex items-center gap-2 text-xs tabular-nums">
      <button
        type="button"
        aria-label={`Remove one ${label}`}
        disabled={disabled || value === 0}
        onClick={() => onChange(value <= minimum ? 0 : value - 1)}
        className={`${buttonClass} text-muted`}
      >
        -
      </button>

      <output
        className={`block w-4 overflow-clip text-center transition-colors duration-300 ${
          value === 0 ? "text-muted" : ""
        }`}
      >
        <span ref={digit} className="block">
          {value}
        </span>
      </output>

      <button
        type="button"
        aria-label={`Add one ${label}`}
        disabled={disabled}
        onClick={() => onChange(value === 0 ? minimum : value + 1)}
        className={`${buttonClass} text-muted`}
      >
        +
      </button>
    </span>
  );
}
