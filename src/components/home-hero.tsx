import Link from "next/link";
import { HeroIntro } from "@/components/hero-intro";
import { HomeArtwork, type WallArtwork } from "@/components/home-artwork";
import { WallTitle } from "@/components/wall-title";
import type { Artwork } from "@/lib/api";

const WALL_SIZE = 6;

function pickWall(artworks: Artwork[]) {
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

type HomeHeroProps = {
  artworks: Artwork[];
};

export function HomeHero({ artworks }: HomeHeroProps) {
  const wall = pickWall(artworks);
  const years = wall.map((artwork) => artwork.year);

  return (
    <section className="overflow-clip">
      <HeroIntro className="flex min-h-svh flex-col gap-gutter p-gutter pt-page-top">
        <ul
          data-hero-wall
          aria-label="Selected artworks"
          className="grid flex-1 grid-cols-3 content-center items-center gap-gutter py-6 md:grid-cols-6"
        >
          {wall.map((artwork) => (
            <li key={artwork.id} className="flex min-w-0 justify-center">
              <HomeArtwork artwork={artwork} />
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 items-end gap-gutter text-[10px] leading-3 font-medium uppercase md:grid-cols-3">
          <p data-hero-fade>
            A museum of painting
            <br />
            <span className="text-muted">
              {artworks.length} artworks
              {years.length > 0 && `, ${years[0]} — ${years.at(-1)}`}
            </span>
          </p>
          <Link
            data-hero-fade
            href="/paintings"
            className="justify-self-end transition-colors duration-300 hover:text-muted md:col-start-3"
          >
            Explore the collection →
          </Link>
        </div>

        <h1>
          <WallTitle />
        </h1>
      </HeroIntro>
    </section>
  );
}
