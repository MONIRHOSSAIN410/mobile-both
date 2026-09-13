import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PackageX, SlidersHorizontal } from "lucide-react";

import { getCategories, getProducts } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductGrid } from "@/components/shop/product-grid";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { BrandChips } from "@/components/shop/brand-chips";
import { SortSelect } from "@/components/shop/sort-select";
import { Pagination } from "@/components/shop/pagination";
import { ActiveFilters } from "@/components/shop/active-filters";
import { ApiOffline } from "@/components/api-offline";
import { DatabaseIcon } from "lucide-react";

export const revalidate = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = first(params.category);
  const query = first(params.q);

  if (query) return { title: `Search results for “${query}”` };
  if (category) {
    const categories = await getCategories();
    const match = categories.find((c) => c.slug === category);
    if (match) {
      return {
        title: match.name,
        description: match.description,
      };
    }
  }
  return { title: "All products" };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const query = {
    category: first(params.category),
    brand: first(params.brand),
    network: first(params.network),
    availability: first(params.availability),
    minPrice: first(params.minPrice),
    maxPrice: first(params.maxPrice),
    featured: first(params.featured),
    instalment: first(params.instalment),
    sort: first(params.sort),
    page: first(params.page),
    q: first(params.q),
    limit: "24",
  };

  const [{ data, meta, facets, ok }, categories] = await Promise.all([
    getProducts(query),
    getCategories(),
  ]);

  // Nothing narrowed down, and still nothing came back → the catalogue itself
  // is empty, which is a seeding problem rather than a filtering one.
  const hasFilters = Boolean(
    query.category ||
      query.brand ||
      query.network ||
      query.availability ||
      query.minPrice ||
      query.maxPrice ||
      query.featured ||
      query.instalment ||
      query.q
  );
  const catalogueEmpty = ok && !hasFilters && meta.total === 0;

  const category = categories.find((c) => c.slug === query.category);
  const heading = query.q
    ? `Search: “${query.q}”`
    : (category?.name ?? "All Products");

  return (
    <div className="container-page py-6">
      <Breadcrumbs category={category} query={query.q} />

      <div className="mt-4 mb-5">
        <BrandChips brands={facets.brands} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[17rem_1fr]">
        {/* --------------------------- sidebar --------------------------- */}
        <Suspense fallback={null}>
          <FilterSidebar
            facets={facets}
            className="sticky top-32 hidden h-fit lg:block"
          />
        </Suspense>

        {/* ---------------------------- results ---------------------------- */}
        <div className="min-w-0">
          <div className="bg-card mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
            <div>
              <h1 className="text-base font-bold">
                {heading}
                {meta.total > 0 && (
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    — Showing {meta.from}-{meta.to} of {meta.total} products
                  </span>
                )}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[20rem] overflow-y-auto p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <Suspense fallback={null}>
                    <FilterSidebar facets={facets} className="rounded-none border-0" />
                  </Suspense>
                </SheetContent>
              </Sheet>

              <Suspense fallback={null}>
                <SortSelect />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={null}>
            <div className="mb-4">
              <ActiveFilters facets={facets} />
            </div>
          </Suspense>

          {!ok ? (
            <ApiOffline />
          ) : catalogueEmpty ? (
            <DatabaseEmpty />
          ) : data.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <ProductGrid products={data} />
              <Suspense fallback={null}>
                <Pagination page={meta.page} pages={meta.pages} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Breadcrumbs({
  category,
  query,
}: {
  category?: Category;
  query?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-muted-foreground text-xs">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-brand-strong dark:hover:text-brand">
            Home
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link
            href="/products"
            className="hover:text-brand-strong dark:hover:text-brand"
          >
            Products
          </Link>
        </li>
        {(category || query) && (
          <>
            <li aria-hidden>/</li>
            <li className="text-foreground font-medium">
              {category?.name ?? `“${query}”`}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

function DatabaseEmpty() {
  return (
    <div className="border-warning/50 bg-warning/10 flex flex-col items-start gap-3 rounded-xl border p-6">
      <span className="flex items-center gap-2 font-bold">
        <DatabaseIcon className="text-warning size-5" />
        Your database has no products yet
      </span>
      <p className="text-muted-foreground text-sm">
        The API answered, so the backend is running — it just has nothing to
        serve. Load the demo catalogue:
      </p>
      <pre className="bg-muted w-full overflow-x-auto rounded-md p-3 text-xs">
        <code>{"cd backend\nnpm run seed"}</code>
      </pre>
      <p className="text-muted-foreground text-sm">
        That inserts 87 products, 23 brands and 7 categories. Refresh this page
        afterwards.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-card flex flex-col items-center gap-3 rounded-xl border py-20 text-center">
      <PackageX className="text-muted-foreground size-10" />
      <h2 className="text-lg font-bold">No products match these filters</h2>
      <p className="text-muted-foreground max-w-sm text-sm">
        Try widening the price range, clearing a brand, or switching the network
        filter back to All.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/products">Reset filters</Link>
      </Button>
    </div>
  );
}
