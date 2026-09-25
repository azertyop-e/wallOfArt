import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "About the Wall of Art: a museum of painting to explore by scrolling.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-svh p-gutter pt-page-top">
      <h1 className="text-xs leading-3 font-medium uppercase">About</h1>
    </main>
  );
}
