import type { Metadata } from "next";

import { getProducts } from "@/lib/api";
import { WishlistView } from "@/app/account/wishlist/wishlist-view";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The products you have saved for later.",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  // The wishlist itself lives in the browser, so we hand the client the full
  // catalogue slice and let it filter — no extra round-trip per item.
  const { data } = await getProducts({ limit: 60, sort: "newest" });

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold">Your wishlist</h1>
      <WishlistView products={data} />
    </div>
  );
}
