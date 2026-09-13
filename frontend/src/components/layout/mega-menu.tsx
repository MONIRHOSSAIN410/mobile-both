"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Brand, Category } from "@/lib/types";
import { CategoryIcon } from "@/components/layout/category-icon";

/**
 * Hover/focus mega menu. Each category opens a panel of its brands, matching
 * the "PHONES ▾ → Samsung Galaxy / Xiaomi / Realme …" dropdown in the design.
 */
export function MegaMenu({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const [openSlug, setOpenSlug] = React.useState<string | null>(null);
  const openTimer = React.useRef<number | undefined>(undefined);
  const closeTimer = React.useRef<number | undefined>(undefined);

  const brandByName = React.useMemo(
    () => Object.fromEntries(brands.map((b) => [b.slug, b])),
    [brands]
  );

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };

  /**
   * Every open waits a beat, so sweeping the cursor across the bar on the way
   * somewhere else no longer pops open each panel it passes. Switching to a
   * sibling while a panel is already up waits half as long — the intent is
   * clearer by then, and the menu still feels responsive.
   */
  const OPEN_DELAY = 140;
  const SWITCH_DELAY = 70;

  const open = (slug: string) => {
    clearTimers();
    openTimer.current = window.setTimeout(
      () => setOpenSlug(slug),
      openSlug ? SWITCH_DELAY : OPEN_DELAY
    );
  };

  const openNow = (slug: string) => {
    clearTimers();
    setOpenSlug(slug);
  };

  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpenSlug(null), 180);
  };

  React.useEffect(() => clearTimers, []);

  return (
    <nav
      className="hidden h-full items-stretch lg:flex"
      onMouseLeave={scheduleClose}
    >
      {categories.map((category) => {
        const menuBrands = (category.menuBrands ?? [])
          .map((slug) => brandByName[slug])
          .filter(Boolean);
        const isOpen = openSlug === category.slug;

        return (
          <div
            key={category.slug}
            className="relative flex items-stretch"
            onMouseEnter={() => open(category.slug)}
          >
            <Link
              href={`/products?category=${category.slug}`}
              onFocus={() => openNow(category.slug)}
              className={cn(
                "text-chrome-foreground flex items-center gap-1.5 border-b-2 border-transparent px-3 text-[13px] font-semibold tracking-wide whitespace-nowrap uppercase transition-colors xl:px-4",
                "hover:text-brand",
                isOpen && "border-brand text-brand"
              )}
            >
              <CategoryIcon name={category.icon} className="size-3.5" />
              {category.name}
              {menuBrands.length > 0 && (
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              )}
            </Link>

            <AnimatePresence>
              {isOpen && menuBrands.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="bg-popover absolute top-full left-0 z-50 w-60 overflow-hidden rounded-b-lg border border-t-0 shadow-xl"
                >
                  <ul className="py-2">
                    {menuBrands.map((brand) => (
                      <li key={brand.slug}>
                        <Link
                          href={`/products?category=${category.slug}&brand=${brand.slug}`}
                          className="hover:bg-accent hover:text-brand-strong dark:hover:text-brand flex items-center justify-between gap-2 px-4 py-2 text-sm transition-colors"
                        >
                          {brand.name}
                          {brand.productCount > 0 && (
                            <span className="text-muted-foreground text-xs tabular-nums">
                              {brand.productCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="bg-muted hover:bg-accent block border-t px-4 py-2 text-xs font-semibold"
                  >
                    View all {category.name} →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
