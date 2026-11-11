"use client";

import { useActionState } from "react";
import { LoaderCircle, LogIn, TriangleAlert } from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { loginAction, type LoginState } from "../actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="admin-password" className="block text-sm font-semibold text-navy">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "admin-password-error" : undefined}
          className="mt-1.5 block w-full rounded-lg border border-steel/25 bg-white px-3.5 py-3 text-base text-charcoal shadow-xs focus:border-navy/50 focus:outline-none focus:ring-3 focus:ring-accent/25"
        />
        {state.error && (
          <p id="admin-password-error" role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-red-700">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {state.error}
          </p>
        )}
      </div>
      <button type="submit" disabled={pending} className={buttonStyles({ variant: "secondary", size: "lg", className: "w-full" })}>
        {pending ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> Signing in…
          </>
        ) : (
          <>
            <LogIn className="size-5" aria-hidden="true" /> Sign in
          </>
        )}
      </button>
    </form>
  );
}
