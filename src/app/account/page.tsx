import type { Metadata } from "next";
import { WallTitle } from "@/components/wall-title";
import { signOut } from "@/lib/auth-actions";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Account — Museum",
  robots: { index: false },
};

const memberSince = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
});

export default async function AccountPage() {
  // The proxy only checked that a cookie exists; this checks the session in
  // the database and redirects to /login if it is invalid or expired.
  const user = await requireUser();

  return (
    <main className="min-h-svh px-gutter pt-page-top pb-page-bottom">
      <p className="mb-gutter text-[10px] leading-3 font-medium text-muted uppercase">
        Your account
      </p>

      <h1 className="mb-[8vh]">
        <WallTitle title={user.name} />
      </h1>

      <dl className="grid grid-cols-[auto_1fr] gap-x-gutter gap-y-3 text-xs leading-4 font-medium uppercase md:span-w-3">
        <dt className="text-muted">Email</dt>
        <dd className="normal-case">{user.email}</dd>
        <dt className="text-muted">Member since</dt>
        <dd>{memberSince.format(user.createdAt)}</dd>
      </dl>

      <form action={signOut} className="mt-[8vh]">
        <button
          type="submit"
          className="text-[10px] leading-3 font-medium text-muted uppercase underline underline-offset-2 transition-colors duration-300 hover:text-foreground"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
