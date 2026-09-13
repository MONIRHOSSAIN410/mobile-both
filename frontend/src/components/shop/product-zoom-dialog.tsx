"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Plus, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductVisual } from "@/components/shop/product-visual";

const MIN = 1;
const MAX = 4;

/**
 * Click-to-zoom viewer: scroll or use the buttons to scale, then drag to pan.
 * Pointer events keep mouse, pen and touch on the same code path.
 */
export function ProductZoomDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [scale, setScale] = React.useState(1.6);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const dragging = React.useRef<{ x: number; y: number } | null>(null);

  const reset = React.useCallback(() => {
    setScale(1.6);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Reset zoom whenever the dialog opens, adjusted during render rather than
  // in an effect so the first painted frame is already at 160%.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setScale(1.6);
      setOffset({ x: 0, y: 0 });
    }
  }

  const clampZoom = (next: number) => Math.min(MAX, Math.max(MIN, next));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="pr-8 text-base">{product.name}</DialogTitle>
          <DialogDescription>
            {product.brandName} · {formatPrice(product.price)} — scroll or drag to
            inspect
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "bg-surface relative aspect-[4/3] w-full touch-none overflow-hidden rounded-lg border select-none",
            scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
          )}
          onWheel={(e) => {
            setScale((s) => clampZoom(s + (e.deltaY > 0 ? -0.15 : 0.15)));
          }}
          onPointerDown={(e) => {
            // Capturing the pointer here would steal the click from the zoom
            // controls layered on top, so let those handle their own events.
            if ((e.target as HTMLElement).closest("button")) return;
            dragging.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            const limit = 90 * (scale - 1);
            setOffset({
              x: Math.max(-limit, Math.min(limit, e.clientX - dragging.current.x)),
              y: Math.max(-limit, Math.min(limit, e.clientY - dragging.current.y)),
            });
          }}
          onPointerUp={() => {
            dragging.current = null;
          }}
          onPointerCancel={() => {
            dragging.current = null;
          }}
          onDoubleClick={reset}
        >
          <div
            className="absolute inset-0 p-6 transition-transform duration-100 ease-out"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            }}
          >
            <ProductVisual product={product} showLabel={false} sizes="600px" />
          </div>

          <div className="bg-background/85 absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border p-1 shadow-sm backdrop-blur">
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full"
              aria-label="Zoom out"
              onClick={() => setScale((s) => clampZoom(s - 0.25))}
            >
              <Minus />
            </Button>
            <span className="w-12 text-center text-xs font-semibold tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full"
              aria-label="Zoom in"
              onClick={() => setScale((s) => clampZoom(s + 0.25))}
            >
              <Plus />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full"
              aria-label="Reset zoom"
              onClick={reset}
            >
              <RotateCcw />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {product.shortDescription}
          </p>
          <Button asChild className="shrink-0">
            <Link href={`/products/${product.slug}`}>View details</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
