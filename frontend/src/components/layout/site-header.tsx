import Link from "next/link";
import { Clock3 } from "lucide-react";

import { getBrands, getCategories } from "@/lib/api";
import { fallbackCategories } from "@/lib/site";
import type { Category } from "@/lib/types";
import { TopBar } from "@/components/layout/top-bar";
import { Logo } from "@/components/layout/logo";
import { SearchBar } from "@/components/layout/search-bar";
import { CategoryDrawer } from "@/components/layout/category-drawer";
import { MegaMenu } from "@/components/layout/mega-menu";
import { CartButton } from "@/components/layout/cart-button";
import { AccountMenu } from "@/components/layout/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { StickyHeaderShell } from "@/components/layout/sticky-header-shell";

export async function SiteHeader() {
  const [apiCategories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  const categories: Category[] =
    apiCategories.length > 0
      ? apiCategories
      : (fallbackCategories as unknown as Category[]);

  return (
    <header>
      {/* Scrolls away on its own — deliberately outside the sticky element so
          the sticky height never changes. */}
      <TopBar />

      <StickyHeaderShell>
        {/* ---------------------------- main row ---------------------------- */}
        <div className="bg-chrome">
          <div className="container-page flex h-[68px] items-center gap-3 sm:gap-4">
            <Logo />

            {/* on phones the search gets its own row, so nothing is squeezed */}
            <SearchBar className="mx-auto hidden max-w-2xl flex-1 sm:block" />

            <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
              <ThemeToggle />

              <AccountMenu />

              <Link
                href="/products?availability=pre-order"
                className="border-chrome-border text-chrome-foreground hover:border-brand hover:text-brand hidden h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors md:flex"
              >
                <Clock3 className="size-4" />
                PRE-ORDER
              </Link>

              <CartButton />
            </div>
          </div>

          <div className="container-page pb-3 sm:hidden">
            <SearchBar id="site-search-mobile" />
          </div>
        </div>

        {/* ------------------------------ nav row ------------------------------ */}
        <div className="bg-chrome border-chrome-border border-t">
          <div className="container-page flex h-12 items-stretch justify-between gap-2">
            <div className="flex items-stretch">
              <CategoryDrawer categories={categories} />
              <MegaMenu categories={categories} brands={brands} />
            </div>

            <Link
              href="/instalment"
              className="brand-sheen text-brand-foreground my-1.5 hidden items-center rounded-md px-5 text-[13px] font-bold tracking-wide uppercase shadow-sm transition-transform hover:scale-[1.02] md:flex"
            >
              Buy on Instalment
            </Link>
          </div>
        </div>
      </StickyHeaderShell>
    </header>
  );
}
