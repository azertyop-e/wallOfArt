import type { Metadata } from "next";
import { HomeHero } from "@/components/home-hero";
import { getArtworks } from "@/lib/api";

// Prerendered at build time (SSG), then refreshed hourly with the API (ISR).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Wall of Art — Museum",
  description:
    "Wall of Art, a museum of painting: discover masterpieces from every era.",
};

export default async function Home() {
  const artworks = await getArtworks();

  return (
    <main>
      <HomeHero artworks={artworks} />
    </main>
  );
}
