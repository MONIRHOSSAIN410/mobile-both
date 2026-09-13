import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="bg-surface relative isolate overflow-hidden py-12 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background:radial-gradient(45%_45%_at_18%_10%,color-mix(in_oklab,var(--brand)_22%,transparent),transparent_70%),radial-gradient(40%_40%_at_85%_85%,color-mix(in_oklab,var(--brand-soft)_18%,transparent),transparent_70%)]"
      />

      <Reveal className="container-page flex justify-center">
        <div className="bg-card w-full max-w-md rounded-2xl border p-7 shadow-xl">
          <div className="mb-6 space-y-1 text-center">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>

          {children}

          <p className="text-muted-foreground mt-6 text-center text-sm">{footer}</p>

          <p className="text-muted-foreground mt-4 flex items-center justify-center gap-1.5 text-xs">
            <ShieldCheck className="text-success size-3.5" />
            Your details are encrypted and never shared.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-brand-strong dark:text-brand font-semibold hover:underline"
    >
      {children}
    </Link>
  );
}
