"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

/**
 * Picks the best picture available, in this order:
 *
 *   1. `product.images[0]` — whatever the database says
 *   2. `/products/<slug>.webp` — the generated HD art, by convention
 *   3. an inline SVG device mock in the brand's colour
 *
 * Step 2 matters: it means the images show up even if the database was seeded
 * before the artwork existed, and step 3 means a product with no file at all
 * still renders something instead of a broken image.
 */
export function ProductVisual({
  product,
  className,
  priority = false,
  sizes = "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px",
  showLabel = true,
}: {
  product: Pick<
    Product,
    "name" | "images" | "accent" | "categorySlug" | "brandName"
  > & { slug?: string };
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** The wordmark scales with the SVG, so hide it on large renders. */
  showLabel?: boolean;
}) {
  const src =
    product.images?.[0] ||
    (product.slug ? `/products/${product.slug}.webp` : "");

  /**
   * The bundled artwork is already a small, correctly sized WebP, so sending it
   * through /_next/image only adds a resize round-trip — on a cold page that
   * meant cards sat blank while two dozen images were re-encoded (and on Vercel
   * it burns image-optimisation quota for nothing). Real photos added later
   * still get optimised.
   */
  const isBundledArt = src.startsWith("/products/");

  const imgRef = React.useRef<HTMLImageElement>(null);
  const [failed, setFailed] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  // A different product in the same slot deserves a fresh attempt.
  const [lastSrc, setLastSrc] = React.useState(src);
  if (src !== lastSrc) {
    setLastSrc(src);
    setFailed(false);
    setLoaded(false);
  }

  /**
   * The picture very often finishes downloading BEFORE React hydrates this
   * card — the browser starts it straight from the server HTML. React then
   * attaches `onLoad` to an image that has already fired it, the event never
   * comes, and the old code left the <img> stuck at `opacity-0`: a grid of
   * blank cards that only filled in on the next re-render. Asking the DOM
   * whether it is already `complete` closes that hole.
   */
  React.useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  if (src && !failed) {
    return (
      <>
        {/* holds the space so a card is never a blank white box */}
        {!loaded && (
          <span
            aria-hidden
            className="bg-muted/60 absolute inset-0 animate-pulse rounded-lg"
          />
        )}
        <Image
          ref={imgRef}
          src={src}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={isBundledArt}
          // No opacity gate: the image paints the moment the browser has it,
          // with or without JavaScript. The skeleton above simply disappears.
          className={cn("object-contain", className)}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      </>
    );
  }

  return (
    <DeviceMock
      accent={product.accent || "#c9a227"}
      label={product.brandName}
      variant={variantFor(product.categorySlug)}
      showLabel={showLabel}
      className={className}
    />
  );
}

type Variant = "phone" | "feature" | "tablet" | "watch" | "buds" | "box";

function variantFor(categorySlug: string): Variant {
  switch (categorySlug) {
    case "featured-phone":
      return "feature";
    case "tablet":
      return "tablet";
    case "smart-watch":
      return "watch";
    case "earbuds":
      return "buds";
    case "accessories":
    case "gadgets":
      return "box";
    default:
      return "phone";
  }
}

function DeviceMock({
  accent,
  label,
  variant,
  showLabel,
  className,
}: {
  accent: string;
  label: string;
  variant: Variant;
  showLabel: boolean;
  className?: string;
}) {
  const id = `${variant}-${label.replace(/\W/g, "")}`;

  return (
    <svg
      viewBox="0 0 200 240"
      role="img"
      aria-label={`${label} product illustration`}
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id={`screen-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="55%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#111" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="50%" stopColor="#1d1d1d" />
          <stop offset="100%" stopColor="#111" />
        </linearGradient>
        <linearGradient id={`shine-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {variant === "phone" && (
        <g>
          <rect x="58" y="14" width="84" height="212" rx="16" fill={`url(#body-${id})`} />
          <rect x="63" y="19" width="74" height="202" rx="12" fill={`url(#screen-${id})`} />
          <rect x="63" y="19" width="74" height="202" rx="12" fill={`url(#shine-${id})`} />
          <rect x="88" y="24" width="24" height="5" rx="2.5" fill="#0d0d0d" opacity="0.75" />
          <circle cx="80" cy="44" r="9" fill="#0d0d0d" opacity="0.55" />
          <circle cx="80" cy="44" r="4" fill={accent} opacity="0.8" />
          <circle cx="102" cy="44" r="6" fill="#0d0d0d" opacity="0.4" />
        </g>
      )}

      {variant === "feature" && (
        <g>
          <rect x="68" y="26" width="64" height="188" rx="12" fill={`url(#body-${id})`} />
          <rect x="74" y="34" width="52" height="52" rx="5" fill={`url(#screen-${id})`} />
          <rect x="74" y="34" width="52" height="52" rx="5" fill={`url(#shine-${id})`} />
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={78 + col * 16}
                y={100 + row * 22}
                width="12"
                height="14"
                rx="3"
                fill={accent}
                opacity={0.25 + row * 0.08}
              />
            ))
          )}
        </g>
      )}

      {variant === "tablet" && (
        <g>
          <rect x="34" y="30" width="132" height="180" rx="14" fill={`url(#body-${id})`} />
          <rect x="41" y="37" width="118" height="166" rx="9" fill={`url(#screen-${id})`} />
          <rect x="41" y="37" width="118" height="166" rx="9" fill={`url(#shine-${id})`} />
          <circle cx="100" cy="44" r="2.5" fill="#0d0d0d" opacity="0.6" />
        </g>
      )}

      {variant === "watch" && (
        <g>
          <rect x="82" y="16" width="36" height="52" rx="12" fill="#2a2a2a" />
          <rect x="82" y="172" width="36" height="52" rx="12" fill="#2a2a2a" />
          <rect x="58" y="62" width="84" height="116" rx="26" fill={`url(#body-${id})`} />
          <rect x="66" y="70" width="68" height="100" rx="20" fill={`url(#screen-${id})`} />
          <rect x="66" y="70" width="68" height="100" rx="20" fill={`url(#shine-${id})`} />
          <rect x="142" y="98" width="6" height="20" rx="3" fill={accent} />
        </g>
      )}

      {variant === "buds" && (
        <g>
          <rect x="46" y="86" width="108" height="76" rx="22" fill={`url(#body-${id})`} />
          <rect x="46" y="86" width="108" height="76" rx="22" fill={`url(#shine-${id})`} />
          <circle cx="76" cy="118" r="19" fill={`url(#screen-${id})`} />
          <circle cx="124" cy="118" r="19" fill={`url(#screen-${id})`} />
          <circle cx="76" cy="118" r="7" fill="#0d0d0d" opacity="0.6" />
          <circle cx="124" cy="118" r="7" fill="#0d0d0d" opacity="0.6" />
          <rect x="92" y="150" width="16" height="4" rx="2" fill={accent} opacity="0.8" />
        </g>
      )}

      {variant === "box" && (
        <g>
          <path d="M100 42 L162 74 L100 106 L38 74 Z" fill={accent} opacity="0.85" />
          <path d="M38 74 L100 106 L100 186 L38 154 Z" fill="#1d1d1d" />
          <path d="M162 74 L100 106 L100 186 L162 154 Z" fill="#2c2c2c" />
          <path d="M38 74 L100 106 L100 186 L38 154 Z" fill={`url(#shine-${id})`} />
        </g>
      )}

      {showLabel && (
        <text
          x="100"
          y="234"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          letterSpacing="1.5"
          fill="currentColor"
          opacity="0.35"
        >
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  );
}
