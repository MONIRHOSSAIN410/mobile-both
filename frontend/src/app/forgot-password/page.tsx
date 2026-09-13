import type { Metadata } from "next";

import { ComingSoon, PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Reset Your Password",
  description: "We will send a reset link to the email on your account.",
};

export default function Page() {
  return (
    <PageShell title="Reset Your Password" lead="We will send a reset link to the email on your account.">
      <ComingSoon what="Reset Your Password" />
    </PageShell>
  );
}
