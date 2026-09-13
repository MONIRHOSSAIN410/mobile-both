"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";

import type { Category } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CategoryIcon } from "@/components/layout/category-icon";

export function CategoryDrawer({
  categories,
}: {
  categories: Pick<Category, "name" | "slug" | "icon">[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="bg-chrome-border/60 text-chrome-foreground hover:bg-brand hover:text-brand-foreground flex h-full cursor-pointer items-center gap-2 px-4 text-sm font-semibold whitespace-nowrap transition-colors">
        <LayoutGrid className="size-4" />
        <span className="hidden sm:inline">ALL CATEGORIES</span>
        <span className="sm:hidden">MENU</span>
      </SheetTrigger>

      <SheetContent side="left" className="w-[19rem] p-0" showClose>
        <SheetHeader className="bg-chrome text-chrome-foreground flex-row items-center gap-2 p-4">
          <LayoutGrid className="size-4" />
          <SheetTitle className="text-chrome-foreground text-base">
            All Categories
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col overflow-y-auto">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              onClick={() => setOpen(false)}
              className="hover:bg-accent hover:text-brand-strong dark:hover:text-brand group flex items-center gap-3 border-b px-4 py-3.5 text-sm font-medium transition-colors"
            >
              <CategoryIcon
                name={category.icon}
                className="text-brand-strong dark:text-brand size-4"
              />
              {category.name}
              <ChevronRight className="text-muted-foreground ml-auto size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
