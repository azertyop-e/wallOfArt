"use client";

import { useId, useState } from "react";
import { formatAmount, summariseOrder } from "@/lib/tickets";
import { useOrderStore } from "@/stores/order-store";

/**
 * The running total, pinned to the bottom of the ticket page. It recomputes
 * from the order store, so every counter and every option updates it as it is
 * clicked; the breakdown unfolds above the bar on demand.
 */
export function OrderBar() {
  const quantities = useOrderStore((state) => state.quantities);
  const options = useOrderStore((state) => state.options);
  const booked = useOrderStore((state) => state.booked);
  const book = useOrderStore((state) => state.book);
  const reset = useOrderStore((state) => state.reset);

  const [open, setOpen] = useState(false);
  const detailId = useId();

  const { lines, visitors, total } = summariseOrder({ quantities, options });
  const empty = visitors === 0;

  const actionClass =
    "cursor-pointer text-nowrap transition-colors duration-300 disabled:cursor-default disabled:text-background/40";

  return (
    // Below the transition curtain (z-40): the bar leaves with the page.
    <div className="fixed bottom-0 left-0 z-30 w-screen bg-foreground text-background">
      <h2 className="sr-only">Your visit</h2>

      {/* Collapsed to a zero-height row rather than measured in JS. */}
      <div
        id={detailId}
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          open && !empty ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-3 px-gutter pt-gutter text-[10px] leading-3 font-medium uppercase">
            {lines.map((line) => (
              <li
                key={line.id}
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
        aria-live="polite"
        className="flex flex-wrap items-center justify-between gap-x-gutter gap-y-3 p-gutter text-[10px] leading-3 font-medium uppercase"
      >
        {booked ? (
          <>
            <p>Order saved — tickets are paid at the front desk.</p>
            <p className="flex items-center gap-gutter">
              <span className="tabular-nums">{formatAmount(total)}</span>
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
              aria-expanded={open && !empty}
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
                <span className="tabular-nums">{formatAmount(total)}</span>
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
