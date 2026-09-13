import type { Metadata } from "next";
import { Suspense } from "react";

import { RegisterForm } from "@/app/register/register-form";
import { AuthDivider, AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import {
  AuthButtonFallback,
  AuthFormFallback,
} from "@/components/auth/auth-fallback";
import { isGoogleEnabled } from "@/auth";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Create Account",
  description: `Join ${site.name} for exclusive deals, faster checkout and order tracking.`,
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create Account"
      subtitle={`Join ${site.name} for exclusive deals`}
      footer={
        <>
          Already have an account? <AuthLink href="/login">Login</AuthLink>
        </>
      }
    >
      {isGoogleEnabled && (
        <>
          <Suspense fallback={<AuthButtonFallback />}>
            <GoogleButton label="Sign up with Google" />
          </Suspense>
          <AuthDivider label="or register with email" />
        </>
      )}
      <Suspense fallback={<AuthFormFallback />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
