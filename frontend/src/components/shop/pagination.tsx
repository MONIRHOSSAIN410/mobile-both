"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useShopParams } from "@/hooks/use-shop-params";
import { Button } from "@/components/ui/button";

/** Windowed page list: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(current: number, total: number) {
  const pages = new Set<number>([1, total, current]);
  for (let d = 1; d <= 2; d += 1) {
    if (current - d > 1) pages.add(current - d);
    if (current + d < total) pages.add(current + d);
  }
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) out.push("gap");
    out.push(page);
  });
  return out;
}

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const { setPage } = useShopParams();
  if (pages <= 1) return null;

  const goto = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5 pt-8">
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => goto(page - 1)}
      >
        <ChevronLeft />
      </Button>

      {pageWindow(page, pages).map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            className="text-muted-foreground px-1 text-sm select-none"
          >
            …
          </span>
        ) : (
          <Button
            key={entry}
            variant={entry === page ? "default" : "outline"}
            size="icon"
            aria-current={entry === page ? "page" : undefined}
            className={cn("tabular-nums")}
            onClick={() => goto(entry)}
          >
            {entry}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        aria-label="Next page"
        disabled={page >= pages}
        onClick={() => goto(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
