import type { Metadata } from "next";

import { CartView } from "@/app/cart/cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your cart and continue to checkout.",
};

export default function CartPage() {
  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
      <CartView />
    </div>
  );
}
