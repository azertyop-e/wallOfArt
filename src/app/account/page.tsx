import type { Metadata } from "next";
import Link from "next/link";
import { AccountIntro } from "@/components/account-intro";
import { FavoriteList } from "@/components/favorite-list";
import { Reveal } from "@/components/reveal";
import { WallTitle } from "@/components/wall-title";
import { signOut } from "@/lib/auth-actions";
import { getFavoriteArtworks } from "@/lib/favorites";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Account",
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
      <AccountIntro>
        <h1 className="relative z-10 mb-[8vh] text-white mix-blend-difference">
          <WallTitle title="Account" align="start" />
        </h1>

        <section aria-labelledby="account-details">
          <h2
            id="account-details"
            data-account-fade
            className="mb-6 text-xs leading-3 font-medium uppercase"
          >
            Details
          </h2>

          <dl className="grid grid-cols-[auto_1fr] gap-x-gutter gap-y-3 text-xs leading-4 font-medium uppercase md:span-w-3">
            <dt data-account-fade className="text-muted">
              Name
            </dt>
            <dd data-account-fade>{user.name}</dd>
            <dt data-account-fade className="text-muted">
              Email
            </dt>
            <dd data-account-fade className="normal-case">
              {user.email}
            </dd>
            <dt data-account-fade className="text-muted">
              Member since
            </dt>
            <dd data-account-fade>{memberSince.format(user.createdAt)}</dd>
          </dl>

          <form data-account-fade action={signOut} className="mt-6">
            <button
              type="submit"
              className="text-[10px] leading-3 font-medium text-muted uppercase underline underline-offset-2 transition-colors duration-300 hover:text-foreground"
            >
              Log out
            </button>
          </form>
        </section>
      </AccountIntro>

      <section aria-labelledby="account-favorites" className="mt-[12vh]">
        <Reveal variant="lines">
          <h2
            id="account-favorites"
            className="text-xs leading-3 font-medium uppercase"
          >
            Favorites <span className="text-muted">({favorites.length})</span>
          </h2>
        </Reveal>

        {favorites.length > 0 ? (
          <Reveal variant="items">
            <FavoriteList artworks={favorites} />
          </Reveal>
        ) : (
          <Reveal className="mt-6">
            <p className="text-[10px] leading-3 font-medium text-muted uppercase">
              No favorites yet.{" "}
              <Link
                href="/paintings"
                className="underline underline-offset-2 transition-colors duration-300 hover:text-foreground"
              >
                Browse the paintings
              </Link>{" "}
              and save the ones you love.
            </p>
          </Reveal>
        )}
      </section>
    </main>
  );
}
