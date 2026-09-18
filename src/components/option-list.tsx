"use client";

import { countVisitors, formatPrice, OPTIONS } from "@/lib/tickets";
import { useOrderStore } from "@/stores/order-store";

/** Add-ons taken for the whole party, so they stay locked until a rate is picked. */
export function OptionList({ className }: { className?: string }) {
  const quantities = useOrderStore((state) => state.quantities);
  const options = useOrderStore((state) => state.options);
  const toggleOption = useOrderStore((state) => state.toggleOption);

  const visitors = countVisitors({ quantities, options });

  return (
    <section aria-labelledby="options" className={className}>
      <div className="grid grid-cols-[1fr_auto] gap-gutter border-b border-black/10 pb-4 text-[10px] leading-3 font-medium text-muted uppercase md:grid-cols-6">
        <h2 id="options" className="md:col-span-2">
          Options
        </h2>
        <span className="hidden md:col-span-2 md:block">
          {visitors === 0 ? "Pick a rate first" : "For every visitor"}
        </span>
        <span className="hidden md:col-start-5 md:block">Price</span>
        <span className="justify-self-end md:col-start-6">Add</span>
      </div>

      <ul>
        {OPTIONS.map((option) => (
          <li key={option.id} className="border-b border-black/10">
            <label className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-x-gutter gap-y-2 py-5 text-xs leading-3 font-medium uppercase has-disabled:cursor-default has-disabled:opacity-40 md:grid-cols-6">
              <span className="col-start-1 row-start-1 md:col-span-2">
                {option.label}
              </span>

              <span className="col-start-1 row-start-2 text-[10px] leading-3 text-muted md:col-span-2 md:col-start-3 md:row-start-1">
                {option.detail}
              </span>

              <span className="col-start-2 row-start-1 justify-self-end tabular-nums md:col-start-5 md:justify-self-start">
                {formatPrice(option.price)}
              </span>

              <input
                type="checkbox"
                name={option.id}
                checked={options[option.id]}
                disabled={visitors === 0}
                onChange={() => toggleOption(option.id)}
                className="col-start-2 row-start-2 size-3 cursor-pointer appearance-none justify-self-end border border-foreground outline-offset-4 checked:bg-foreground disabled:cursor-default md:col-start-6 md:row-start-1"
              />
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
