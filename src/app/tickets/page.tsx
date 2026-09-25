import type { Metadata } from "next";
import { OptionList } from "@/components/option-list";
import { OrderBar } from "@/components/order-bar";
import { Reveal } from "@/components/reveal";
import { TicketList } from "@/components/ticket-list";
import { TicketsIntro } from "@/components/tickets-intro";
import { WallTitle } from "@/components/wall-title";

// Nothing is fetched here and the order lives in the browser: the page is
// prerendered once at build time (SSG) and served as static HTML.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tickets",
  alternates: { canonical: "/tickets" },
  description:
    "Book your visit to the Wall of Art: admission rates, group rate, audio guide and printed guide, with a running total.",
};

export default function TicketsPage() {
  return (
    // The bottom padding clears the order bar pinned over the page.
    <main className="min-h-svh px-gutter pt-page-top pb-[calc(var(--spacing-page-bottom)+10vh)]">
      <TicketsIntro className="mb-[12vh]">
        <p
          data-tickets-fade
          className="mb-gutter text-[10px] leading-3 font-medium text-muted uppercase"
        >
          Plan your visit
        </p>

        <h1>
          <WallTitle title="Tickets" />
        </h1>

        <p
          data-tickets-fade
          className="mt-gutter max-w-[46ch] text-xs leading-4 font-medium uppercase"
        >
          Pick a rate for everyone coming, add the options you want, and the
          total at the bottom follows along. Under 5s come in free.
        </p>
      </TicketsIntro>

      <div className="flex flex-col gap-[12vh]">
        {/* The rates follow the title in; the options wait for the scroll. */}
        <Reveal variant="items" delay={0.5}>
          <TicketList />
        </Reveal>

        <Reveal variant="items">
          <OptionList />
        </Reveal>
      </div>

      <OrderBar />
    </main>
  );
}
