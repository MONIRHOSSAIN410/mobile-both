import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Check,
  CreditCard,
  RotateCcw,
  Star,
  Truck,
} from "lucide-react";

import { getProduct } from "@/lib/api";
import {
  AVAILABILITY_LABEL,
  formatPrice,
  monthlyInstalment,
} from "@/lib/format";
import type { Specs } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductDetailActions } from "@/components/shop/product-detail-actions";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;

const SPEC_LABELS: { key: keyof Specs; label: string }[] = [
  { key: "display", label: "Display" },
  { key: "processor", label: "Processor" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "battery", label: "Battery" },
  { key: "rearCamera", label: "Rear camera" },
  { key: "frontCamera", label: "Front camera" },
  { key: "os", label: "Operating system" },
  { key: "sim", label: "SIM" },
  { key: "weight", label: "Weight" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProduct(slug);
  if (!result) return { title: "Product not found" };

  return {
    title: result.product.name,
    description: result.product.shortDescription,
    openGraph: {
      title: result.product.name,
      description: result.product.shortDescription,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProduct(slug);
  if (!result) notFound();

  const { product, related } = result;
  const specs = SPEC_LABELS.filter(({ key }) => product.specs?.[key]);

  return (
    <div className="container-page py-6">
      <nav aria-label="Breadcrumb" className="text-muted-foreground mb-5 text-xs">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-brand-strong dark:hover:text-brand">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={`/products?category=${product.categorySlug}`}
              className="hover:text-brand-strong dark:hover:text-brand capitalize"
            >
              {product.categorySlug.replace(/-/g, " ")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground line-clamp-1 font-medium">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery product={product} />

        <div className="space-y-5">
          <div className="space-y-2">
            <Link
              href={`/products?brand=${product.brandSlug}`}
              className="text-brand-strong dark:text-brand text-xs font-bold tracking-[0.14em] uppercase"
            >
              {product.brandName}
            </Link>
            <h1 className="text-2xl leading-tight font-bold text-balance sm:text-3xl">
              {product.name}
            </h1>

            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              {product.numReviews > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="fill-warning text-warning size-4" />
                  <span className="text-foreground font-semibold">
                    {product.rating}
                  </span>
                  ({product.numReviews} reviews)
                </span>
              )}
              <span className="flex items-center gap-1">
                <BadgeCheck
                  className={
                    product.inStock ? "text-success size-4" : "text-muted-foreground size-4"
                  }
                />
                {AVAILABILITY_LABEL[product.availability]}
              </span>
              {product.sold > 0 && <span>{product.sold}+ sold</span>}
            </div>
          </div>

          <div className="bg-surface rounded-xl border p-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-brand-strong dark:text-brand text-3xl font-extrabold">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice ? (
                <>
                  <span className="text-muted-foreground text-lg line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  <Badge variant="destructive">
                    Save {formatPrice(product.oldPrice - product.price)}
                  </Badge>
                </>
              ) : null}
            </div>

            {product.instalment && (
              <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
                <CreditCard className="text-brand size-4" />
                Or {formatPrice(monthlyInstalment(product.price))}/month for 12
                months at 0% interest
              </p>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.shortDescription}
          </p>

          {product.networks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">Network:</span>
              {product.networks.map((network) => (
                <Badge key={network} variant="outline">
                  {network}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          <ProductDetailActions product={product} />

          <Separator />

          <ul className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: "Free delivery", sub: "Orders over ৳20,000" },
              { icon: RotateCcw, label: "7 day returns", sub: "Easy replacement" },
              { icon: BadgeCheck, label: "Official warranty", sub: "Countrywide service" },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-2.5">
                <item.icon className="text-brand-strong dark:text-brand mt-0.5 size-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="text-muted-foreground block text-xs">
                    {item.sub}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ------------------------------ tabs ------------------------------ */}
      <div className="mt-12">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="warranty">Warranty &amp; delivery</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-5">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-3">
                {product.description.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {product.highlights.length > 0 && (
                <ul className="bg-surface h-fit space-y-2.5 rounded-xl border p-5">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2.5 text-sm">
                      <Check className="text-success mt-0.5 size-4 shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specs" className="pt-5">
            {specs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Full specifications for this item are coming soon.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-sm">
                  <tbody>
                    {specs.map(({ key, label }, index) => (
                      <tr
                        key={key}
                        className={index % 2 === 1 ? "bg-surface" : undefined}
                      >
                        <th
                          scope="row"
                          className="w-48 px-4 py-3 text-left font-semibold"
                        >
                          {label}
                        </th>
                        <td className="text-muted-foreground px-4 py-3">
                          {product.specs[key]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="warranty" className="pt-5">
            <div className="text-muted-foreground max-w-2xl space-y-3 text-sm leading-relaxed">
              <p>
                Every product is covered by the manufacturer&apos;s official
                Bangladesh warranty. Keep your invoice — it is your warranty card.
              </p>
              <p>
                Inside Dhaka we deliver the same day for orders placed before
                4pm. Outside Dhaka takes 2–3 working days via our courier
                partners. Cash on delivery is available nationwide.
              </p>
              <p>
                Physical damage, liquid damage and unauthorised repairs void the
                warranty. Software issues are covered free of charge at any of
                our service points.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <Reveal className="mt-14">
          <SectionHeading
            title="You might also like"
            subtitle={`More from ${product.categorySlug.replace(/-/g, " ")}`}
            href={`/products?category=${product.categorySlug}`}
          />
          <ProductGrid products={related.slice(0, 8)} priorityCount={0} />
        </Reveal>
      )}
    </div>
  );
}
