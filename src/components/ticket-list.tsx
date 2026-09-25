"use client";

import { PriceCountUp } from "@/components/price-count-up";
import { QuantityStepper } from "@/components/quantity-stepper";
import { TICKETS } from "@/lib/tickets";
import { useOrderStore } from "@/stores/order-store";

const PRICE_DELAY = 0.7;
const ROW_STAGGER = 0.06;

export function TicketList({ className }: { className?: string }) {
  const quantities = useOrderStore((state) => state.quantities);
  const setQuantity = useOrderStore((state) => state.setQuantity);

  return (
    <section aria-labelledby="rates" className={className}>
      <div
        data-reveal-item
        className="grid grid-cols-[1fr_auto] gap-gutter border-b border-black/10 pb-4 text-[10px] leading-3 font-medium text-muted uppercase md:grid-cols-6"
      >
        <h2 id="rates" className="md:col-span-2">
          Admission
        </h2>
        <span className="hidden md:col-span-2 md:block">Who</span>
        <span className="hidden md:col-start-5 md:block">Price</span>
        <span className="justify-self-end md:col-start-6">Tickets</span>
      </div>

      <ul>
        {TICKETS.map((ticket, index) => (
          <li
            key={ticket.id}
            data-reveal-item
            className="grid grid-cols-[1fr_auto] items-center gap-x-gutter gap-y-2 border-b border-black/10 py-5 text-xs leading-3 font-medium uppercase md:grid-cols-6"
          >
            <span className="col-start-1 row-start-1 md:col-span-2">
              {ticket.label}
            </span>

            <span className="col-start-1 row-start-2 text-[10px] leading-3 text-muted md:col-span-2 md:col-start-3 md:row-start-1">
              {ticket.detail}
            </span>

            <span className="col-start-2 row-start-1 justify-self-end tabular-nums md:col-start-5 md:justify-self-start">
              <PriceCountUp
                price={ticket.price}
                delay={PRICE_DELAY + index * ROW_STAGGER}
              />
            </span>

            <span className="col-start-2 row-start-2 justify-self-end md:col-start-6 md:row-start-1">
              <QuantityStepper
                label={`${ticket.label} ticket`}
                value={quantities[ticket.id]}
                minimum={ticket.minimum}
                onChange={(value) => setQuantity(ticket.id, value)}
              />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
