import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Gift Cards",
  description: "Give the gift of a new phone — redeemable in store and online.",
};

export default function Page() {
  return (
    <PageShell title="Gift Cards" lead="Give the gift of a new phone — redeemable in store and online.">
      <ComingSoon what="Gift Cards" />
    </PageShell>
  );
}
