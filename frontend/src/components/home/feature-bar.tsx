import { BadgeCheck, CreditCard, Headset, RotateCcw, Truck } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "100% Genuine",
    body: "Sealed stock with official warranty",
  },
  { icon: Truck, title: "Fast Delivery", body: "Same-day inside Dhaka" },
  { icon: CreditCard, title: "0% EMI", body: "Up to 12 months on cards" },
  { icon: RotateCcw, title: "Easy Returns", body: "7 day replacement policy" },
  { icon: Headset, title: "Real Support", body: "Talk to a human, 9am–10pm" },
];

export function FeatureBar() {
  return (
    <section className="border-b">
      <div className="container-page grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 0.05} direction="up">
            <div className="group flex items-center gap-3">
              <span className="bg-brand/12 text-brand-strong dark:text-brand flex size-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{feature.title}</span>
                <span className="text-muted-foreground block text-xs">
                  {feature.body}
                </span>
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
