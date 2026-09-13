import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What we collect, why we collect it, and how long we keep it.",
};

export default function Page() {
  return (
    <PageShell title="Privacy Policy" lead="What we collect, why we collect it, and how long we keep it.">
      <ComingSoon what="Privacy Policy" />
    </PageShell>
  );
}
