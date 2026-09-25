import type { Artwork } from "@/lib/api";

export type WallArtwork = Artwork & { image: string; year: number };

export const WALL_SIZE = 6;

export const WALL_IMAGE_ZOOM = 1.25;

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
