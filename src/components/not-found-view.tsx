import Link from "next/link";
import { ArtworkCard } from "@/components/artwork-card";
import { NotFoundIntro } from "@/components/not-found-intro";
import { WallTitle } from "@/components/wall-title";
import { getArtworks } from "@/lib/api";

const SUGGESTION_COUNT = 3;

async function getSuggestions() {
  try {
    const artworks = (await getArtworks()).filter((artwork) => artwork.image);
    if (artworks.length <= SUGGESTION_COUNT) return artworks;

    return Array.from(
      { length: SUGGESTION_COUNT },
      (_, index) =>
        artworks[Math.floor((index * artworks.length) / SUGGESTION_COUNT)],
    );
  } catch {
    return [];
  }
}

type NotFoundViewProps = {
  heading: string;
  message: string;
  back: { href: string; label: string };
};

export async function NotFoundView({
  heading,
  message,
  back,
}: NotFoundViewProps) {
  const suggestions = await getSuggestions();

  return (
    <main className="overflow-clip">
      <NotFoundIntro className="flex min-h-svh flex-col gap-gutter p-gutter pt-page-top">
        <div className="grid grid-cols-2 gap-gutter text-[10px] leading-3 font-medium uppercase md:grid-cols-6">
          <div
            data-not-found-fade
            className="flex flex-col gap-4 md:col-span-2 md:col-start-0 "
          >
            <p>
              {heading}
              <br />
              <span className="text-muted">{message}</span>
            </p>
            <nav aria-label="Ways out" className="flex gap-gutter">
              <Link
                href={back.href}
                className="transition-colors duration-300 hover:text-muted"
              >
                ← {back.label}
              </Link>
              {back.href !== "/" && (
                <Link
                  href="/"
                  className="text-muted transition-colors duration-300 hover:text-foreground"
                >
                  Home
                </Link>
              )}
            </nav>
          </div>
        </div>

        {suggestions.length > 0 && (
          <section
            aria-labelledby="not-found-suggestions"
            className="flex flex-1 flex-col justify-center gap-4 py-6"
          >
            <h2
              id="not-found-suggestions"
              data-not-found-fade
              className="text-[10px] leading-3 font-medium text-muted uppercase"
            >
              On the wall instead
            </h2>
            <ul className="grid grid-cols-3 gap-gutter md:grid-cols-6">
              {suggestions.map((artwork) => (
                <li key={artwork.id}>
                  <ArtworkCard
                    artwork={artwork}
                    sizes="(min-width: 768px) 16vw, 30vw"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <h1 className="mt-auto">
          <WallTitle title="Error 404" />
        </h1>
      </NotFoundIntro>
    </main>
  );
}
