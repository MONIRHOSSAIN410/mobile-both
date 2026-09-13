import type {
  Brand,
  Category,
  Product,
  ProductListResponse,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000/api";

type Query = Record<string, string | number | string[] | undefined | null>;

export function buildQuery(params: Query = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Small wrapper so a cold/unreachable API never crashes a page render —
 * `next build` and the first paint both stay green while the backend boots.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      // storefront data changes often; revalidate every minute
      next: { revalidate: 60 },
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json as T;
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[api] could not reach ${API_URL}${path}`);
    }
    return null;
  }
}

const EMPTY_LIST: ProductListResponse = {
  data: [],
  meta: { total: 0, page: 1, limit: 24, pages: 1, sort: "default", from: 0, to: 0 },
  facets: {
    brands: [],
    networks: [],
    availability: [],
    price: { min: 0, max: 0, buckets: [] },
  },
  // `false` means the API never answered — which is a very different thing
  // from "your filters matched nothing", and the UI needs to say so.
  ok: false,
};

export async function getProducts(params: Query = {}) {
  const json = await request<ProductListResponse & { success: boolean }>(
    `/products${buildQuery(params)}`
  );
  return json
    ? { data: json.data, meta: json.meta, facets: json.facets, ok: true }
    : EMPTY_LIST;
}

export async function getFeaturedProducts(limit = 8) {
  const json = await request<{ data: Product[] }>(
    `/products/featured?limit=${limit}`
  );
  return json?.data ?? [];
}

export async function getDeals(limit = 8) {
  const json = await request<{ data: Product[] }>(`/products/deals?limit=${limit}`);
  return json?.data ?? [];
}

export async function getProduct(slug: string) {
  const json = await request<{
    data: { product: Product; related: Product[] };
  }>(`/products/${encodeURIComponent(slug)}`);
  return json?.data ?? null;
}

export async function getCategories() {
  const json = await request<{ data: Category[] }>(`/categories`);
  return json?.data ?? [];
}

export async function getBrands(category?: string) {
  const json = await request<{ data: Brand[] }>(
    `/brands${buildQuery({ category })}`
  );
  return json?.data ?? [];
}

/* ------------------------------------------------------------------ */
/*  Client-side helpers (browser only)                                 */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  details?: Record<string, string>;
  constructor(status: number, message: string, details?: Record<string, string>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * `token` is the backend JWT carried on the session (see src/auth.ts). Pass it
 * for anything behind `protect` — the cookie alone is not enough once a user
 * signs in through Google, because that session lives in Next.js.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.message ?? "Something went wrong. Please try again.",
      json.details
    );
  }
  return json as T;
}
