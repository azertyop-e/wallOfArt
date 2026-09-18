import type { Artwork } from "@/lib/api";

export type WallArtwork = Artwork & { image: string; year: number };

export const WALL_SIZE = 6;

/**
 * How far the wall's images are zoomed inside their frame: the frame crops them
 * on purpose, so the hover drift can pan inside of it. The preloader's cards
 * end their line on the same zoom, which makes them match the wall exactly.
 */
export const WALL_IMAGE_ZOOM = 1.25;

/**
 * The paintings on the home page wall: the collection spread evenly over time.
 * The preloader lands its line on them, so both read from here.
 */
export function pickWall(artworks: Artwork[]) {
  const dated = artworks
    .filter((artwork): artwork is WallArtwork =>
      Boolean(artwork.image && artwork.year),
    )
    .sort((a, b) => a.year - b.year);

  if (dated.length <= WALL_SIZE) return dated;

  return Array.from(
    { length: WALL_SIZE },
    (_, index) =>
      dated[Math.round((index * (dated.length - 1)) / (WALL_SIZE - 1))],
  );
}
