import { cache } from "react";
import { getWikimediaThumbnail } from "@/lib/wikimedia";

const API_URL = "https://api-museum.vercel.app";

// The API sends `cache-control: max-age=0`, so caching is decided here (ISR).
const REVALIDATE = 3600;
const RELATED_COUNT = 6;

export type ArtworkType =
  | "painting"
  | "fresco"
  | "mural"
  | "triptych"
  | "woodblock print";

export type Artwork = {
  id: number;
  slug: string;
  title: string;
  year?: number;
  type?: ArtworkType;
  /** HTML string (`<p>`, `<strong>`, `<i>`, `<em>`). */
  description?: string;
  image?: string;
  gallery?: string[];
  artist?: string;
  location?: string;
  locationLink?: string;
  movement?: string;
  color?: string;
};

type ArtworksResponse = {
  objects: Artwork[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const typeLabels: Record<ArtworkType, string> = {
  painting: "Painting",
  fresco: "Fresco",
  mural: "Mural",
  triptych: "Triptych",
  "woodblock print": "Woodblock print",
};

export function getTypeLabel(type?: string) {
  if (!type) return undefined;
  return typeLabels[type as ArtworkType] ?? type;
}

function normalizeImageUrl(url: string) {
  return getWikimediaThumbnail(url, 1920);
}

function normalizeArtwork<T extends Artwork>(artwork: T): T {
  return {
    ...artwork,
    image: artwork.image && normalizeImageUrl(artwork.image),
    gallery: artwork.gallery?.map(normalizeImageUrl),
  };
}

export const getArtworks = cache(async (): Promise<Artwork[]> => {
  const res = await fetch(`${API_URL}/objects`, {
    next: { revalidate: REVALIDATE, tags: ["artworks"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to load the paintings (${res.status})`);
  }

  const data: ArtworksResponse = await res.json();
  return data.objects.map(normalizeArtwork);
});

export async function getArtwork(slug: string) {
  const artworks = await getArtworks();
  return artworks.find((artwork) => artwork.slug === slug);
}

export async function getRelatedArtworks(artwork: Artwork) {
  const artworks = await getArtworks();

  const score = (other: Artwork) =>
    (artwork.movement && other.movement === artwork.movement ? 4 : 0) +
    (artwork.artist && other.artist === artwork.artist ? 2 : 0) +
    (artwork.type && other.type === artwork.type ? 1 : 0);

  const yearGap = (other: Artwork) =>
    artwork.year && other.year
      ? Math.abs(other.year - artwork.year)
      : Number.POSITIVE_INFINITY;

  return artworks
    .filter((other) => other.slug !== artwork.slug)
    .sort((a, b) => score(b) - score(a) || yearGap(a) - yearGap(b))
    .slice(0, RELATED_COUNT);
}
