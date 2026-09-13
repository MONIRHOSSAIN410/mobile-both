export type Availability = "in-stock" | "pre-order" | "out-of-stock";
export type Network = "5G" | "4G" | "3G" | "2G";

export interface Specs {
  display?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  battery?: string;
  rearCamera?: string;
  frontCamera?: string;
  os?: string;
  sim?: string;
  weight?: string;
}

export interface Product {
  _id: string;
  id: string;
  name: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  categorySlug: string;
  price: number;
  oldPrice: number | null;
  discountPercent: number;
  images: string[];
  accent: string;
  availability: Availability;
  inStock: boolean;
  stock: number;
  networks: Network[];
  isFeatured: boolean;
  isNewArrival: boolean;
  instalment: boolean;
  rating: number;
  numReviews: number;
  sold: number;
  shortDescription: string;
  description: string;
  highlights: string[];
  colors: string[];
  specs: Specs;
  tags: string[];
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  order: number;
  menuBrands: string[];
  productCount: number;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  accent: string;
  country: string;
  productCount: number;
}

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  sort: string;
  from: number;
  to: number;
}

export interface Facets {
  brands: { slug: string; name: string; count: number }[];
  networks: { value: Network; count: number }[];
  availability: { value: Availability; count: number }[];
  price: {
    min: number;
    max: number;
    buckets: { key: string; label: string; min: number; max: number | null }[];
  };
}

export interface ProductListResponse {
  data: Product[];
  meta: ListMeta;
  facets: Facets;
  /** false when the API could not be reached at all. */
  ok: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  avatar: string;
  isVerified: boolean;
}
