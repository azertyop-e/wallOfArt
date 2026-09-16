import { type Artwork, getArtworks } from "@/lib/api";

const RESULT_LIMIT = 6;

const searchableFields = (artwork: Artwork): [string | undefined, number][] => [
  [artwork.title, 2],
  [artwork.artist, 1],
];

function scoreTerm(artwork: Artwork, term: string) {
  let score = 0;

  for (const [value, weight] of searchableFields(artwork)) {
    const field = value?.toLowerCase();
    if (!field?.includes(term)) continue;
    score += field.startsWith(term) ? weight * 2 : weight;
  }

  return score;
}

function scoreArtwork(artwork: Artwork, terms: string[]) {
  let total = 0;

  for (const term of terms) {
    const score = scoreTerm(artwork, term);
    if (score === 0) return 0;
    total += score;
  }

  return total;
}

export async function searchArtworks(query: string, limit = RESULT_LIMIT) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const artworks = await getArtworks();

  return artworks
    .map((artwork) => ({ artwork, score: scoreArtwork(artwork, terms) }))
    .filter((match) => match.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.artwork.title.localeCompare(b.artwork.title),
    )
    .slice(0, limit)
    .map((match) => match.artwork);
}

export type SearchResponse = {
  query: string;
  results: Artwork[];
};
