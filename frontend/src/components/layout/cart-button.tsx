"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { cartCount, useCart } from "@/store/cart";
import { useMounted } from "@/hooks/use-mounted";

export function CartButton() {
  const items = useCart((s) => s.items);
  const mounted = useMounted();
  const count = mounted ? cartCount(items) : 0;

  return (
    <Link
      href="/cart"
      className="border-chrome-border text-chrome-foreground hover:border-brand hover:text-brand relative flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors"
    >
      <ShoppingCart className="size-4" />
      <span className="hidden sm:inline">CART</span>
      {count > 0 && (
        <span className="bg-brand text-brand-foreground absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full text-[11px] font-bold tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
