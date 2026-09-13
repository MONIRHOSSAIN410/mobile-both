"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/password-input";

/**
 * Auth.js reports a failure twice over: `error` is the broad type
 * ("CredentialsSignin") and `code` is the specific reason — either one of the
 * codes thrown by authorize() in src/auth.ts, or the plain "credentials" it
 * uses when authorize() simply returned null. Both are checked.
 */
const MESSAGES: Record<string, string> = {
  api_unreachable:
    "Cannot reach the API. Start the backend (cd backend && npm run dev) and try again.",
  api_error: "The server rejected the request. Check the backend logs.",
  credentials: "Email or password is incorrect",
  CredentialsSignin: "Email or password is incorrect",
  OAuthAccountNotLinked:
    "That email already has an account. Sign in with your password first, then link Google.",
  AccessDenied: "Google sign-in was cancelled.",
  Configuration:
    "Auth is not configured. Run `npm run setup` in the project root, then restart the dev server.",
};

const describe = (...raw: (string | null | undefined)[]) => {
  const values = raw.filter(Boolean) as string[];
  if (values.length === 0) return null;
  for (const value of values) {
    const hit = Object.keys(MESSAGES).find((key) => value.includes(key));
    if (hit) return MESSAGES[hit];
  }
  return "Could not sign you in. Please try again.";
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(() =>
    describe(searchParams.get("error"))
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setPending(true);
    setError(null);

    // Signing in from the client (rather than a server action) is what lets
    // <SessionProvider> pick the new session up immediately — otherwise the
    // header keeps showing "LOGIN" until a hard reload.
    const result = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });

    if (result?.error) {
      setError(describe(result.code, result.error));
      setPending(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && (
        <p
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-brand-strong dark:text-brand text-xs font-semibold hover:underline"
          >
            Forgot?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
        {pending ? "Signing in…" : "Login"}
      </Button>

      <div className="flex items-center gap-2.5 pt-1">
        <Checkbox id="remember" name="remember" defaultChecked />
        <Label htmlFor="remember" className="text-muted-foreground font-normal">
          Keep me logged in on this device
        </Label>
      </div>
    </form>
  );
}
