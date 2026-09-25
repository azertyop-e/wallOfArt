import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthPage } from "@/components/auth-page";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Wall of Art account.",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getSession()) redirect("/account");

  const { next } = await searchParams;

  return (
    <AuthPage
      title="Log in"
      intro="Welcome back"
      hint="Log in with your email and password."
    >
      <AuthForm
        mode="login"
        next={typeof next === "string" ? next : undefined}
      />
    </AuthPage>
  );
}
