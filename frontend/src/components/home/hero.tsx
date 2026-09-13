import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductVisual } from "@/components/shop/product-visual";
import { ParallaxLayer } from "@/components/motion/parallax";

/**
 * This is now a server component.
 *
 * The old version was `"use client"` and drove five `motion` animations —
 * including two 34rem circles with a 110px blur looping forever, which keeps
 * the compositor busy for as long as the tab is open and makes the whole site
 * feel like it is chugging. The blobs are static now, the float is a plain CSS
 * keyframe, and the entrances use the same CSS `.reveal` as everything else,
 * so the first paint no longer waits for JavaScript.
 */
export function Hero({ product }: { product?: Product }) {
  return (
    <section className="bg-chrome relative isolate overflow-hidden">
      {/* gradient blobs — painted once, never animated */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-brand/25 absolute -top-40 -left-32 size-[34rem] rounded-full blur-[110px]" />
        <div className="bg-brand-soft/20 absolute -right-24 -bottom-40 size-[30rem] rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="reveal space-y-6">
          <Badge variant="soft" className="gap-1.5 px-3 py-1 text-xs">
            <Sparkles className="size-3.5" />
            Official warranty · 0% EMI · Same-day Dhaka delivery
          </Badge>

          <h1 className="text-chrome-foreground text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            The phone you want,
            <br />
            <span className="brand-sheen bg-clip-text text-transparent">
              at the price you planned.
            </span>
          </h1>

          <p className="text-chrome-muted max-w-xl text-base leading-relaxed">
            Every smartphone, tablet, watch and gadget we sell is 100% original
            with an official Bangladesh warranty — filter by brand, budget and
            network, then check out in under a minute.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="xl">
              <Link href="/products">
                Shop all products <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="text-chrome-foreground border-chrome-border bg-transparent hover:bg-chrome-border/50 hover:text-chrome-foreground"
            >
              <Link href="/instalment">Buy on instalment</Link>
            </Button>
          </div>

          <ul className="text-chrome-muted flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
            <li className="flex items-center gap-2">
              <ShieldCheck className="text-brand size-4" /> Genuine, sealed stock
            </li>
            <li className="flex items-center gap-2">
              <Truck className="text-brand size-4" /> Free delivery over ৳ 20,000
            </li>
          </ul>
        </div>

        {/* ------------------------- featured device ------------------------- */}
        <div className="relative flex justify-center lg:justify-end">
          <ParallaxLayer speed={38} className="relative w-full max-w-sm">
            <div className="reveal relative" style={{ "--reveal-delay": "0.1s" } as CSSProperties}>
              <div className="hero-float relative mx-auto aspect-square w-full max-w-[22rem]">
                {product ? (
                  <ProductVisual
                    product={product}
                    priority
                    showLabel={false}
                    sizes="(max-width: 1024px) 70vw, 340px"
                  />
                ) : (
                  <div className="bg-chrome-border/40 size-full animate-pulse rounded-3xl" />
                )}
              </div>

              {product && (
                <div
                  className="reveal glass absolute right-0 bottom-2 left-0 mx-auto w-[90%] rounded-xl border p-3.5 shadow-xl"
                  style={{ "--reveal-delay": "0.35s" } as CSSProperties}
                >
                  <p className="text-muted-foreground text-[11px] font-bold tracking-[0.12em] uppercase">
                    {product.brandName}
                  </p>
                  <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-brand-strong dark:text-brand text-lg font-bold">
                      {formatPrice(product.price)}
                    </span>
                    <Button asChild size="sm">
                      <Link href={`/products/${product.slug}`}>View</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ParallaxLayer>
        </div>
      </div>
    </section>
  );
}
