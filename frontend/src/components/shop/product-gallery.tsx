"use client";

import * as React from "react";
import { ScanSearch } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductVisual } from "@/components/shop/product-visual";
import { ProductZoomDialog } from "@/components/shop/product-zoom-dialog";

/**
 * Hover the frame and the image tracks your pointer at 2× — the same
 * behaviour shoppers expect from a product photo on a desktop store.
 * Tap the magnifier for the full pan-and-zoom dialog.
 */
export function ProductGallery({ product }: { product: Product }) {
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const [lens, setLens] = React.useState<{ x: number; y: number } | null>(null);

  const soldOut = product.availability === "out-of-stock";

  return (
    <>
      <div className="space-y-3">
        <div
          className={cn(
            "bg-surface group relative aspect-square overflow-hidden rounded-xl border",
            !soldOut && "cursor-zoom-in"
          )}
          onMouseMove={(e) => {
            if (soldOut) return;
            const rect = e.currentTarget.getBoundingClientRect();
            setLens({
              x: ((e.clientX - rect.left) / rect.width) * 100,
              y: ((e.clientY - rect.top) / rect.height) * 100,
            });
          }}
          onMouseLeave={() => setLens(null)}
          onClick={() => setZoomOpen(true)}
        >
          <div
            className="absolute inset-0 p-6 transition-transform duration-200 ease-out"
            style={{
              transform: lens ? "scale(2)" : "scale(1)",
              transformOrigin: lens ? `${lens.x}% ${lens.y}%` : "center",
            }}
          >
            <ProductVisual
              product={product}
              priority
              showLabel={false}
              sizes="(max-width: 1024px) 90vw, 520px"
            />
          </div>

          <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1.5">
            {soldOut && <Badge variant="destructive">Out of Stock</Badge>}
            {product.availability === "pre-order" && (
              <Badge variant="soft">Pre-Order</Badge>
            )}
            {product.discountPercent > 0 && !soldOut && (
              <Badge variant="destructive">-{product.discountPercent}% OFF</Badge>
            )}
            {product.isNewArrival && <Badge variant="success">New</Badge>}
          </div>

          <Button
            size="icon"
            variant="secondary"
            className="absolute right-3 bottom-3 shadow-sm"
            aria-label="Open zoom viewer"
            onClick={(e) => {
              e.stopPropagation();
              setZoomOpen(true);
            }}
          >
            <ScanSearch />
          </Button>

          <span className="text-muted-foreground pointer-events-none absolute bottom-3 left-3 text-[11px] opacity-0 transition-opacity group-hover:opacity-100 max-lg:hidden">
            Hover to magnify · click for full zoom
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label={`Preview ${index + 1}`}
              className="bg-surface hover:border-brand aspect-square cursor-pointer overflow-hidden rounded-lg border p-2 transition-colors"
            >
              <div
                className="h-full w-full"
                style={{ transform: `rotate(${index * 4 - 6}deg)` }}
              >
                <ProductVisual product={product} sizes="120px" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <ProductZoomDialog
        product={product}
        open={zoomOpen}
        onOpenChange={setZoomOpen}
      />
    </>
  );
}
