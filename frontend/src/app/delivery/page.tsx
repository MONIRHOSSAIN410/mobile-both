import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Delivery Information",
  description: "Same-day inside Dhaka, 2–3 working days everywhere else.",
};

export default function Page() {
  return (
    <PageShell title="Delivery Information" lead="Same-day inside Dhaka, 2–3 working days everywhere else.">
      <ComingSoon what="Delivery Information" />
    </PageShell>
  );
}
