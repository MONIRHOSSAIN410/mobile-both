import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules that apply when you buy from Mobile.com.bd.",
};

export default function Page() {
  return (
    <PageShell title="Terms of Service" lead="The rules that apply when you buy from Mobile.com.bd.">
      <ComingSoon what="Terms of Service" />
    </PageShell>
  );
}
