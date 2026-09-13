import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { TrackForm } from "@/app/track/track-form";

export const metadata: Metadata = {
  title: "Order Tracking",
  description:
    "Enter your order number to see where your parcel is and when it will arrive.",
};

export default function TrackPage() {
  return (
    <PageShell
      title="Track your order"
      lead="Your order number looks like MB-XXXXXXXX and is in the confirmation SMS we sent you."
    >
      <TrackForm />
    </PageShell>
  );
}
