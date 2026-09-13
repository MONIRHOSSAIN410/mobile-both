import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/app/login/login-form";
import { AuthDivider, AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import {
  AuthButtonFallback,
  AuthFormFallback,
} from "@/components/auth/auth-fallback";
import { isGoogleEnabled } from "@/auth";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Login",
  description: `Sign in to your ${site.name} account to track orders and check out faster.`,
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome Back"
      subtitle={`Sign in to ${site.name}`}
      footer={
        <>
          No account? <AuthLink href="/register">Create one</AuthLink>
        </>
      }
    >
      {isGoogleEnabled && (
        <>
          <Suspense fallback={<AuthButtonFallback />}>
            <GoogleButton label="Continue with Google" />
          </Suspense>
          <AuthDivider label="or sign in with" />
        </>
      )}
      <Suspense fallback={<AuthFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
