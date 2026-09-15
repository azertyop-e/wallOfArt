"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";
import { getWikimediaThumbnail, isWikimediaThumbnail } from "@/lib/wikimedia";

const wikimediaLoader: ImageLoader = ({ src, width }) =>
  getWikimediaThumbnail(src, width);

type ArtworkImageProps = Omit<ImageProps, "src" | "loader"> & {
  src: string;
};

export function ArtworkImage({ src, alt, ...props }: ArtworkImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      loader={isWikimediaThumbnail(src) ? wikimediaLoader : undefined}
      {...props}
    />
  );
}
