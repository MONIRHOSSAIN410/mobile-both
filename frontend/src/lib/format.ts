const bdt = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 });

/** ৳ 1,23,456 — the taka sign plus grouped digits. */
export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `৳ ${bdt.format(Math.round(value))}`;
}

export function formatCompact(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

export function monthlyInstalment(price: number, months = 12) {
  return Math.ceil(price / months / 10) * 10;
}

export const AVAILABILITY_LABEL: Record<string, string> = {
  "in-stock": "In Stock",
  "pre-order": "Pre-Order",
  "out-of-stock": "Out of Stock",
};
