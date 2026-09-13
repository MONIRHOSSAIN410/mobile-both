import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Call the hotline, drop us an email, or visit a showroom.",
};

export default function Page() {
  return (
    <PageShell title="Contact Us" lead="Call the hotline, drop us an email, or visit a showroom.">
      <ComingSoon what="Contact Us" />
    </PageShell>
  );
}
