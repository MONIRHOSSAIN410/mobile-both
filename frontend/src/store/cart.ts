"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Product } from "@/lib/types";

export interface CartItem {
  slug: string;
  name: string;
  brandName: string;
  categorySlug: string;
  accent: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === product.slug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === product.slug
                  ? { ...i, quantity: Math.min(10, i.quantity + quantity) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                slug: product.slug,
                name: product.name,
                brandName: product.brandName,
                categorySlug: product.categorySlug,
                accent: product.accent,
                image: product.images?.[0] ?? "",
                price: product.price,
                quantity,
              },
            ],
          };
        }),

      removeItem: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),

      setQuantity: (slug, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.slug === slug
              ? { ...i, quantity: Math.max(1, Math.min(10, quantity)) }
              : i
          ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "mb-cart",
      storage: createJSONStorage(() => localStorage),
      // the cart lives in this browser only; orders are created server-side
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const cartCount = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.quantity, 0);

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);
