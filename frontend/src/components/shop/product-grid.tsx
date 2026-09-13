import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/shop/product-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

export function ProductGrid({
  products,
  className,
  columns = "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
  priorityCount = 4,
}: {
  products: Product[];
  className?: string;
  columns?: string;
  priorityCount?: number;
}) {
  return (
    <RevealGroup className={cn("grid gap-3 sm:gap-4", columns, className)}>
      {products.map((product, index) => (
        <RevealItem key={product.slug} index={index} className="h-full">
          <ProductCard
            product={product}
            priority={index < priorityCount}
            className="h-full"
          />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
