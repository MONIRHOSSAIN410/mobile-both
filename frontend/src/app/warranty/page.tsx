import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Warranty Policy",
  description: "What the official warranty covers, and what voids it.",
};

export default function Page() {
  return (
    <PageShell title="Warranty Policy" lead="What the official warranty covers, and what voids it.">
      <ComingSoon what="Warranty Policy" />
    </PageShell>
  );
}
