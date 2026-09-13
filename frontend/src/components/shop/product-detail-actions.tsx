"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

export function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = React.useState(1);
  const [color, setColor] = React.useState(product.colors?.[0] ?? "");

  const addItem = useCart((s) => s.addItem);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.slugs.includes(product.slug));

  const soldOut = product.availability === "out-of-stock";
  const max = Math.max(1, Math.min(10, product.stock || 10));

  const add = () => {
    addItem(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  return (
    <div className="space-y-5">
      {product.colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Colour: <span className="text-muted-foreground font-normal">{color}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                aria-pressed={color === option}
                className={cn(
                  "cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors",
                  color === option
                    ? "border-brand bg-brand/12 text-brand-strong dark:text-brand font-semibold"
                    : "hover:border-brand/60"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 items-center rounded-md border">
          <Button
            variant="ghost"
            size="icon"
            className="h-full rounded-r-none"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || soldOut}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus />
          </Button>
          <span className="w-10 text-center text-sm font-bold tabular-nums">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-full rounded-l-none"
            aria-label="Increase quantity"
            disabled={quantity >= max || soldOut}
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
          >
            <Plus />
          </Button>
        </div>

        <Button
          size="lg"
          className="flex-1"
          disabled={soldOut}
          onClick={() => {
            add();
            router.push("/cart");
          }}
        >
          <Zap className="fill-current" />
          {product.availability === "pre-order" ? "Pre-Order Now" : "Buy Now"}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          disabled={soldOut}
          onClick={add}
        >
          <ShoppingCart /> Add to Cart
        </Button>

        <Button
          size="lg"
          variant="outline"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className={cn("px-4", wished && "text-destructive border-destructive/50")}
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

      {soldOut && (
        <p className="text-destructive text-sm font-medium">
          This item is currently out of stock. Call our hotline to be notified
          when it arrives.
        </p>
      )}
    </div>
  );
}
