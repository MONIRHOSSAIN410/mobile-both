import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Mobile.com.bd home"
      className={cn("group flex shrink-0 items-end gap-1", className)}
    >
      <span className="relative text-2xl leading-none font-extrabold tracking-tight text-chrome-foreground">
        m
        <span className="relative inline-block">
          o
          {/* the little signal mark that sits on the "o" */}
          <svg
            viewBox="0 0 24 16"
            aria-hidden
            className="text-brand absolute -top-2.5 left-1/2 h-3 w-4 -translate-x-1/2"
          >
            <circle cx="12" cy="13" r="2.2" fill="currentColor" />
            <path
              d="M6 10a8 8 0 0 1 12 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M2 6a13 13 0 0 1 20 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </span>
        bile
      </span>
      <span className="text-brand pb-0.5 text-[11px] font-bold tracking-tight">
        .com.bd
      </span>
    </Link>
  );
}
