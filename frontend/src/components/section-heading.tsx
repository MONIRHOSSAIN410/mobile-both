import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "View all",
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="from-brand to-brand-soft mr-3 inline-block h-6 w-1.5 rounded-full bg-gradient-to-b align-[-2px]" />
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground pl-[18px] text-sm">{subtitle}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="text-brand-strong dark:text-brand group hidden shrink-0 items-center gap-1.5 text-sm font-semibold sm:flex"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
