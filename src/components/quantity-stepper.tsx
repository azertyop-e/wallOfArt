"use client";

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
        className={
          value === 0 ? "w-4 text-center text-muted" : "w-4 text-center"
        }
      >
        {value}
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
