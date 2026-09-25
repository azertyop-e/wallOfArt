import type { MetadataRoute } from "next";
import { getArtworks } from "@/lib/api";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artworks = await getArtworks();
  const url = (path: string) => new URL(path, SITE_URL).href;

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/paintings"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/tickets"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.5 },
    ...artworks.map((artwork) => ({
      url: url(`/paintings/${artwork.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: artwork.image ? [artwork.image] : undefined,
    })),
  ];
}
