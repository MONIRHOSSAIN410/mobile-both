"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, PackageX } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

type FetchState =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "ok"; orders: Order[] };

export function OrdersView() {
  const { request, isAuthenticated, isLoading } = useApi();
  const [state, setState] = React.useState<FetchState>({ kind: "idle" });

  React.useEffect(() => {
    if (!isAuthenticated) return;

    let alive = true;

    request<{ data: Order[] }>("/orders/my")
      .then((res) => {
        if (alive) setState({ kind: "ok", orders: res.data });
      })
      .catch((error) => {
        if (!alive) return;
        setState({
          kind: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "Could not reach the server. Please try again.",
        });
      });

    return () => {
      alive = false;
    };
  }, [request, isAuthenticated]);

  if (isLoading || (isAuthenticated && state.kind === "idle")) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Loading your orders…
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-card flex flex-col items-start gap-3 rounded-xl border p-6">
        <p className="text-sm font-medium">Please log in to see your orders.</p>
        <Button asChild size="sm">
          <Link href="/login?callbackUrl=/account/orders">Log in</Link>
        </Button>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="bg-card flex flex-col items-start gap-3 rounded-xl border p-6">
        <p className="text-sm font-medium">{state.message}</p>
        <Button asChild size="sm">
          <Link href="/login?callbackUrl=/account/orders">Log in again</Link>
        </Button>
      </div>
    );
  }

  if (state.kind !== "ok" || state.orders.length === 0) {
    return (
      <div className="bg-card flex flex-col items-center gap-3 rounded-xl border py-16 text-center">
        <PackageX className="text-muted-foreground size-10" />
        <h2 className="font-bold">No orders yet</h2>
        <Button asChild className="mt-1">
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {state.orders.map((order) => (
        <li
          key={order._id}
          className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
        >
          <div className="min-w-0">
            <p className="font-bold">{order.orderNumber}</p>
            <p className="text-muted-foreground line-clamp-1 text-sm">
              {order.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
            </p>
            <p className="text-muted-foreground text-xs">
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="soft" className="capitalize">
              {order.status}
            </Badge>
            <span className="text-brand-strong dark:text-brand font-bold tabular-nums">
              {formatPrice(order.grandTotal)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
