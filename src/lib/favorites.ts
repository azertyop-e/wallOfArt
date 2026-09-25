import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorite } from "@/db/schema";
import { type Artwork, getArtworks } from "@/lib/api";

export type FavoriteState = {
  signedIn: boolean;
  favorited: boolean;
};

export async function isFavorite(userId: string, artworkSlug: string) {
  const [row] = await db
    .select({ slug: favorite.artworkSlug })
    .from(favorite)
    .where(
      and(eq(favorite.userId, userId), eq(favorite.artworkSlug, artworkSlug)),
    )
    .limit(1);
  return Boolean(row);
}

export async function getFavoriteArtworks(userId: string) {
  const [rows, artworks] = await Promise.all([
    db
      .select({ slug: favorite.artworkSlug })
      .from(favorite)
      .where(eq(favorite.userId, userId))
      .orderBy(desc(favorite.createdAt)),
    getArtworks(),
  ]);

  const bySlug = new Map(artworks.map((artwork) => [artwork.slug, artwork]));

  return rows
    .map((row) => bySlug.get(row.slug))
    .filter((artwork): artwork is Artwork => artwork !== undefined);
}
