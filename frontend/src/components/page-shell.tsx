import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

/** Shared wrapper for the informational pages linked from the header/footer. */
export function PageShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="bg-chrome relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background:radial-gradient(50%_60%_at_15%_10%,color-mix(in_oklab,var(--brand)_35%,transparent),transparent_70%)]"
        />
        <div className="container-page py-12">
          <h1 className="text-chrome-foreground text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          {lead && (
            <p className="text-chrome-muted mt-3 max-w-2xl leading-relaxed">
              {lead}
            </p>
          )}
        </div>
      </div>

      <Reveal className="container-page py-10">{children}</Reveal>
    </>
  );
}

export function ComingSoon({ what }: { what: string }) {
  return (
    <div className="bg-surface rounded-xl border p-10 text-center">
      <h2 className="text-lg font-bold">{what} is being written</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
        This page is part of the storefront scaffold — drop your real content in
        and it is ready to publish.
      </p>
      <Button asChild variant="outline" className="mt-5">
        <Link href="/products">
          <ArrowLeft /> Back to shopping
        </Link>
      </Button>
    </div>
  );
}
