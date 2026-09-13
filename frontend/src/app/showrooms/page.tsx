import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Our Showrooms",
  description: "Come and hold the phone before you buy it — we have counters across Dhaka and Chattogram.",
};

export default function Page() {
  return (
    <PageShell title="Our Showrooms" lead="Come and hold the phone before you buy it — we have counters across Dhaka and Chattogram.">
      <ComingSoon what="Our Showrooms" />
    </PageShell>
  );
}
