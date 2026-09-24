import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

/**
 * The current session, checked against the database. Deduplicated per request,
 * so layouts, pages and components can all call it without extra queries.
 */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/** The signed-in user, or a redirect to the login page. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}
