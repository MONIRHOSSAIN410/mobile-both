import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Smartphone } from "lucide-react";

import { footerLinks, site } from "@/lib/site";
import { Logo } from "@/components/layout/logo";

export function SiteFooter() {
  return (
    <footer className="bg-chrome text-chrome-muted mt-16">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed">
            {site.tagline}. Genuine smartphones, tablets, wearables, gadgets and
            official accessories — with warranty, EMI and countrywide delivery.
          </p>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="text-brand size-4 shrink-0" />
              <a href={`tel:${site.hotline}`} className="hover:text-brand">
                Hotline: {site.hotline}
              </a>
              <span className="opacity-40">·</span>
              <a href={`tel:${site.support}`} className="hover:text-brand">
                Support: {site.support}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="text-brand size-4 shrink-0" />
              <a href={`mailto:${site.email}`} className="hover:text-brand">
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="text-brand mt-0.5 size-4 shrink-0" />
              <span>{site.address}</span>
            </li>
          </ul>

          <div className="flex gap-2 pt-1">
            {site.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="border-chrome-border hover:border-brand hover:text-brand rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {footerLinks.map((column) => (
          <nav key={column.title} aria-labelledby={`footer-${column.title}`}>
            <h2
              id={`footer-${column.title}`}
              className="text-chrome-foreground mb-3 text-xs font-bold tracking-[0.14em] uppercase"
            >
              {column.title}
            </h2>
            <ul className="space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-chrome-border border-t">
        <div className="container-page flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-chrome-foreground inline-flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="text-brand size-4" /> Secure payment
            </span>
            {["SSLCOMMERZ", "bKash", "Nagad", "Visa", "Mastercard"].map((method) => (
              <span
                key={method}
                className="border-chrome-border rounded border px-2 py-1"
              >
                {method}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-chrome-foreground inline-flex items-center gap-1.5 font-semibold">
              <Smartphone className="text-brand size-4" /> Get the app
            </span>
            <span className="border-chrome-border rounded border px-2 py-1">
              Google Play
            </span>
            <span className="border-chrome-border rounded border px-2 py-1">
              App Store
            </span>
          </div>
        </div>
      </div>

      <div className="border-chrome-border border-t">
        <div className="container-page flex flex-col gap-2 py-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-brand">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand">
              Terms of Service
            </Link>
            <Link href="/returns" className="hover:text-brand">
              Return Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
