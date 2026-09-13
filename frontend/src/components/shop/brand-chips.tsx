"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronUp, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Facets } from "@/lib/types";
import { useShopParams } from "@/hooks/use-shop-params";

const VISIBLE = 13;

/**
 * The chip row from the design: "All · Samsung · Honor · … · More brands (3) ▾"
 * with a searchable overflow panel.
 */
export function BrandChips({ brands }: { brands: Facets["brands"] }) {
  const { getList, toggleInList, set } = useShopParams();
  const selected = getList("brand");

  const [expanded, setExpanded] = React.useState(false);
  const [term, setTerm] = React.useState("");

  const visible = brands.slice(0, VISIBLE);
  const overflow = brands.slice(VISIBLE);

  const filteredOverflow = overflow.filter((b) =>
    b.name.toLowerCase().includes(term.trim().toLowerCase())
  );

  if (brands.length === 0) return null;

  return (
    <div className="bg-surface rounded-xl border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={selected.length === 0} onClick={() => set("brand", null)}>
          All
        </Chip>

        {visible.map((brand) => (
          <Chip
            key={brand.slug}
            active={selected.includes(brand.slug)}
            onClick={() => toggleInList("brand", brand.slug)}
          >
            {brand.name}
          </Chip>
        ))}

        {overflow.length > 0 && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 rounded-full border border-transparent bg-transparent px-3.5 py-2 text-sm font-medium transition-colors",
              expanded && "text-foreground"
            )}
          >
            More brands ({overflow.length})
            <ChevronUp
              className={cn(
                "size-3.5 transition-transform duration-200",
                !expanded && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && overflow.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-card mt-3 rounded-lg border p-3">
              <div className="relative mb-3 max-w-xs">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search brands..."
                  className="focus:ring-ring/40 focus:border-ring h-9 w-full rounded-md border bg-transparent pr-3 pl-9 text-sm outline-none focus:ring-[3px]"
                />
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {filteredOverflow.length === 0 ? (
                  <p className="text-muted-foreground py-1 text-sm">
                    No brand matches “{term}”.
                  </p>
                ) : (
                  filteredOverflow.map((brand) => (
                    <button
                      key={brand.slug}
                      type="button"
                      onClick={() => toggleInList("brand", brand.slug)}
                      className={cn(
                        "cursor-pointer text-sm transition-colors",
                        selected.includes(brand.slug)
                          ? "text-brand-strong dark:text-brand font-semibold"
                          : "hover:text-brand-strong dark:hover:text-brand"
                      )}
                    >
                      {brand.name}
                      <span className="text-muted-foreground ml-1 text-xs">
                        ({brand.count})
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({
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
        "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-invert text-invert-foreground shadow-sm"
          : "bg-card hover:bg-accent border shadow-xs"
      )}
    >
      {children}
    </button>
  );
}
