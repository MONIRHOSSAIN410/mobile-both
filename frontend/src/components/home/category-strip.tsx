import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Category } from "@/lib/types";
import { CategoryIcon } from "@/components/layout/category-icon";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";

export function CategoryStrip({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="container-page py-12">
      <SectionHeading
        title="Shop by category"
        subtitle="Seven aisles, one warranty desk"
        href="/products"
        linkLabel="Browse everything"
      />

      <RevealGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {categories.map((category) => (
          <RevealItem key={category.slug}>
            <Link
              href={`/products?category=${category.slug}`}
              className="group bg-card hover:border-brand relative flex h-full flex-col items-center gap-2.5 overflow-hidden rounded-xl border p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="bg-brand/12 text-brand-strong dark:text-brand flex size-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110">
                <CategoryIcon name={category.icon} className="size-5" />
              </span>
              <span className="text-sm leading-tight font-semibold">
                {category.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {category.productCount} items
              </span>
              <ArrowUpRight className="text-brand absolute top-2.5 right-2.5 size-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
