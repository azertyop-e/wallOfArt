import type { Metadata } from "next";
import { HomeHero } from "@/components/home-hero";
import { getArtworks } from "@/lib/api";

export const revalidate = 3600;

export const metadata: Metadata = {
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
