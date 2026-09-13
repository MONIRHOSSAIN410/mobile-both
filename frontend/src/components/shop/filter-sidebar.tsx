"use client";

import * as React from "react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCompact, AVAILABILITY_LABEL } from "@/lib/format";
import type { Facets } from "@/lib/types";
import { useShopParams } from "@/hooks/use-shop-params";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const NETWORK_ORDER = ["5G", "4G", "3G", "2G"] as const;

export function FilterSidebar({
  facets,
  className,
}: {
  facets: Facets;
  className?: string;
}) {
  const { get, getList, set, toggleInList, resetAll, push } = useShopParams();

  const minParam = get("minPrice");
  const maxParam = get("maxPrice");

  // The two price boxes are editable drafts of the URL values. Adjusting them
  // during render (React's documented pattern) keeps them in sync when the URL
  // changes from elsewhere — a preset chip, the back button, "reset all".
  const [min, setMin] = React.useState(minParam);
  const [max, setMax] = React.useState(maxParam);
  const [syncedFrom, setSyncedFrom] = React.useState({ minParam, maxParam });

  if (syncedFrom.minParam !== minParam || syncedFrom.maxParam !== maxParam) {
    setSyncedFrom({ minParam, maxParam });
    setMin(minParam);
    setMax(maxParam);
  }

  const selectedBrands = getList("brand");
  const availability = get("availability") || "all";
  const network = get("network") || "all";

  const activeCount =
    selectedBrands.length +
    (minParam || maxParam ? 1 : 0) +
    (availability !== "all" ? 1 : 0) +
    (network !== "all" ? 1 : 0);

  const applyPrice = (e?: React.FormEvent) => {
    e?.preventDefault();
    push((params) => {
      if (min) params.set("minPrice", min);
      else params.delete("minPrice");
      if (max) params.set("maxPrice", max);
      else params.delete("maxPrice");
    });
  };

  const applyBucket = (bucket: Facets["price"]["buckets"][number]) => {
    push((params) => {
      params.set("minPrice", String(bucket.min));
      if (bucket.max) params.set("maxPrice", String(bucket.max));
      else params.delete("maxPrice");
    });
  };

  const bucketActive = (bucket: Facets["price"]["buckets"][number]) =>
    minParam === String(bucket.min) &&
    (bucket.max ? maxParam === String(bucket.max) : !maxParam);

  return (
    <aside className={cn("bg-card overflow-hidden rounded-xl border", className)}>
      <div className="bg-chrome text-chrome-foreground flex items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-bold">
          <SlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="bg-brand text-brand-foreground rounded px-1.5 py-0.5 text-[11px] font-bold">
              {activeCount}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={resetAll}
          className="text-chrome-muted hover:text-brand cursor-pointer text-xs font-semibold transition-colors"
        >
          Reset all
        </button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["price", "availability", "brand", "network"]}
        className="px-4"
      >
        {/* ------------------------------ price ------------------------------ */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-xs tracking-[0.1em] uppercase">
            Price
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <form onSubmit={applyPrice} className="flex items-center gap-2">
              <input
                inputMode="numeric"
                value={min}
                onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
                placeholder={`৳ ${formatCompact(facets.price.min || 0)} Min`}
                aria-label="Minimum price"
                className="focus:ring-ring/40 focus:border-ring h-9 w-full min-w-0 rounded-md border bg-transparent px-2.5 text-sm outline-none focus:ring-[3px]"
              />
              <span className="text-muted-foreground text-xs">–</span>
              <input
                inputMode="numeric"
                value={max}
                onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
                placeholder={`৳ ${formatCompact(facets.price.max || 0)} Max`}
                aria-label="Maximum price"
                className="focus:ring-ring/40 focus:border-ring h-9 w-full min-w-0 rounded-md border bg-transparent px-2.5 text-sm outline-none focus:ring-[3px]"
              />
              <Button type="submit" size="icon-sm" aria-label="Apply price range">
                <ArrowRight />
              </Button>
            </form>

            <div className="flex flex-wrap gap-1.5">
              {facets.price.buckets.map((bucket) => (
                <button
                  key={bucket.key}
                  type="button"
                  onClick={() => applyBucket(bucket)}
                  className={cn(
                    "cursor-pointer rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                    bucketActive(bucket)
                      ? "border-brand bg-brand/15 text-brand-strong dark:text-brand"
                      : "hover:border-brand/60 hover:text-brand-strong dark:hover:text-brand"
                  )}
                >
                  {bucket.label}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --------------------------- availability --------------------------- */}
        <AccordionItem value="availability">
          <AccordionTrigger className="text-xs tracking-[0.1em] uppercase">
            Availability
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={availability}
              onValueChange={(value) =>
                set("availability", value === "all" ? null : value)
              }
            >
              <FilterRadio value="all" label="All Products" />
              {["in-stock", "pre-order", "out-of-stock"].map((value) => {
                const count =
                  facets.availability.find((a) => a.value === value)?.count ?? 0;
                if (count === 0 && availability !== value) return null;
                return (
                  <FilterRadio
                    key={value}
                    value={value}
                    label={AVAILABILITY_LABEL[value]}
                    count={count}
                  />
                );
              })}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* ------------------------------ brand ------------------------------ */}
        <AccordionItem value="brand">
          <AccordionTrigger className="text-xs tracking-[0.1em] uppercase">
            Brand
          </AccordionTrigger>
          <AccordionContent>
            <ul className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
              {facets.brands.map((brand) => (
                <li key={brand.slug} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`brand-${brand.slug}`}
                    checked={selectedBrands.includes(brand.slug)}
                    onCheckedChange={() => toggleInList("brand", brand.slug)}
                  />
                  <Label
                    htmlFor={`brand-${brand.slug}`}
                    className="flex-1 cursor-pointer justify-between text-sm font-normal"
                  >
                    {brand.name}
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {brand.count}
                    </span>
                  </Label>
                </li>
              ))}
              {facets.brands.length === 0 && (
                <li className="text-muted-foreground text-sm">
                  No brands match these filters.
                </li>
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* ----------------------------- network ----------------------------- */}
        <AccordionItem value="network">
          <AccordionTrigger className="text-xs tracking-[0.1em] uppercase">
            Network
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-1.5">
              <NetworkPill
                active={network === "all"}
                onClick={() => set("network", null)}
              >
                All
              </NetworkPill>
              {NETWORK_ORDER.map((value) => {
                const count =
                  facets.networks.find((n) => n.value === value)?.count ?? 0;
                if (count === 0) return null;
                return (
                  <NetworkPill
                    key={value}
                    active={network === value}
                    onClick={() => set("network", value)}
                  >
                    {value}
                  </NetworkPill>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="p-4 pt-2">
        <Button variant="outline" className="w-full" onClick={resetAll}>
          Clear filters
        </Button>
      </div>
    </aside>
  );
}

function FilterRadio({
  value,
  label,
  count,
}: {
  value: string;
  label: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <RadioGroupItem value={value} id={`availability-${value}`} />
      <Label
        htmlFor={`availability-${value}`}
        className="flex-1 cursor-pointer justify-between text-sm font-normal"
      >
        {label}
        {count !== undefined && (
          <span className="text-muted-foreground text-xs tabular-nums">
            {count}
          </span>
        )}
      </Label>
    </div>
  );
}

function NetworkPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "size-10 cursor-pointer rounded-full border text-xs font-bold transition-all",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "hover:border-brand hover:text-brand-strong dark:hover:text-brand"
      )}
    >
      {children}
    </button>
  );
}
