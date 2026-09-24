import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { WallTitle } from "@/components/wall-title";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign up — Museum",
  description: "Create your Wall of Art account.",
  robots: { index: false },
};

export default async function SignupPage({
  searchParams,
}: PageProps<"/signup">) {
  // Rendered per request (SSR): it reads the session cookie.
  if (await getSession()) redirect("/account");

  const { next } = await searchParams;

  return (
    // One screen on desktop, the form on the left half.
    <main className="grid min-h-svh grid-cols-1 px-gutter md:h-svh md:grid-cols-6 md:gap-x-gutter md:overflow-clip">
      {/* Equal top and bottom rows: the form sits in the middle of the screen,
          whatever the intro and the title take. */}
      <div className="grid min-h-svh grid-rows-[1fr_auto_1fr] gap-y-[6vh] md:col-span-3">
        <p className="self-start pt-page-top text-[10px] leading-3 font-medium uppercase">
          Create your account
          <br />
          <span className="text-muted">
            A name, an email and a password: that's all it takes.
          </span>
        </p>

        <div className="md:span-w-2">
          <AuthForm
            mode="signup"
            next={typeof next === "string" ? next : undefined}
          />
        </div>

        {/* Sized to fit the left half, pinned to its bottom-left corner. */}
        <h1 className="self-end pb-gutter [--wall-title-size:18vw] md:[--wall-title-size:10vw]">
          <WallTitle title="Sign up" align="start" />
        </h1>
      </div>
    </main>
  );
}
