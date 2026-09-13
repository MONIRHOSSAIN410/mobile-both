"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * One place that owns the filter querystring, so every control
 * (chips, sidebar, sort, pagination) stays in sync with the URL.
 */
export function useShopParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = React.useTransition();

  const push = React.useCallback(
    (mutate: (params: URLSearchParams) => void, { resetPage = true } = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      if (resetPage) params.delete("page");

      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const get = React.useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams]
  );

  const getList = React.useCallback(
    (key: string) => {
      const raw = searchParams.get(key);
      return raw ? raw.split(",").filter(Boolean) : [];
    },
    [searchParams]
  );

  const set = React.useCallback(
    (key: string, value?: string | null) =>
      push((params) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      }),
    [push]
  );

  const toggleInList = React.useCallback(
    (key: string, value: string) =>
      push((params) => {
        const current = (params.get(key) ?? "").split(",").filter(Boolean);
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        if (next.length) params.set(key, next.join(","));
        else params.delete(key);
      }),
    [push]
  );

  const setPage = React.useCallback(
    (page: number) =>
      push(
        (params) => {
          if (page <= 1) params.delete("page");
          else params.set("page", String(page));
        },
        { resetPage: false }
      ),
    [push]
  );

  const resetAll = React.useCallback(
    () =>
      push((params) => {
        const category = params.get("category");
        const q = params.get("q");
        for (const key of [...params.keys()]) params.delete(key);
        if (category) params.set("category", category);
        if (q) params.set("q", q);
      }),
    [push]
  );

  return { get, getList, set, toggleInList, setPage, resetAll, push, pending };
}
