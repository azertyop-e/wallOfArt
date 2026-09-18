import Link from "next/link";
import { ArtworkImage } from "@/components/artwork-image";
import type { WallArtwork } from "@/lib/wall";

type HomeArtworkProps = {
  artwork: WallArtwork;
};

export function HomeArtwork({ artwork }: HomeArtworkProps) {
  return (
    <div data-hero-drift className="flex max-w-full flex-col items-center">
      <Link
        href={`/paintings/${artwork.slug}`}
        className="group flex max-w-full flex-col items-center gap-2 outline-offset-4"
      >
        <div data-artwork-frame className="max-w-full overflow-clip">
          <ArtworkImage
            src={artwork.image}
            alt={`${artwork.title}${artwork.artist ? `, ${artwork.artist}` : ""}`}
            width={480}
            height={600}
            preload
            sizes="(min-width: 768px) 16vw, 33vw"
            className="block h-auto max-h-[22svh] w-auto max-w-full transition-[scale] duration-700 ease-out group-hover:scale-105 md:max-h-[36svh]"
          />
        </div>
        <span
          data-hero-fade
          className="text-[10px] leading-3 font-medium text-muted uppercase transition-colors duration-300 group-hover:text-foreground"
        >
          {artwork.year}
        </span>
      </Link>
    </div>
  );
}
