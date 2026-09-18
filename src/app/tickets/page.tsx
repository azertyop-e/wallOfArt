import type { Metadata } from "next";
import { OptionList } from "@/components/option-list";
import { OrderBar } from "@/components/order-bar";
import { Reveal } from "@/components/reveal";
import { TicketList } from "@/components/ticket-list";
import { WallTitle } from "@/components/wall-title";

// Nothing is fetched here and the order lives in the browser: the page is
// prerendered once at build time (SSG) and served as static HTML.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tickets — Museum",
  description:
    "Book your visit to the Wall of Art: admission rates, group rate, audio guide and printed guide, with a running total.",
};

export default function TicketsPage() {
  return (
    // The bottom padding clears the order bar pinned over the page.
    <main className="min-h-svh px-gutter pt-page-top pb-[calc(var(--spacing-page-bottom)+10vh)]">
      <Reveal className="mb-[12vh]">
        <p className="mb-gutter text-[10px] leading-3 font-medium text-muted uppercase">
          Plan your visit
        </p>

        <h1>
          <WallTitle title="Tickets" />
        </h1>

        <p className="mt-gutter max-w-[46ch] text-xs leading-4 font-medium uppercase">
          Pick a rate for everyone coming, add the options you want, and the
          total at the bottom follows along. Under 5s come in free.
        </p>
      </Reveal>

      <div className="flex flex-col gap-[12vh]">
        <Reveal>
          <TicketList />
        </Reveal>

        <Reveal>
          <OptionList />
        </Reveal>
      </div>

      <OrderBar />
    </main>
  );
}
