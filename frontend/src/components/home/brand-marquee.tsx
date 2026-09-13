import Link from "next/link";

import type { Brand } from "@/lib/types";

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  // duplicated once so the CSS translate(-50%) loop is seamless
  const loop = [...brands, ...brands];

  return (
    <section className="bg-surface border-y py-6">
      <div
        className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        aria-label="Brands we carry"
      >
        <div className="animate-marquee flex w-max gap-3 group-hover:[animation-play-state:paused]">
          {loop.map((brand, index) => (
            <Link
              key={`${brand.slug}-${index}`}
              href={`/products?brand=${brand.slug}`}
              aria-hidden={index >= brands.length}
              tabIndex={index >= brands.length ? -1 : 0}
              className="bg-card hover:border-brand flex items-center gap-2.5 rounded-lg border px-5 py-3 transition-colors"
            >
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ backgroundColor: brand.accent }}
              />
              <span className="text-sm font-semibold whitespace-nowrap">
                {brand.name}
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {brand.productCount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
