import Link from "next/link";
import { ArtworkImage } from "@/components/artwork-image";
import type { Artwork } from "@/lib/api";

type ArtworkCardProps = {
  artwork: Artwork;
  sizes: string;
  onSelect?: () => void;
};

export function ArtworkCard({ artwork, sizes, onSelect }: ArtworkCardProps) {
  return (
    <Link
      href={`/paintings/${artwork.slug}`}
      onClick={onSelect}
      className="group block"
    >
      <div
        data-artwork-frame
        className="relative aspect-4/5 overflow-hidden bg-neutral-100"
      >
        {artwork.image && (
          <ArtworkImage
            src={artwork.image}
            alt={artwork.title}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
      </div>

      <div
        data-artwork-caption
        className="mt-3 flex justify-between gap-4 text-[10px] leading-3 font-medium uppercase"
      >
        <div>
          <h2>{artwork.title}</h2>
          {artwork.artist && <p className="text-muted">{artwork.artist}</p>}
        </div>
        {artwork.year && <p className="text-muted">{artwork.year}</p>}
      </div>
    </Link>
  );
}
