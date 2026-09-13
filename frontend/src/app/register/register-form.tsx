"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Mail, Smartphone, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { ApiError, apiFetch } from "@/lib/api";
import type { AuthUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");

    if (password !== confirm) {
      setErrors({ confirmPassword: "Both passwords must match" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await apiFetch<{ message: string; data: { user: AuthUser } }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: String(form.get("name") ?? ""),
            email,
            phone: String(form.get("phone") ?? "").replace(/\s/g, ""),
            password,
          }),
        }
      );

      toast.success(res.message);

      // Account created — start the session straight away so they land signed in.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.message("Account created — please log in.");
        router.push("/login");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.details ?? {});
        toast.error(error.message);
      } else {
        toast.error("Could not reach the server. Is the API running?");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Your full name"
          required
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <FieldError>{errors.name}</FieldError>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
          required
          aria-invalid={Boolean(errors.email)}
        />
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Mail className="size-3" /> Used for order confirmations and receipts
        </p>
        {errors.email && <FieldError>{errors.email}</FieldError>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">
          Mobile Number <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <span className="bg-muted text-muted-foreground flex h-10 items-center rounded-md border px-3 text-sm font-medium">
            +88
          </span>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            required
            aria-invalid={Boolean(errors.phone)}
          />
        </div>
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Smartphone className="size-3" /> Required for order updates and delivery
        </p>
        {errors.phone && <FieldError>{errors.phone}</FieldError>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">
          Password <span className="text-destructive">*</span>{" "}
          <span className="text-muted-foreground font-normal">(min 6 chars)</span>
        </Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={6}
          required
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <FieldError>{errors.password}</FieldError>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">
          Confirm Password <span className="text-destructive">*</span>
        </Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={6}
          required
          aria-invalid={Boolean(errors.confirmPassword)}
        />
        {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
        {loading ? "Creating account…" : "Create Account & Get OTP"}
      </Button>
    </form>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-destructive text-xs font-medium">{children}</p>;
}
