"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatPrice } from "@/lib/format";
import { cartTotal, useCart } from "@/store/cart";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductVisual } from "@/components/shop/product-visual";

const FREE_DELIVERY_OVER = 20000;
const DELIVERY_FEE = 80;

export function CartView() {
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);

  if (!mounted) {
    return <div className="bg-muted h-64 animate-pulse rounded-xl" />;
  }

  if (items.length === 0) {
    return (
      <div className="bg-card flex flex-col items-center gap-3 rounded-xl border py-20 text-center">
        <ShoppingBag className="text-muted-foreground size-10" />
        <h2 className="text-lg font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Browse the catalogue and add something you like — your cart is saved in
          this browser.
        </p>
        <Button asChild className="mt-2">
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  const subtotal = cartTotal(items);
  const delivery = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.slug}
            className="bg-card flex gap-4 rounded-xl border p-3 sm:p-4"
          >
            <Link
              href={`/products/${item.slug}`}
              className="bg-surface relative size-24 shrink-0 overflow-hidden rounded-lg p-2"
            >
              <ProductVisual
                product={{
                  name: item.name,
                  slug: item.slug,
                  images: item.image ? [item.image] : [],
                  accent: item.accent,
                  categorySlug: item.categorySlug,
                  brandName: item.brandName,
                }}
                sizes="96px"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-brand-strong dark:text-brand text-[11px] font-bold tracking-[0.1em] uppercase">
                {item.brandName}
              </span>
              <Link
                href={`/products/${item.slug}`}
                className="hover:text-brand-strong dark:hover:text-brand line-clamp-2 text-sm font-medium"
              >
                {item.name}
              </Link>
              <span className="text-brand-strong dark:text-brand text-sm font-bold">
                {formatPrice(item.price)}
              </span>

              <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                <div className="flex h-9 items-center rounded-md border">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-full rounded-r-none"
                    aria-label={`Decrease quantity of ${item.name}`}
                    disabled={item.quantity <= 1}
                    onClick={() => setQuantity(item.slug, item.quantity - 1)}
                  >
                    <Minus />
                  </Button>
                  <span className="w-9 text-center text-sm font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-full rounded-l-none"
                    aria-label={`Increase quantity of ${item.name}`}
                    disabled={item.quantity >= 10}
                    onClick={() => setQuantity(item.slug, item.quantity + 1)}
                  >
                    <Plus />
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    removeItem(item.slug);
                    toast.message("Removed from cart");
                  }}
                  className="text-muted-foreground hover:text-destructive flex cursor-pointer items-center gap-1.5 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="size-3.5" /> Remove
                </button>

                <span className="ml-auto text-sm font-bold tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear cart
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>

      {/* ------------------------------ summary ------------------------------ */}
      <aside className="bg-card h-fit rounded-xl border p-5 lg:sticky lg:top-32">
        <h2 className="mb-4 font-bold">Order summary</h2>

        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="font-medium tabular-nums">
              {delivery === 0 ? (
                <span className="text-success">Free</span>
              ) : (
                formatPrice(delivery)
              )}
            </dd>
          </div>
        </dl>

        {delivery > 0 && (
          <p className="text-muted-foreground mt-3 text-xs">
            Add {formatPrice(FREE_DELIVERY_OVER - subtotal)} more for free
            delivery.
          </p>
        )}

        <Separator className="my-4" />

        <div className="flex items-baseline justify-between">
          <span className="font-bold">Total</span>
          <span className="text-brand-strong dark:text-brand text-xl font-extrabold tabular-nums">
            {formatPrice(subtotal + delivery)}
          </span>
        </div>

        <Button asChild size="lg" className="mt-5 w-full">
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>

        <p className="text-muted-foreground mt-3 text-center text-xs">
          Cash on delivery, bKash, Nagad and card payments accepted.
        </p>
      </aside>
    </div>
  );
}
