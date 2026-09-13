"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";

export function ProductCarousel({
  products,
  autoplay = false,
}: {
  products: Product[];
  autoplay?: boolean;
}) {
  const [emblaRef, embla] = useEmblaCarousel(
    { align: "start", loop: products.length > 4, containScroll: "trimSnaps" },
    autoplay ? [Autoplay({ delay: 4200, stopOnInteraction: true })] : []
  );

  // Subscribing to embla directly keeps the arrows in sync without an effect
  // that writes state on every render pass.
  const subscribe = React.useCallback(
    (notify: () => void) => {
      if (!embla) return () => {};
      embla.on("select", notify).on("reInit", notify).on("settle", notify);
      return () => {
        embla.off("select", notify).off("reInit", notify).off("settle", notify);
      };
    },
    [embla]
  );

  const canPrev = React.useSyncExternalStore(
    subscribe,
    () => embla?.canScrollPrev() ?? false,
    () => false
  );
  const canNext = React.useSyncExternalStore(
    subscribe,
    () => embla?.canScrollNext() ?? false,
    () => false
  );

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="-ml-3 flex sm:-ml-4">
          {products.map((product, index) => (
            <div
              key={product.slug}
              className="min-w-0 shrink-0 grow-0 basis-1/2 pl-3 sm:basis-1/3 sm:pl-4 lg:basis-1/4 xl:basis-1/5"
            >
              <ProductCard product={product} priority={index < 3} className="h-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous products"
          disabled={!canPrev}
          onClick={() => embla?.scrollPrev()}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next products"
          disabled={!canNext}
          onClick={() => embla?.scrollNext()}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
