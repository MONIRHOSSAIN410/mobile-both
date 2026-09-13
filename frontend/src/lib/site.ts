import type { Category } from "./types";

export const site = {
  name: "Mobile.com.bd",
  tagline: "Bangladesh's smartphone superstore",
  hotline: "01632-333722",
  support: "01334-549444",
  email: "care@mobile.com.bd",
  address:
    "Office: Level 4, Bashundhara City, Panthapath, Dhaka 1215, Bangladesh",
  socials: [
    { label: "Facebook", href: "https://facebook.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Instagram", href: "https://instagram.com" },
  ],
};

/** Shown until the API responds, so the header never renders empty. */
export const fallbackCategories: Pick<
  Category,
  "name" | "slug" | "icon" | "menuBrands"
>[] = [
  {
    name: "Phones",
    slug: "phones",
    icon: "smartphone",
    menuBrands: [
      "samsung",
      "xiaomi",
      "realme",
      "oppo",
      "vivo",
      "symphony",
      "tecno",
      "infinix",
      "honor",
      "zte",
    ],
  },
  {
    name: "Featured Phone",
    slug: "featured-phone",
    icon: "phone",
    menuBrands: ["symphony", "nokia", "proton", "xtra", "motorola"],
  },
  { name: "Tablet", slug: "tablet", icon: "tablet", menuBrands: [] },
  { name: "Smart Watch", slug: "smart-watch", icon: "watch", menuBrands: [] },
  { name: "Earbuds", slug: "earbuds", icon: "headphones", menuBrands: [] },
  { name: "Accessories", slug: "accessories", icon: "cable", menuBrands: [] },
  { name: "Gadgets", slug: "gadgets", icon: "cpu", menuBrands: [] },
];

export const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Showrooms", href: "/showrooms" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Order Tracking", href: "/track" },
      { label: "Delivery Info", href: "/delivery" },
      { label: "Return & Refund", href: "/returns" },
      { label: "Warranty Policy", href: "/warranty" },
      { label: "EMI / Instalment", href: "/instalment" },
    ],
  },
  {
    title: "My Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Create Account", href: "/register" },
      { label: "My Orders", href: "/account/orders" },
      { label: "Wishlist", href: "/account/wishlist" },
      { label: "Cart", href: "/cart" },
    ],
  },
];

/** Accent presets for the colour switcher in the header. */
export const accents = [
  { key: "gold", label: "Gold", value: "89.73", chroma: "0.138" },
  { key: "emerald", label: "Emerald", value: "158", chroma: "0.13" },
  { key: "azure", label: "Azure", value: "252", chroma: "0.15" },
  { key: "crimson", label: "Crimson", value: "22", chroma: "0.17" },
  { key: "violet", label: "Violet", value: "300", chroma: "0.15" },
] as const;

export type AccentKey = (typeof accents)[number]["key"];
