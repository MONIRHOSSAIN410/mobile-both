import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Blog",
  description: "Buying guides, comparisons and launch coverage from our showroom team.",
};

export default function Page() {
  return (
    <PageShell title="Blog" lead="Buying guides, comparisons and launch coverage from our showroom team.">
      <ComingSoon what="Blog" />
    </PageShell>
  );
}
