import Link from "next/link";
import { CalendarClock, Percent, Wallet } from "lucide-react";

import { ParallaxSection, ParallaxLayer } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const POINTS = [
  {
    icon: Percent,
    title: "0% interest",
    body: "No hidden charges on selected bank and bKash cards.",
  },
  {
    icon: CalendarClock,
    title: "3 – 12 months",
    body: "Pick the tenure that matches your salary date.",
  },
  {
    icon: Wallet,
    title: "Instant approval",
    body: "Approved in-store in minutes with your NID and card.",
  },
];

export function PromoParallax() {
  return (
    <ParallaxSection className="my-14 py-20" strength={90}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal direction="right">
          <div className="space-y-5">
            <p className="text-brand text-xs font-bold tracking-[0.2em] uppercase">
              Buy on instalment
            </p>
            <h2 className="text-chrome-foreground text-3xl leading-tight font-extrabold text-balance sm:text-4xl">
              Take the flagship home today. Pay for it over the next year.
            </h2>
            <p className="text-chrome-muted max-w-lg leading-relaxed">
              Split any purchase over ৳ 15,000 into equal monthly payments with
              0% interest. Bring your NID and a supported credit card — approval
              takes about five minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/instalment">See EMI plans</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-chrome-foreground border-chrome-border bg-transparent hover:bg-chrome-border/40 hover:text-chrome-foreground"
              >
                <Link href="/products?instalment=true">Shop EMI products</Link>
              </Button>
            </div>
          </div>
        </Reveal>

        <ParallaxLayer speed={44} className="grid gap-3">
          {POINTS.map((point, index) => (
            <Reveal key={point.title} direction="left" delay={index * 0.08}>
              <div className="glass flex items-start gap-4 rounded-xl border p-5">
                <span className="bg-brand/15 text-brand-strong dark:text-brand flex size-11 shrink-0 items-center justify-center rounded-lg">
                  <point.icon className="size-5" />
                </span>
                <span>
                  <span className="block font-bold">{point.title}</span>
                  <span className="text-muted-foreground block text-sm">
                    {point.body}
                  </span>
                </span>
              </div>
            </Reveal>
          ))}
        </ParallaxLayer>
      </div>
    </ParallaxSection>
  );
}
