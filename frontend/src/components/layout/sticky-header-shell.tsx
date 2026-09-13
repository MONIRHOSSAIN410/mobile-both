"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { ScrollProgress } from "@/components/motion/parallax";

/**
 * Keeps the search + nav rows pinned to the top of the viewport.
 *
 * This element's height never changes. An earlier version collapsed the top
 * contact bar once you scrolled past ~90px, which shortened the document,
 * which made the browser's scroll anchoring nudge scrollY back under the
 * threshold, which expanded it again — a loop that made the whole header
 * shudder. The contact bar now simply sits above this element and scrolls away
 * on its own, so there is nothing to oscillate.
 *
 * The only thing scroll still drives here is a shadow, which costs no layout.
 */
export function StickyHeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-scrolled={scrolled}
      className={cn(
        "sticky top-0 z-50 transition-shadow duration-300",
        scrolled && "shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]"
      )}
    >
      <ScrollProgress />
      {children}
    </div>
  );
}
