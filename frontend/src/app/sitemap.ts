import type { MetadataRoute } from "next";

import { getCategories, getProducts } from "@/lib/api";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ limit: 60, sort: "newest" }),
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((category) => ({
      url: `${base}/products?category=${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.data.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.createdAt ? new Date(product.createdAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
