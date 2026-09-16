import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkCard } from "@/components/artwork-card";
import { ArtworkImage } from "@/components/artwork-image";
import {
  getArtwork,
  getArtworks,
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

  return (
    <main className="min-h-svh p-gutter pt-page-top">
      <Link
        href="/paintings"
        className="text-[10px] leading-3 font-medium text-muted uppercase transition-colors duration-300 hover:text-foreground"
      >
        ← All paintings
      </Link>

      <article className="mt-10 flex flex-col gap-gutter lg:flex-row">
        {artwork.image && (
          <div className="w-full lg:sticky lg:top-page-top lg:self-start lg:span-w-4 wide:span-w-3 ultrawide:span-w-2">
            <div className="relative h-[60svh] lg:h-[calc(100svh-var(--spacing-page-top)-var(--spacing-gutter))]">
              <ArtworkImage
                src={artwork.image}
                alt={artwork.title}
                fill
                preload
                sizes="(min-width: 100rem) and (min-aspect-ratio: 32/9) 33vw, (min-width: 100rem) and (min-aspect-ratio: 21/9) 50vw, (min-width: 1024px) 66vw, 100vw"
                className="object-contain object-top-left"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-10 lg:span-w-2">
          <header>
            <h1 className="text-4xl leading-none font-medium tracking-tight uppercase">
              {artwork.title}
            </h1>
            {artwork.artist && (
              <p className="mt-2 text-xs leading-3 font-medium text-muted uppercase">
                {artwork.artist}
                {artwork.year && `, ${artwork.year}`}
              </p>
            )}
          </header>

          <dl className="text-[10px] leading-3 font-medium uppercase">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="flex justify-between gap-4 border-t border-foreground/10 py-2"
              >
                <dt className="text-muted">{detail.label}</dt>
                <dd className="text-right">{detail.value}</dd>
              </div>
            ))}
            {artwork.location && (
              <div className="flex justify-between gap-4 border-y border-foreground/10 py-2">
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

          {artwork.description && (
            <div
              className="max-w-[70ch] space-y-4 text-sm leading-relaxed [&_em]:italic [&_i]:italic [&_strong]:font-medium"
              dangerouslySetInnerHTML={{ __html: artwork.description }}
            />
          )}
        </div>
      </article>

      {gallery.length > 0 && (
        <section className="mt-24">
          <h2 className="text-xs leading-3 font-medium uppercase">Gallery</h2>
          <ul className="mt-6 grid grid-cols-1 gap-gutter md:grid-cols-2 wide:grid-cols-3">
            {gallery.map((src, index) => (
              <li key={src} className="relative aspect-4/3 bg-neutral-100">
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
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-xs leading-3 font-medium uppercase">
            Similar paintings
          </h2>
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
        </section>
      )}
    </main>
  );
}
