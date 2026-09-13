import Link from "next/link";
import { BookOpen, Gift, Headset, PackageSearch, Phone } from "lucide-react";

import { site } from "@/lib/site";

export function TopBar() {
  return (
    <div className="bg-chrome text-chrome-muted hidden border-b border-chrome-border text-xs lg:block">
      <div className="container-page flex h-9 items-center justify-between">
        <div className="flex items-center gap-5">
          <a
            href={`tel:${site.hotline}`}
            className="hover:text-brand flex items-center gap-1.5 transition-colors"
          >
            <Phone className="size-3.5" />
            <span className="text-chrome-foreground font-semibold">Hotline:</span>
            {site.hotline}
          </a>
          <a
            href={`tel:${site.support}`}
            className="hover:text-brand flex items-center gap-1.5 transition-colors"
          >
            <Headset className="size-3.5" />
            <span className="text-chrome-foreground font-semibold">Support:</span>
            {site.support}
          </a>
        </div>

        <nav className="flex items-center gap-5">
          <Link href="/track" className="hover:text-brand flex items-center gap-1.5 transition-colors">
            <PackageSearch className="size-3.5" /> Order Tracking
          </Link>
          <Link href="/gift" className="hover:text-brand flex items-center gap-1.5 transition-colors">
            <Gift className="size-3.5" /> Gift
          </Link>
          <Link href="/blog" className="hover:text-brand flex items-center gap-1.5 transition-colors">
            <BookOpen className="size-3.5" /> Blogs
          </Link>
        </nav>
      </div>
    </div>
  );
}
