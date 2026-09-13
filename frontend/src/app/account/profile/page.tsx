import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { ProfileForm } from "@/app/account/profile/profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your name, mobile number and account details.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <PageShell
      title="Your profile"
      lead="Keep your mobile number up to date — our riders call it on delivery day."
    >
      <ProfileForm />
    </PageShell>
  );
}
