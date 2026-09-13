"use client";

import * as React from "react";
import { Loader2, PackageSearch } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const STAGES = ["pending", "confirmed", "packed", "shipped", "delivered"] as const;

interface Order {
  orderNumber: string;
  status: (typeof STAGES)[number] | "cancelled";
  grandTotal: number;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
  shipping: { city: string };
}

export function TrackForm() {
  const { request } = useApi();
  const [loading, setLoading] = React.useState(false);
  const [order, setOrder] = React.useState<Order | null>(null);
  const [error, setError] = React.useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const number = String(new FormData(event.currentTarget).get("orderNumber") ?? "")
      .trim()
      .toUpperCase();
    if (!number) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await request<{ data: Order }>(
        `/orders/${encodeURIComponent(number)}`
      );
      setOrder(res.data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 401
            ? "Please log in first — order tracking is tied to your account."
            : err.message
          : "Could not reach the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const stageIndex = order ? STAGES.indexOf(order.status as (typeof STAGES)[number]) : -1;

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={onSubmit} className="bg-card space-y-4 rounded-xl border p-6">
        <div className="space-y-1.5">
          <Label htmlFor="orderNumber">Order number</Label>
          <Input
            id="orderNumber"
            name="orderNumber"
            placeholder="MB-XXXXXXXX"
            autoComplete="off"
            required
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <PackageSearch />}
          {loading ? "Looking it up…" : "Track order"}
        </Button>
      </form>

      {error && (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
          {error}
        </p>
      )}

      {order && (
        <div className="bg-card space-y-5 rounded-xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Order
              </p>
              <p className="text-lg font-bold">{order.orderNumber}</p>
            </div>
            <Badge variant={order.status === "cancelled" ? "destructive" : "soft"}>
              {order.status}
            </Badge>
          </div>

          {order.status !== "cancelled" && (
            <ol className="flex flex-wrap gap-2">
              {STAGES.map((stage, index) => (
                <li
                  key={stage}
                  className={
                    index <= stageIndex
                      ? "bg-brand/15 text-brand-strong dark:text-brand rounded-full px-3 py-1 text-xs font-semibold capitalize"
                      : "bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs capitalize"
                  }
                >
                  {stage}
                </li>
              ))}
            </ol>
          )}

          <ul className="divide-y text-sm">
            {order.items.map((item) => (
              <li key={item.name} className="flex justify-between gap-4 py-2">
                <span className="min-w-0">
                  {item.name}{" "}
                  <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t pt-3 font-bold">
            <span>Total</span>
            <span className="text-brand-strong dark:text-brand tabular-nums">
              {formatPrice(order.grandTotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
