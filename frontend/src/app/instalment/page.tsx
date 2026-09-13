import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Check, CreditCard, FileText, Percent } from "lucide-react";

import { getProducts } from "@/lib/api";
import { formatPrice, monthlyInstalment } from "@/lib/format";
import { PageShell } from "@/components/page-shell";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Buy on Instalment",
  description:
    "0% interest EMI for 3, 6, 9 or 12 months on selected cards. See which products qualify and what the monthly payment looks like.",
};

const TENURES = [3, 6, 9, 12];
const BANKS = [
  "City Bank",
  "BRAC Bank",
  "EBL",
  "Dutch-Bangla",
  "Standard Chartered",
  "Prime Bank",
  "bKash",
  "Mutual Trust Bank",
];

const STEPS = [
  {
    icon: FileText,
    title: "Pick your product",
    body: "Anything over ৳ 15,000 marked “EMI” qualifies for an instalment plan.",
  },
  {
    icon: CreditCard,
    title: "Choose your card",
    body: "Use a credit card from any of our partner banks, or bKash for selected items.",
  },
  {
    icon: CalendarClock,
    title: "Pick a tenure",
    body: "3, 6, 9 or 12 months. Longer tenures mean a smaller monthly payment.",
  },
  {
    icon: Percent,
    title: "Pay 0% interest",
    body: "The price you see is the price you pay in total — no processing surprises.",
  },
];

export default async function InstalmentPage() {
  const { data } = await getProducts({ instalment: "true", sort: "price-desc", limit: 8 });
  const sample = data[0]?.price ?? 120000;

  return (
    <PageShell
      title="Buy on instalment, pay 0% interest"
      lead="Split any purchase over ৳ 15,000 into equal monthly payments. Approval takes about five minutes in store with your NID and a partner bank card."
    >
      <div className="space-y-14">
        {/* ------------------------------ how it works ------------------------------ */}
        <section>
          <SectionHeading title="How it works" subtitle="Four steps, one visit" />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="bg-card rounded-xl border p-5">
                <span className="bg-brand/12 text-brand-strong dark:text-brand mb-3 flex size-11 items-center justify-center rounded-lg">
                  <step.icon className="size-5" />
                </span>
                <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 font-bold">{step.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------ tenure table ------------------------------ */}
        <section>
          <SectionHeading
            title="What the monthly payment looks like"
            subtitle={`Worked example on a ${formatPrice(sample)} purchase`}
          />
          <div className="bg-card overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[30rem] text-sm">
              <thead className="bg-surface">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">
                    Tenure
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">
                    Monthly payment
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">
                    Interest
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">
                    Total paid
                  </th>
                </tr>
              </thead>
              <tbody>
                {TENURES.map((months, index) => (
                  <tr key={months} className={index % 2 === 1 ? "bg-surface" : undefined}>
                    <th scope="row" className="px-4 py-3 text-left font-semibold">
                      {months} months
                    </th>
                    <td className="text-brand-strong dark:text-brand px-4 py-3 font-bold tabular-nums">
                      {formatPrice(monthlyInstalment(sample, months))}
                    </td>
                    <td className="text-success px-4 py-3 font-semibold">0%</td>
                    <td className="px-4 py-3 tabular-nums">{formatPrice(sample)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Monthly figures are rounded up to the nearest ৳ 10. Your bank may apply
            its own card charges.
          </p>
        </section>

        {/* ------------------------------ banks ------------------------------ */}
        <section>
          <SectionHeading title="Partner cards" subtitle="0% EMI available on" />
          <ul className="flex flex-wrap gap-2">
            {BANKS.map((bank) => (
              <li
                key={bank}
                className="bg-card flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"
              >
                <Check className="text-success size-4" />
                {bank}
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------ eligible items ------------------------------ */}
        {data.length > 0 && (
          <section>
            <SectionHeading
              title="Products available on EMI"
              subtitle="Every one of these qualifies today"
              href="/products?instalment=true"
            />
            <ProductGrid products={data} priorityCount={0} />
          </section>
        )}

        <div className="bg-surface flex flex-col items-center gap-3 rounded-2xl border p-10 text-center">
          <h2 className="text-xl font-bold">Not sure if your card qualifies?</h2>
          <p className="text-muted-foreground max-w-lg text-sm">
            Call the hotline with your card issuer and the product you want — we
            will confirm eligibility and the exact monthly figure in a minute.
          </p>
          <Button asChild className="mt-1">
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
