import Link from "next/link";

import {
  getBrands,
  getCategories,
  getDeals,
  getFeaturedProducts,
  getProducts,
} from "@/lib/api";
import { Hero } from "@/components/home/hero";
import { FeatureBar } from "@/components/home/feature-bar";
import { CategoryStrip } from "@/components/home/category-strip";
import { ProductCarousel } from "@/components/home/product-carousel";
import { PromoParallax } from "@/components/home/promo-parallax";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { ApiOffline } from "@/components/api-offline";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, brands, featured, deals, newest, budget] = await Promise.all([
    getCategories(),
    getBrands(),
    getFeaturedProducts(10),
    getDeals(10),
    getProducts({ sort: "newest", limit: 8 }),
    getProducts({ maxPrice: 20000, sort: "price-asc", limit: 8 }),
  ]);

  const apiDown = !newest.ok && !budget.ok;

  return (
    <>
      <Hero product={featured[0] ?? newest.data[0]} />
      <FeatureBar />

      {apiDown && (
        <div className="container-page py-10">
          <ApiOffline />
        </div>
      )}

      <CategoryStrip categories={categories} />

      {featured.length > 0 && (
        <section className="container-page py-8">
          <SectionHeading
            title="Featured right now"
            subtitle="Hand-picked by our showroom team"
            href="/products?featured=true"
          />
          <ProductCarousel products={featured} autoplay />
        </section>
      )}

      <BrandMarquee brands={brands} />

      {deals.length > 0 && (
        <section className="container-page py-12">
          <SectionHeading
            title="Biggest price drops"
            subtitle="Discounts refreshed every morning"
            href="/products?sort=price-asc"
          />
          <ProductCarousel products={deals} />
        </section>
      )}

      <PromoParallax />

      {newest.data.length > 0 && (
        <section className="container-page py-8">
          <SectionHeading
            title="New arrivals"
            subtitle="Just landed in our warehouse"
            href="/products?sort=newest"
          />
          <ProductGrid products={newest.data} />
        </section>
      )}

      {budget.data.length > 0 && (
        <section className="container-page py-12">
          <SectionHeading
            title="Great under ৳ 20,000"
            subtitle="Solid phones that do not break the budget"
            href="/products?maxPrice=20000"
          />
          <ProductGrid products={budget.data} priorityCount={0} />
        </section>
      )}

      <Reveal className="container-page pb-12">
        <div className="bg-surface flex flex-col items-center gap-4 rounded-2xl border p-10 text-center">
          <h2 className="text-2xl font-bold text-balance sm:text-3xl">
            Not sure which phone fits your budget?
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Use the filters to narrow by price, brand, network and availability —
            or call our hotline and we will shortlist three options for you.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Start browsing</Link>
          </Button>
        </div>
      </Reveal>
    </>
  );
}
