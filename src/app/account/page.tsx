import type { Metadata } from "next";
import Link from "next/link";
import { ArtworkCard } from "@/components/artwork-card";
import { WallTitle } from "@/components/wall-title";
import { signOut } from "@/lib/auth-actions";
import { getFavoriteArtworks } from "@/lib/favorites";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Account — Museum",
  robots: { index: false },
};

const memberSince = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
});

export default async function AccountPage() {
  const user = await requireUser();
  const favorites = await getFavoriteArtworks(user.id);

  return (
    <main className="min-h-svh px-gutter pt-page-top pb-page-bottom">
      <p className="mb-gutter text-[10px] leading-3 font-medium text-muted uppercase">
        Your account
      </p>

      <h1 className="mb-[8vh]">
        <WallTitle title={user.name} />
      </h1>

      <dl className="grid grid-cols-[auto_1fr] gap-x-gutter gap-y-3 text-xs leading-4 font-medium uppercase md:span-w-3">
        <dt className="text-muted">Email</dt>
        <dd className="normal-case">{user.email}</dd>
        <dt className="text-muted">Member since</dt>
        <dd>{memberSince.format(user.createdAt)}</dd>
      </dl>

      <section className="mt-[12vh]">
        <h2 className="text-xs leading-3 font-medium uppercase">
          Favorites <span className="text-muted">({favorites.length})</span>
        </h2>

        {favorites.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-x-gutter gap-y-12 md:grid-cols-3 lg:grid-cols-6">
            {favorites.map((artwork) => (
              <li key={artwork.id}>
                <ArtworkCard
                  artwork={artwork}
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-[10px] leading-3 font-medium text-muted uppercase">
            No favorites yet.{" "}
            <Link
              href="/paintings"
              className="underline underline-offset-2 transition-colors duration-300 hover:text-foreground"
            >
              Browse the paintings
            </Link>{" "}
            and save the ones you love.
          </p>
        )}
      </section>

      <form action={signOut} className="mt-[8vh]">
        <button
          type="submit"
          className="text-[10px] leading-3 font-medium text-muted uppercase underline underline-offset-2 transition-colors duration-300 hover:text-foreground"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
