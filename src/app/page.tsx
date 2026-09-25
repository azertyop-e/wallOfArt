import type { Metadata } from "next";
import { HomeHero } from "@/components/home-hero";
import { getArtworks } from "@/lib/api";

// Prerendered at build time (SSG), then refreshed hourly with the API (ISR).
export const revalidate = 3600;

export const metadata: Metadata = {
  // The layout's default title and description already describe the home page.
  alternates: { canonical: "/" },
};

export default async function Home() {
  const artworks = await getArtworks();

  return (
    <main>
      <HomeHero artworks={artworks} />
    </main>
  );
}
