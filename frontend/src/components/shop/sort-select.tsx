"use client";

import { useShopParams } from "@/hooks/use-shop-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS = [
  { value: "default", label: "Default" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "name-asc", label: "Name: A – Z" },
];

export function SortSelect() {
  const { get, set } = useShopParams();
  const value = get("sort") || "default";

  return (
    <Select
      value={value}
      onValueChange={(next) => set("sort", next === "default" ? null : next)}
    >
      <SelectTrigger className="w-[11.5rem]" aria-label="Sort products">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
