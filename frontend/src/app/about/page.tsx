import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "About Us",
  description: "Who we are, where we came from, and why we only sell genuine stock.",
};

export default function Page() {
  return (
    <PageShell title="About Us" lead="Who we are, where we came from, and why we only sell genuine stock.">
      <ComingSoon what="About Us" />
    </PageShell>
  );
}
