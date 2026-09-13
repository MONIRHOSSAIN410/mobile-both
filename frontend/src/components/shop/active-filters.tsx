"use client";

import { X } from "lucide-react";

import { formatPrice, AVAILABILITY_LABEL } from "@/lib/format";
import type { Facets } from "@/lib/types";
import { useShopParams } from "@/hooks/use-shop-params";

export function ActiveFilters({ facets }: { facets: Facets }) {
  const { get, getList, set, toggleInList, resetAll, push } = useShopParams();

  const brands = getList("brand");
  const availability = get("availability");
  const network = get("network");
  const minPrice = get("minPrice");
  const maxPrice = get("maxPrice");
  const query = get("q");

  const brandName = (slug: string) =>
    facets.brands.find((b) => b.slug === slug)?.name ?? slug;

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (query) {
    chips.push({
      key: "q",
      label: `Search: “${query}”`,
      onRemove: () => set("q", null),
    });
  }
  for (const slug of brands) {
    chips.push({
      key: `brand-${slug}`,
      label: brandName(slug),
      onRemove: () => toggleInList("brand", slug),
    });
  }
  if (availability) {
    chips.push({
      key: "availability",
      label: AVAILABILITY_LABEL[availability] ?? availability,
      onRemove: () => set("availability", null),
    });
  }
  if (network) {
    chips.push({
      key: "network",
      label: `${network} network`,
      onRemove: () => set("network", null),
    });
  }
  if (minPrice || maxPrice) {
    chips.push({
      key: "price",
      label: `${minPrice ? formatPrice(Number(minPrice)) : "Any"} – ${
        maxPrice ? formatPrice(Number(maxPrice)) : "Any"
      }`,
      onRemove: () =>
        push((params) => {
          params.delete("minPrice");
          params.delete("maxPrice");
        }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        Active:
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="bg-brand/15 text-brand-strong dark:text-brand hover:bg-brand/25 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
        >
          {chip.label}
          <X className="size-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={resetAll}
        className="text-muted-foreground hover:text-destructive cursor-pointer text-xs font-semibold underline underline-offset-2"
      >
        Clear all
      </button>
    </div>
  );
}
