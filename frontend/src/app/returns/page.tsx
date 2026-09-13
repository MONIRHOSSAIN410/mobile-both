import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "Seven days to change your mind on an unopened box.",
};

export default function Page() {
  return (
    <PageShell title="Return & Refund Policy" lead="Seven days to change your mind on an unopened box.">
      <ComingSoon what="Return & Refund Policy" />
    </PageShell>
  );
}
