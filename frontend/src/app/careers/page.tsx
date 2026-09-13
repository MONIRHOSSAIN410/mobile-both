import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Careers",
  description: "Sales, service, logistics and engineering roles at Mobile.com.bd.",
};

export default function Page() {
  return (
    <PageShell title="Careers" lead="Sales, service, logistics and engineering roles at Mobile.com.bd.">
      <ComingSoon what="Careers" />
    </PageShell>
  );
}
