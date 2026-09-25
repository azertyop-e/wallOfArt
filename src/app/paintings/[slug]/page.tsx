import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkCard } from "@/components/artwork-card";
import { ArtworkImage } from "@/components/artwork-image";
import { ArtworkPager } from "@/components/artwork-pager";
import { FavoriteButton } from "@/components/favorite-button";
import { HtmlContent } from "@/components/html-content";
import { Parallax } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import {
  getArtwork,
  getArtworks,
  getNextArtwork,
  getRelatedArtworks,
  getTypeLabel,
} from "@/lib/api";

export const revalidate = 3600;

export async function generateStaticParams() {
  const artworks = await getArtworks();
  return artworks.map((artwork) => ({ slug: artwork.slug }));
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
}: PageProps<"/paintings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtwork(slug);

  if (!artwork) return { title: "Painting not found — Museum" };

  const title = `${artwork.title}${artwork.artist ? `, ${artwork.artist}` : ""} — Museum`;
  const description = artwork.description
    ? `${stripHtml(artwork.description).slice(0, 155)}…`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: artwork.image ? [{ url: artwork.image }] : undefined,
    },
  };
}

export default async function PaintingPage({
  params,
}: PageProps<"/paintings/[slug]">) {
  const { slug } = await params;
  const artwork = await getArtwork(slug);

  if (!artwork) notFound();

  const details = [
    { label: "Artist", value: artwork.artist },
    { label: "Year", value: artwork.year },
    { label: "Type", value: getTypeLabel(artwork.type) },
    { label: "Movement", value: artwork.movement },
    { label: "Dominant color", value: artwork.color },
  ].filter((detail) => detail.value !== undefined && detail.value !== "");

  const gallery = (artwork.gallery ?? []).filter(
    (src) => src !== artwork.image,
  );
  const related = await getRelatedArtworks(artwork);
  const next = related[0] ?? (await getNextArtwork(artwork));

  return (
    <main key={artwork.slug} className="min-h-svh pb-[18vh]">
      <section className="flex h-svh flex-col gap-6 overflow-clip px-gutter pt-page-top pb-gutter">
        <Link
          href="/paintings"
          className="w-fit text-[10px] leading-3 font-medium text-muted uppercase transition-colors duration-300 hover:text-foreground"
        >
          ← All paintings
        </Link>

        {artwork.image && (
          <Reveal variant="artworks" className="relative min-h-0 flex-1">
            <Parallax className="absolute inset-0" speed={0.25}>
              <div data-artwork-frame className="absolute inset-0">
                <ArtworkImage
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  preload
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            </Parallax>
          </Reveal>
        )}
      </section>

      <article className="mt-[12vh] px-gutter">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal variant="lines">
              <h1 className="text-4xl leading-none font-medium tracking-tight uppercase md:text-6xl">
                {artwork.title}
              </h1>
            </Reveal>
            {artwork.artist && (
              <Reveal variant="items" delay={0.3}>
                <p
                  data-reveal-item
                  className="mt-3 text-xs leading-3 font-medium text-muted uppercase"
                >
                  {artwork.artist}
                  {artwork.year && `, ${artwork.year}`}
                </p>
              </Reveal>
            )}
          </div>

          <Reveal variant="items" delay={0.4}>
            <div data-reveal-item>
              <FavoriteButton slug={artwork.slug} />
            </div>
          </Reveal>
        </header>

        <div className="mt-16 flex flex-col gap-16 lg:flex-row lg:justify-between lg:gap-gutter">
          {artwork.description && (
            <Reveal variant="lines" className="lg:span-w-3">
              <HtmlContent
                html={artwork.description}
                className="max-w-[70ch] space-y-4 text-sm leading-relaxed [&_em]:italic [&_i]:italic [&_strong]:font-medium"
              />
            </Reveal>
          )}

          <Reveal variant="items" delay={0.2} className="lg:span-w-2">
            <dl className="text-[10px] leading-3 font-medium uppercase">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  data-reveal-item
                  className="flex justify-between gap-4 border-t border-foreground/10 py-2"
                >
                  <dt className="text-muted">{detail.label}</dt>
                  <dd className="text-right">{detail.value}</dd>
                </div>
              ))}
              {artwork.location && (
                <div
                  data-reveal-item
                  className="flex justify-between gap-4 border-y border-foreground/10 py-2"
                >
                  <dt className="text-muted">Location</dt>
                  <dd className="text-right">
                    {artwork.locationLink ? (
                      <a
                        href={artwork.locationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-muted"
                      >
                        {artwork.location}
                      </a>
                    ) : (
                      artwork.location
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>
        </div>
      </article>

      <div className="px-gutter">
        {gallery.length > 0 && (
          <section className="mt-24">
            <Reveal variant="lines">
              <h2 className="text-xs leading-3 font-medium uppercase">
                Gallery
              </h2>
            </Reveal>
            <Reveal variant="artworks">
              <ul className="mt-6 grid grid-cols-1 gap-gutter md:grid-cols-2 wide:grid-cols-3">
                {gallery.map((src, index) => (
                  <li
                    key={src}
                    data-artwork-frame
                    className="relative aspect-4/3 overflow-hidden bg-neutral-100"
                  >
                    <ArtworkImage
                      src={src}
                      alt={`${artwork.title} — view ${index + 2}`}
                      fill
                      sizes="(min-width: 100rem) and (min-aspect-ratio: 21/9) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-contain"
                    />
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-24">
            <Reveal variant="lines">
              <h2 className="text-xs leading-3 font-medium uppercase">
                Similar paintings
              </h2>
            </Reveal>
            <Reveal variant="artworks">
              <ul className="mt-6 grid grid-cols-2 gap-x-gutter gap-y-12 md:grid-cols-3 lg:grid-cols-6">
                {related.map((item) => (
                  <li key={item.id}>
                    <ArtworkCard
                      artwork={item}
                      sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                    />
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>
        )}
      </div>

      {next && (
        <ArtworkPager
          key={artwork.slug}
          next={{ slug: next.slug, title: next.title }}
        />
      )}
    </main>
  );
}
