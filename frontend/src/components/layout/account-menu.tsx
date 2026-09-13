"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Heart,
  LogOut,
  PackageSearch,
  UserRound,
  UserCog,
} from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Reads the session in the browser rather than on the server, so every page
 * stays statically renderable and CDN-cacheable. The trade-off is one short
 * skeleton frame on first paint.
 */
export function AccountMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [pending, startTransition] = React.useTransition();

  const user = session?.user ?? null;

  if (status === "loading") {
    return (
      <span
        aria-hidden
        className="border-chrome-border bg-chrome-border/40 h-10 w-11 animate-pulse rounded-md border sm:w-24"
      />
    );
  }

  if (!user) {
    const target =
      pathname && pathname !== "/"
        ? `/login?callbackUrl=${encodeURIComponent(pathname)}`
        : "/login";

    return (
      <Link
        href={target}
        className="border-chrome-border text-chrome-foreground hover:border-brand hover:text-brand flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors"
      >
        <UserRound className="size-4" />
        <span className="hidden sm:inline">LOGIN</span>
      </Link>
    );
  }

  const first = (user.name ?? user.email ?? "there").split(" ")[0];
  const initial = first.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border-chrome-border text-chrome-foreground hover:border-brand hover:text-brand flex h-10 cursor-pointer items-center gap-2 rounded-md border pr-3 pl-1.5 text-sm font-semibold transition-colors">
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="bg-brand text-brand-foreground flex size-7 items-center justify-center rounded-full text-xs font-bold">
            {initial}
          </span>
        )}
        <span className="hidden max-w-24 truncate sm:inline">{first}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="normal-case">
          <span className="block truncate text-sm font-semibold tracking-normal opacity-100">
            {user.name}
          </span>
          <span className="text-muted-foreground block truncate text-xs font-normal tracking-normal">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/account/orders">
            <PackageSearch /> My orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/wishlist">
            <Heart /> Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/profile">
            <UserCog /> Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault();
            startTransition(async () => {
              await signOutAction();
            });
          }}
        >
          <LogOut /> {pending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
