import type { Metadata, Viewport } from "next";

import "./globals.css";

import { site } from "@/lib/site";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { accentBootstrapScript } from "@/components/accent-provider";

const inter = { variable: "--font-sans" };
const sora = { variable: "--font-display" };

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Buy 100% original smartphones, tablets, smart watches, earbuds and gadgets in Bangladesh with official warranty, 0% EMI and same-day Dhaka delivery.",
  keywords: [
    "mobile price in bangladesh",
    "smartphone bd",
    "official warranty phone",
    "emi mobile bd",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description:
      "Original smartphones and gadgets with official warranty, 0% EMI and countrywide delivery.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* applies the saved accent before first paint, so it never flashes */}
        <script
          dangerouslySetInnerHTML={{ __html: accentBootstrapScript }}
        />
      </head>
      <body className={`${inter.variable} ${sora.variable} antialiased`}>
        <Providers>
          <a
            href="#main"
            className="focus:bg-brand focus:text-brand-foreground sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:px-3 focus:py-2"
          >
            Skip to content
          </a>

          <SiteHeader />
          <main id="main" className="min-h-[60vh] pb-16 lg:pb-0">
            {children}
          </main>
          <SiteFooter />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
