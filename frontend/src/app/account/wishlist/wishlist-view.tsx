"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import type { Product } from "@/lib/types";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductCardSkeleton } from "@/components/shop/product-card";

export function WishlistView({ products }: { products: Product[] }) {
  const mounted = useMounted();
  const slugs = useWishlist((s) => s.slugs);
  const clear = useWishlist((s) => s.clear);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const saved = products.filter((p) => slugs.includes(p.slug));

  if (saved.length === 0) {
    return (
      <div className="bg-card flex flex-col items-center gap-3 rounded-xl border py-20 text-center">
        <Heart className="text-muted-foreground size-10" />
        <h2 className="text-lg font-bold">Nothing saved yet</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Tap the heart on any product card to keep it here. The list is stored
          in this browser.
        </p>
        <Button asChild className="mt-2">
          <Link href="/products">Find something you like</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {saved.length} saved {saved.length === 1 ? "product" : "products"}
        </p>
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear wishlist
        </Button>
      </div>
      <ProductGrid products={saved} priorityCount={0} />
    </div>
  );
}
