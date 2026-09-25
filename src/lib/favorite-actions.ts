"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorite } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function setFavorite(artworkSlug: string, favorited: boolean) {
  const session = await getSession();
  if (!session) throw new Error("You must be logged in.");

  const userId = session.user.id;

  if (favorited) {
    await db
      .insert(favorite)
      .values({ userId, artworkSlug })
      .onConflictDoNothing();
  } else {
    await db
      .delete(favorite)
      .where(
        and(eq(favorite.userId, userId), eq(favorite.artworkSlug, artworkSlug)),
      );
  }

  return favorited;
}
