"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Heart, ScanSearch, ShoppingCart, Star, Zap } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatPrice, monthlyInstalment } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductVisual } from "@/components/shop/product-visual";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

/**
 * The zoom viewer used to be imported and MOUNTED by every card — 24 Radix
 * dialogs (plus their portals, focus traps and pointer handlers) on a listing
 * page, none of which anyone had asked for yet. It now loads the first time
 * someone actually clicks zoom.
 */
const ProductZoomDialog = dynamic(
  () =>
    import("@/components/shop/product-zoom-dialog").then(
      (m) => m.ProductZoomDialog
    ),
  { ssr: false }
);

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const addItem = useCart((s) => s.addItem);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.slugs.includes(product.slug));

  const soldOut = product.availability === "out-of-stock";
  const preOrder = product.availability === "pre-order";

  return (
    <>
      <article
        className={cn(
          "group bg-card relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300",
          "hover:border-brand/60 hover:shadow-[0_18px_40px_-24px_color-mix(in_oklab,var(--brand)_60%,transparent)]",
          "hover:-translate-y-1 motion-reduce:hover:translate-y-0",
          className
        )}
      >
        {/* ------------------------------ media ------------------------------ */}
        <div className="bg-surface relative aspect-square overflow-hidden">
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 block p-4 sm:p-5"
            aria-label={product.name}
          >
            <div
              className={cn(
                "relative h-full w-full transition-transform duration-500 ease-out",
                "group-hover:scale-115 motion-reduce:group-hover:scale-100",
                soldOut && "opacity-45 grayscale"
              )}
            >
              <ProductVisual product={product} priority={priority} />
            </div>
          </Link>

          {/* badges */}
          <div className="pointer-events-none absolute top-2.5 left-2.5 z-20 flex flex-col items-start gap-1.5">
            {soldOut && <Badge variant="destructive">Out of Stock</Badge>}
            {preOrder && <Badge variant="soft">Pre-Order</Badge>}
            {!soldOut && product.discountPercent > 0 && (
              <Badge variant="destructive">-{product.discountPercent}%</Badge>
            )}
            {product.isNewArrival && <Badge variant="success">New</Badge>}
          </div>

          {/* hover actions */}
          <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 focus-within:opacity-100 max-sm:opacity-100">
            <Button
              size="icon-sm"
              variant="secondary"
              className="shadow-sm"
              aria-label="Zoom product"
              onClick={() => setZoomOpen(true)}
            >
              <ScanSearch />
            </Button>
            <Button
              size="icon-sm"
              variant="secondary"
              className={cn("shadow-sm", wished && "text-destructive")}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wished}
              onClick={() => {
                toggleWish(product.slug);
                toast[wished ? "message" : "success"](
                  wished ? "Removed from wishlist" : "Saved to wishlist"
                );
              }}
            >
              <Heart className={cn(wished && "fill-current")} />
            </Button>
          </div>

          {product.instalment && !soldOut && (
            <div className="bg-chrome/85 text-chrome-foreground absolute bottom-0 left-0 rounded-tr-lg px-2 py-1 text-[10px] font-semibold tracking-wide">
              EMI from {formatPrice(monthlyInstalment(product.price))}/mo
            </div>
          )}
        </div>

        {/* ------------------------------ body ------------------------------ */}
        <div className="flex flex-1 flex-col gap-1.5 px-3.5 pt-3 pb-2">
          <span className="text-brand-strong dark:text-brand text-[11px] font-bold tracking-[0.12em] uppercase">
            {product.brandName}
          </span>

          <h3 className="line-clamp-2 text-[13px] leading-snug font-medium">
            <Link
              href={`/products/${product.slug}`}
              className="after:absolute after:inset-0 after:z-10 after:content-[''] hover:text-brand-strong dark:hover:text-brand"
            >
              {product.name}
            </Link>
          </h3>

          {product.numReviews > 0 && (
            <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Star className="fill-warning text-warning size-3" />
              <span className="text-foreground font-semibold">{product.rating}</span>
              <span>({product.numReviews})</span>
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1.5">
            <span
              className={cn(
                "text-[15px] font-bold",
                soldOut ? "text-muted-foreground" : "text-brand-strong dark:text-brand"
              )}
            >
              {formatPrice(product.price)}
            </span>
            {product.oldPrice ? (
              <span className="text-muted-foreground text-xs line-through">
                {formatPrice(product.oldPrice)}
              </span>
            ) : null}
          </div>
        </div>

        {/* ------------------------------ cta ------------------------------ */}
        <div className="relative z-20 px-2.5 pb-2.5">
          {soldOut ? (
            <Button
              variant="secondary"
              size="sm"
              className="text-muted-foreground w-full cursor-not-allowed"
              disabled
            >
              Out of Stock
            </Button>
          ) : (
            <Button
              variant="chrome"
              size="sm"
              className="w-full"
              onClick={() => {
                addItem(product, 1);
                toast.success(`${product.name} added to cart`);
              }}
            >
              {preOrder ? (
                <>
                  <ShoppingCart /> Pre-Order
                </>
              ) : (
                <>
                  <Zap className="fill-current" /> Buy Now
                </>
              )}
            </Button>
          )}
        </div>
      </article>

      {zoomOpen && (
        <ProductZoomDialog
          product={product}
          open={zoomOpen}
          onOpenChange={setZoomOpen}
        />
      )}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <div className="bg-muted aspect-square animate-pulse" />
      <div className="space-y-2 p-3.5">
        <div className="bg-muted h-2.5 w-14 animate-pulse rounded" />
        <div className="bg-muted h-3.5 w-full animate-pulse rounded" />
        <div className="bg-muted h-3.5 w-2/3 animate-pulse rounded" />
        <div className="bg-muted h-4 w-20 animate-pulse rounded" />
      </div>
      <div className="px-2.5 pb-2.5">
        <div className="bg-muted h-8 w-full animate-pulse rounded-md" />
      </div>
    </div>
  );
}
