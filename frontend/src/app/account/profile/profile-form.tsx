"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { BadgeCheck, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function ProfileForm() {
  const { request, isAuthenticated, isLoading, user } = useApi();
  const { update } = useSession();

  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Loading your profile…
      </p>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-card flex flex-col items-start gap-3 rounded-xl border p-6">
        <p className="text-sm font-medium">Please log in to see your profile.</p>
        <Button asChild size="sm">
          <Link href="/login?callbackUrl=/account/profile">Log in</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setErrors({});

    try {
      await request("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? "").replace(/\s/g, ""),
        }),
      });
      await update();
      toast.success("Profile saved");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.details ?? {});
        toast.error(error.message);
      } else {
        toast.error("Could not reach the server. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-5">
      <div className="bg-card flex items-center gap-4 rounded-xl border p-5">
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="bg-brand text-brand-foreground flex size-14 items-center justify-center rounded-full text-xl font-bold">
            {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold">{user.name}</p>
          <p className="text-muted-foreground truncate text-sm">{user.email}</p>
          <Badge variant="soft" className="mt-1 gap-1">
            <BadgeCheck className="size-3" /> Verified account
          </Badge>
        </div>
      </div>

      {user.needsPhone && (
        <p className="border-warning/50 bg-warning/10 rounded-xl border p-4 text-sm">
          Add a mobile number so we can reach you about deliveries — Google does
          not share one with us.
        </p>
      )}

      <div className="bg-card space-y-4 rounded-xl border p-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" defaultValue={user.name ?? ""} required />
          {errors.name && (
            <p className="text-destructive text-xs font-medium">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Mobile number</Label>
          <div className="flex gap-2">
            <span className="bg-muted text-muted-foreground flex h-10 items-center rounded-md border px-3 text-sm font-medium">
              +88
            </span>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              placeholder="01XXXXXXXXX"
              defaultValue={user.phone ?? ""}
            />
          </div>
          {errors.phone && (
            <p className="text-destructive text-xs font-medium">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" defaultValue={user.email ?? ""} disabled />
          <p className="text-muted-foreground text-xs">
            Your email is how we identify your account — it cannot be changed here.
          </p>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={saving}>
        {saving ? <Loader2 className="animate-spin" /> : <Save />}
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
