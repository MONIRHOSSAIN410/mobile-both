"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type Suggestion = Pick<
  Product,
  "name" | "slug" | "price" | "images" | "accent" | "brandName" | "categorySlug"
>;

export function SearchBar({
  className,
  id = "site-search",
}: {
  className?: string;
  id?: string;
}) {
  const router = useRouter();
  const [term, setTerm] = React.useState("");
  const [items, setItems] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement>(null);

  // Typing owns the "clear / start loading" transitions so the effect below
  // never writes state synchronously on mount.
  const onChange = (value: string) => {
    setTerm(value);
    const q = value.trim();
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      setOpen(false);
    } else {
      setLoading(true);
    }
  };

  // debounce + abort so fast typing never races
  React.useEffect(() => {
    const q = term.trim();
    if (q.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_URL}/products/suggest?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        const json = await res.json();
        setItems(json.data ?? []);
        setOpen(true);
      } catch {
        // aborted or offline — leave the last results in place
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [term]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <form onSubmit={submit} role="search">
        <label htmlFor={id} className="sr-only">
          Search products
        </label>
        <input
          id={id}
          value={term}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => items.length && setOpen(true)}
          placeholder="Search products..."
          autoComplete="off"
          className="focus:ring-brand/60 h-11 w-full rounded-md border border-transparent bg-white pr-24 pl-4 text-sm text-neutral-900 shadow-sm outline-none placeholder:text-neutral-500 focus:ring-2 dark:bg-neutral-100"
        />

        {term && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("")}
            className="absolute top-1/2 right-14 -translate-y-1/2 rounded p-1 text-neutral-500 hover:text-neutral-900"
          >
            <X className="size-4" />
          </button>
        )}

        <button
          type="submit"
          aria-label="Search"
          className="bg-brand hover:bg-brand-strong absolute top-1 right-1 bottom-1 flex w-12 items-center justify-center rounded-[5px] text-brand-foreground transition-colors"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
        </button>
      </form>

      {open && items.length > 0 && (
        <div className="bg-popover animate-in fade-in-0 slide-in-from-top-1 absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border shadow-xl">
          <ul className="max-h-[22rem] overflow-y-auto py-1">
            {items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/products/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="hover:bg-accent flex items-center gap-3 px-3 py-2 text-sm"
                >
                  <span
                    aria-hidden
                    className="size-9 shrink-0 rounded-md"
                    style={{
                      background: `linear-gradient(135deg, ${item.accent}, transparent 140%)`,
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.brandName}
                    </span>
                  </span>
                  <span className="text-brand-strong dark:text-brand shrink-0 text-sm font-semibold">
                    {formatPrice(item.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={submit}
            className="bg-muted hover:bg-accent w-full border-t px-3 py-2 text-left text-xs font-semibold"
          >
            See all results for “{term.trim()}”
          </button>
        </div>
      )}
    </div>
  );
}
