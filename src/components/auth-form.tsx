"use client";

import Link from "next/link";
import { useActionState } from "react";
import { type AuthFormState, signIn, signUp } from "@/lib/auth-actions";

const modes = {
  login: {
    action: signIn,
    submit: "Log in",
    pending: "Logging in…",
    switchText: "No account yet?",
    switchLabel: "Sign up",
    switchHref: "/signup",
  },
  signup: {
    action: signUp,
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLabel: "Log in",
    switchHref: "/login",
  },
} as const;

type AuthFormProps = {
  mode: keyof typeof modes;
  /** Where to go once signed in, forwarded from the `?next=` search param. */
  next?: string;
};

export function AuthForm({ mode, next }: AuthFormProps) {
  const config = modes[mode];
  const [state, formAction, isPending] = useActionState<
    AuthFormState,
    FormData
  >(config.action, {});
  const switchHref = next
    ? `${config.switchHref}?next=${encodeURIComponent(next)}`
    : config.switchHref;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-gutter text-xs leading-4 font-medium uppercase"
    >
      {next && <input type="hidden" name="next" value={next} />}

      {mode === "signup" && (
        <Field
          label="Name"
          name="name"
          autoComplete="name"
          defaultValue={state.values?.name}
        />
      )}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.values?.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        minLength={mode === "signup" ? 8 : undefined}
      />

      <p aria-live="polite" className="min-h-4 text-[10px] leading-3">
        {state.error}
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="self-start bg-foreground px-4 py-3 text-[10px] leading-3 text-background transition-opacity duration-300 hover:opacity-80 disabled:opacity-50"
      >
        {isPending ? config.pending : config.submit}
      </button>

      <p className="flex gap-2 text-[10px] leading-3 text-muted">
        {config.switchText}
        <Link
          href={switchHref}
          className="text-foreground underline underline-offset-2"
        >
          {config.switchLabel}
        </Link>
      </p>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
  defaultValue?: string;
  minLength?: number;
};

function Field({ label, name, type = "text", ...inputProps }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] leading-3 text-muted">{label}</span>
      <input
        // Remount with the echoed value after a failed submission: React
        // resets uncontrolled form fields once the action completes.
        key={inputProps.defaultValue}
        name={name}
        type={type}
        required
        className="border-b border-current/40 bg-transparent pb-1 normal-case outline-none transition-colors duration-300 focus:border-current"
        {...inputProps}
      />
    </label>
  );
}
