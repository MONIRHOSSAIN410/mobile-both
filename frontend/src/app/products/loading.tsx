import { ProductCardSkeleton } from "@/components/shop/product-card";

export default function Loading() {
  return (
    <div className="container-page py-6">
      <div className="bg-muted mb-5 h-16 animate-pulse rounded-xl" />
      <div className="grid gap-5 lg:grid-cols-[17rem_1fr]">
        <div className="bg-muted hidden h-[32rem] animate-pulse rounded-xl lg:block" />
        <div>
          <div className="bg-muted mb-4 h-14 animate-pulse rounded-xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
