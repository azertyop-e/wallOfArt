"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type AuthFormState = {
  error?: string;
  /** Echoed back so the form keeps what the visitor typed after an error. */
  values?: { name?: string; email?: string };
};

/** Only same-site paths, so `?next=` can't send people to another website. */
function safeRedirectPath(next: FormDataEntryValue | null) {
  // Browsers read "//host" and "/\host" as another origin.
  return typeof next === "string" && /^\/(?![/\\])/.test(next)
    ? next
    : "/account";
}

function errorMessage(error: unknown) {
  if (isAPIError(error)) return error.message;
  console.error(error);
  return "Something went wrong, please try again.";
}

export async function signUp(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Please fill in every field.", values: { name, email } };
  }

  try {
    // Creates the user + its credential account, then signs in (the
    // nextCookies plugin sets the session cookie on this response).
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
  } catch (error) {
    return { error: errorMessage(error), values: { name, email } };
  }

  redirect(safeRedirectPath(formData.get("next")));
}

export async function signIn(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please fill in every field.", values: { email } };
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (error) {
    return { error: errorMessage(error), values: { email } };
  }

  redirect(safeRedirectPath(formData.get("next")));
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
