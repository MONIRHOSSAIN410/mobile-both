/**
 * Shown the instant you click a product card, while the detail page fetches.
 *
 * Without this file the closest boundary above is `products/loading.tsx` — a
 * grid of twelve card skeletons — so clicking one product flashed a whole fake
 * product list before the detail arrived. That read as "the card is slow to
 * come"; it was really the wrong skeleton. This one has the shape of the page
 * it precedes, so the layout never jumps.
 */
export default function Loading() {
  return (
    <div className="container-page py-6" aria-busy="true" aria-label="Loading product">
      <div className="bg-muted mb-5 h-4 w-64 max-w-full animate-pulse rounded" />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* gallery: main image + thumbnail strip */}
        <div className="space-y-3">
          <div className="bg-muted aspect-square w-full animate-pulse rounded-xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted size-16 animate-pulse rounded-lg sm:size-20"
              />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="bg-muted h-3 w-24 animate-pulse rounded" />
            <div className="bg-muted h-8 w-full animate-pulse rounded" />
            <div className="bg-muted h-8 w-2/3 animate-pulse rounded" />
            <div className="bg-muted h-4 w-48 animate-pulse rounded" />
          </div>

          {/* price block */}
          <div className="bg-surface space-y-3 rounded-xl border p-4">
            <div className="bg-muted h-9 w-44 animate-pulse rounded" />
            <div className="bg-muted h-4 w-56 animate-pulse rounded" />
          </div>

          {/* quantity + buttons */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-muted h-11 w-32 animate-pulse rounded-md" />
            <div className="bg-muted h-11 flex-1 animate-pulse rounded-md" />
          </div>

          {/* delivery / warranty strip */}
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted h-12 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* specs / description tabs */}
      <div className="mt-10 space-y-3">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-9 w-28 animate-pulse rounded-md" />
          ))}
        </div>
        <div className="bg-muted h-64 animate-pulse rounded-xl" />
      </div>
    </div>
  );
}
