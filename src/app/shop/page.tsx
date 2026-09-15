import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop — Museum",
};

export default function ShopPage() {
  return (
    <main className="min-h-svh p-gutter pt-page-top">
      <h1 className="text-xs leading-3 font-medium uppercase">Shop</h1>
    </main>
  );
}
