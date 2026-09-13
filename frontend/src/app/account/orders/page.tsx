import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { OrdersView } from "@/app/account/orders/orders-view";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Every order you have placed with us.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <PageShell
      title="My orders"
      lead="Everything you have ordered, newest first. Log in to see the list."
    >
      <OrdersView />
    </PageShell>
  );
}
