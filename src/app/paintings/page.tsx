import type { Metadata } from "next";
import { InfiniteCanvas } from "@/components/infinite-canvas";
import { PaintingFilters } from "@/components/painting-filters";
import { SiteSearch } from "@/components/site-search";
import { getArtworks } from "@/lib/api";
import { createCanvasLayout } from "@/lib/canvas-layout";
import {
  describeFilters,
  filterArtworks,
  getFilterGroups,
  parseFilters,
} from "@/lib/filters";

export async function generateMetadata({
  searchParams,
}: PageProps<"/paintings">): Promise<Metadata> {
  const filters = parseFilters(await getArtworks(), await searchParams);
  const description = describeFilters(filters);

  return {
    title: description ? `Paintings: ${description}` : "Paintings",
    description: "Browse every artwork in the museum's collection.",
    alternates: { canonical: "/paintings" },
  };
}

export default async function PaintingsPage({
  searchParams,
}: PageProps<"/paintings">) {
  const artworks = await getArtworks();
  const filters = parseFilters(artworks, await searchParams);
  const filtered = filterArtworks(artworks, filters);
  const layout = createCanvasLayout(filtered);

  return (
    <main>
      <h1 className="sr-only">Paintings</h1>

      <InfiniteCanvas layout={layout} />

      {filtered.length === 0 && (
        <p className="pointer-events-none fixed inset-0 flex items-center justify-center text-[10px] leading-3 font-medium text-muted uppercase">
          No artworks match these filters
        </p>
      )}

      <div className="pointer-events-none fixed bottom-0 left-0 z-50 grid w-screen grid-cols-2 items-end gap-x-gutter gap-y-4 p-gutter text-[10px] leading-3 font-medium text-white uppercase mix-blend-difference md:grid-cols-[1fr_auto_1fr]">
        <SiteSearch className="pointer-events-auto col-span-2 justify-self-center md:col-span-1 md:col-start-2 md:row-start-1" />

        <PaintingFilters
          groups={getFilterGroups(artworks, filters)}
          className="pointer-events-auto md:col-start-1 md:row-start-1 md:justify-self-start"
        />

        <span className="justify-self-end text-right md:col-start-3 md:row-start-1">
          <span className="hidden md:inline">Drag to explore — </span>
          <span className="text-muted">
            {filtered.length === artworks.length
              ? `${artworks.length} artworks`
              : `${filtered.length} / ${artworks.length} artworks`}
          </span>
        </span>
      </div>
    </main>
  );
}
