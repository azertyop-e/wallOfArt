import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthPage } from "@/components/auth-page";
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
    <AuthPage
      title="Sign up"
      intro="Create your account"
      hint="A name, an email and a password: that's all it takes."
    >
      <AuthForm
        mode="signup"
        next={typeof next === "string" ? next : undefined}
      />
    </AuthPage>
  );
}
