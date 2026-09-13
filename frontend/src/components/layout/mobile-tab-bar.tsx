"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, ShoppingCart, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { cartCount, useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/hooks/use-mounted";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Shop", icon: LayoutGrid },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account/wishlist", label: "Saved", icon: Heart },
  { href: "/login", label: "Account", icon: UserRound },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const wishes = useWishlist((s) => s.slugs.length);

  const badges: Record<string, number> = {
    "/cart": mounted ? cartCount(items) : 0,
    "/account/wishlist": mounted ? wishes : 0,
  };

  return (
    <nav
      aria-label="Quick navigation"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          const badge = badges[href] ?? 0;

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-brand-strong dark:text-brand" : "text-muted-foreground"
                )}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  {badge > 0 && (
                    <span className="bg-brand text-brand-foreground absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full text-[9px] font-bold">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
