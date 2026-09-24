import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { WallTitle } from "@/components/wall-title";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Log in — Museum",
  description: "Log in to your Wall of Art account.",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // Rendered per request (SSR): it reads the session cookie.
  if (await getSession()) redirect("/account");

  const { next } = await searchParams;

  return (
    <main className="min-h-svh px-gutter pt-page-top pb-page-bottom">
      <h1 className="mb-[8vh]">
        <WallTitle title="Log in" />
      </h1>

      <div className="md:span-w-2">
        <AuthForm
          mode="login"
          next={typeof next === "string" ? next : undefined}
        />
      </div>
    </main>
  );
}
