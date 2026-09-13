import type { Metadata } from "next";

import { CheckoutForm } from "@/app/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm your delivery details and place the order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
