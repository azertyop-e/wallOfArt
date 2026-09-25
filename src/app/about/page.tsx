import type { Metadata } from "next";
import Link from "next/link";
import { AboutIntro } from "@/components/about-intro";
import { ArtworkCard } from "@/components/artwork-card";
import { Reveal } from "@/components/reveal";
import { WallTitle } from "@/components/wall-title";
import { type Artwork, getArtworks } from "@/lib/api";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description:
    "About the Wall of Art: a museum of painting to explore by scrolling.",
  alternates: { canonical: "/about" },
};

const hours = [
  { days: "Wednesday — Monday", time: "10:00 — 18:00" },
  { days: "Friday late opening", time: "Until 21:45" },
  { days: "Tuesday", time: "Closed" },
];

function countBy(artworks: Artwork[], key: "movement" | "artist") {
  const counts = new Map<string, number>();

  for (const artwork of artworks) {
    const value = artwork[key];
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

export default async function AboutPage() {
  const artworks = await getArtworks();

  const movements = [...countBy(artworks, "movement")]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));

  const dated = artworks
    .filter((artwork) => artwork.image && artwork.year)
    .sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
  const oldest = dated[0];
  const newest = dated.at(-1);

  const figures = [
    { value: artworks.length, label: "Artworks" },
    { value: countBy(artworks, "artist").size, label: "Artists" },
    { value: movements.length, label: "Movements" },
    ...(oldest?.year && newest?.year
      ? [{ value: newest.year - oldest.year, label: "Years of painting" }]
      : []),
  ];

  return (
    <main className="min-h-svh px-gutter pt-page-top pb-page-bottom">
      <AboutIntro>
        <p
          data-about-fade
          className="mb-gutter text-[10px] leading-3 font-medium text-muted uppercase"
        >
          The museum
        </p>

        <h1>
          <WallTitle title="About" />
        </h1>

        <div className="mt-gutter grid gap-gutter text-xs leading-4 font-medium uppercase md:grid-cols-6">
          <p data-about-fade className="max-w-[46ch] md:col-span-3">
            {SITE_NAME} is a museum of painting with no rooms and no corridors:
            the whole collection hangs on a single wall that you walk by
            scrolling.
          </p>
          <p
            data-about-fade
            className="text-muted md:col-span-2 md:col-start-5"
          >
            From a Flemish altarpiece to American realism, every work can be
            looked at up close, read about and compared with its neighbours.
          </p>
        </div>
      </AboutIntro>

      <section aria-labelledby="about-figures" className="mt-[18vh]">
        <h2 id="about-figures" className="sr-only">
          The collection in figures
        </h2>

        <Reveal variant="items">
          <dl className="grid grid-cols-2 gap-gutter md:grid-cols-4">
            {figures.map((figure) => (
              <div
                key={figure.label}
                data-reveal-item
                className="flex flex-col-reverse gap-3 border-t border-foreground/10 pt-3"
              >
                <dt className="text-[10px] leading-3 font-medium text-muted uppercase">
                  {figure.label}
                </dt>
                <dd className="text-6xl leading-[0.8] font-medium tracking-tight md:text-8xl">
                  {figure.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section
        aria-labelledby="about-idea"
        className="mt-[18vh] grid gap-gutter md:grid-cols-6"
      >
        <Reveal variant="lines" className="md:col-span-1">
          <h2
            id="about-idea"
            className="text-xs leading-3 font-medium uppercase"
          >
            The idea
          </h2>
        </Reveal>

        <Reveal variant="lines" className="md:col-span-4 md:col-start-3">
          <p className="text-2xl leading-tight font-medium tracking-tight uppercase md:text-4xl">
            A museum you visit at your own pace. No map, no queue, no velvet
            rope: just paintings, side by side, the way the centuries left them.
          </p>
          <p className="mt-8 max-w-[60ch] text-sm leading-relaxed">
            Each painting comes with its story, its artist, its movement and the
            place where it actually hangs today. Follow a movement, jump to a
            similar work, save the ones you love, then come and see them for
            real.
          </p>
        </Reveal>
      </section>

      {oldest && newest && oldest !== newest && (
        <section aria-labelledby="about-span" className="mt-[18vh]">
          <Reveal variant="lines">
            <h2
              id="about-span"
              className="text-xs leading-3 font-medium uppercase"
            >
              From {oldest.year} to {newest.year}
            </h2>
          </Reveal>

          <Reveal variant="artworks">
            <ul className="mt-6 grid grid-cols-2 gap-gutter md:grid-cols-6">
              <li className="md:col-span-2">
                <ArtworkCard
                  artwork={oldest}
                  sizes="(min-width: 768px) 33vw, 50vw"
                />
              </li>
              <li className="md:col-span-2 md:col-start-5">
                <ArtworkCard
                  artwork={newest}
                  sizes="(min-width: 768px) 33vw, 50vw"
                />
              </li>
            </ul>
          </Reveal>
        </section>
      )}

      {movements.length > 0 && (
        <section
          aria-labelledby="about-movements"
          className="mt-[18vh] grid gap-gutter md:grid-cols-6"
        >
          <Reveal variant="lines" className="md:col-span-2">
            <h2
              id="about-movements"
              className="text-xs leading-3 font-medium uppercase"
            >
              Movements
            </h2>
            <p className="mt-3 max-w-[32ch] text-[10px] leading-3 font-medium text-muted uppercase">
              Pick one to see its paintings on the wall.
            </p>
          </Reveal>

          <Reveal variant="items" className="md:col-span-4 md:col-start-3">
            <ul className="grid gap-x-gutter text-[10px] leading-3 font-medium uppercase md:grid-cols-2">
              {movements.map((movement) => (
                <li key={movement.name} data-reveal-item>
                  <Link
                    href={{
                      pathname: "/paintings",
                      query: { movement: movement.name },
                    }}
                    className="flex justify-between gap-4 border-t border-foreground/10 py-2 transition-colors duration-300 hover:text-muted"
                  >
                    {movement.name}
                    <span className="text-muted">{movement.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}

      <section
        aria-labelledby="about-visit"
        className="mt-[18vh] grid gap-gutter md:grid-cols-6"
      >
        <Reveal variant="lines" className="md:col-span-2">
          <h2
            id="about-visit"
            className="text-xs leading-3 font-medium uppercase"
          >
            Visit
          </h2>
        </Reveal>

        <Reveal variant="items" className="md:col-span-2 md:col-start-3">
          <dl className="text-[10px] leading-3 font-medium uppercase">
            {hours.map((row) => (
              <div
                key={row.days}
                data-reveal-item
                className="flex justify-between gap-4 border-t border-foreground/10 py-2"
              >
                <dt className="text-muted">{row.days}</dt>
                <dd className="text-right">{row.time}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal
          variant="items"
          className="flex flex-col gap-3 text-[10px] leading-3 font-medium uppercase md:col-span-2 md:col-start-5"
        >
          <p data-reveal-item className="text-muted">
            Adults 24€, under 5s free, group and reduced rates available. The
            museum map is handed out at the front desk.
          </p>
          <Link
            data-reveal-item
            href="/tickets"
            className="w-fit transition-colors duration-300 hover:text-muted"
          >
            Book your tickets →
          </Link>
        </Reveal>
      </section>

      <section
        aria-labelledby="about-credits"
        className="mt-[18vh] grid gap-gutter md:grid-cols-6"
      >
        <Reveal variant="lines" className="md:col-span-2">
          <h2
            id="about-credits"
            className="text-xs leading-3 font-medium uppercase"
          >
            Credits
          </h2>
        </Reveal>
      </section>
    </main>
  );
}
