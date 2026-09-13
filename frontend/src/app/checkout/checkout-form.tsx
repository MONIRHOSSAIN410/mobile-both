"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { cartTotal, useCart } from "@/store/cart";
import { useMounted } from "@/hooks/use-mounted";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const FREE_DELIVERY_OVER = 20000;

const PAYMENTS = [
  { value: "cod", label: "Cash on delivery", hint: "Pay the rider when it arrives" },
  { value: "bkash", label: "bKash", hint: "Pay now from your bKash wallet" },
  { value: "sslcommerz", label: "Card / SSLCOMMERZ", hint: "Visa, Mastercard, Amex" },
  { value: "instalment", label: "Instalment (EMI)", hint: "0% for up to 12 months" },
];

export function CheckoutForm() {
  const router = useRouter();
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const { request, isAuthenticated, isLoading, user } = useApi();

  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [city, setCity] = React.useState("Dhaka");

  if (!mounted) return <div className="bg-muted h-96 animate-pulse rounded-xl" />;

  if (items.length === 0) {
    return (
      <div className="bg-card flex flex-col items-center gap-3 rounded-xl border py-20 text-center">
        <ShoppingBag className="text-muted-foreground size-10" />
        <h2 className="text-lg font-bold">Nothing to check out</h2>
        <Button asChild className="mt-2">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  const subtotal = cartTotal(items);
  const delivery =
    subtotal >= FREE_DELIVERY_OVER ? 0 : /dhaka/i.test(city) ? 80 : 130;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setErrors({});

    try {
      const res = await request<{ data: { orderNumber: string } }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
          shipping: {
            fullName: String(form.get("fullName") ?? ""),
            phone: String(form.get("phone") ?? "").replace(/\s/g, ""),
            address: String(form.get("address") ?? ""),
            area: String(form.get("area") ?? ""),
            city: String(form.get("city") ?? ""),
            postcode: String(form.get("postcode") ?? ""),
            note: String(form.get("note") ?? ""),
          },
          paymentMethod: String(form.get("paymentMethod") ?? "cod"),
        }),
      });

      clear();
      toast.success(`Order ${res.data.orderNumber} placed`);
      router.push(`/track?order=${res.data.orderNumber}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.details ?? {});
        toast.error(
          error.status === 401
            ? "Please log in to place your order"
            : error.message
        );
        if (error.status === 401) router.push("/login");
      } else {
        toast.error("Could not reach the server. Is the API running?");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        {!isLoading && !isAuthenticated && (
          <p className="border-warning/50 bg-warning/10 rounded-xl border p-4 text-sm">
            You are not signed in.{" "}
            <Link href="/login?callbackUrl=/checkout" className="font-semibold underline">
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/register?callbackUrl=/checkout" className="font-semibold underline">
              create an account
            </Link>{" "}
            to place this order — it takes a few seconds and keeps your order
            history in one place.
          </p>
        )}

        <fieldset className="bg-card space-y-4 rounded-xl border p-5">
          <legend className="px-1 font-bold">Delivery details</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              name="fullName"
              defaultValue={user?.name ?? ""}
              error={errors["shipping.fullName"]}
              required
            />
            <Field
              label="Mobile number"
              name="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              defaultValue={user?.phone ?? ""}
              error={errors["shipping.phone"]}
              required
            />
          </div>

          <Field
            label="Street address"
            name="address"
            placeholder="House, road, block"
            error={errors["shipping.address"]}
            required
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Area" name="area" placeholder="Dhanmondi" />
            <div className="space-y-1.5">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                aria-invalid={Boolean(errors["shipping.city"])}
              />
              {errors["shipping.city"] && (
                <p className="text-destructive text-xs font-medium">
                  {errors["shipping.city"]}
                </p>
              )}
            </div>
            <Field label="Postcode" name="postcode" placeholder="1209" />
          </div>

          <Field label="Delivery note (optional)" name="note" placeholder="Landmark, gate code…" />
        </fieldset>

        <fieldset className="bg-card space-y-3 rounded-xl border p-5">
          <legend className="px-1 font-bold">Payment method</legend>
          <RadioGroup name="paymentMethod" defaultValue="cod">
            {PAYMENTS.map((option) => (
              <div key={option.value} className="flex items-start gap-2.5">
                <RadioGroupItem
                  value={option.value}
                  id={`pay-${option.value}`}
                  className="mt-1"
                />
                <Label
                  htmlFor={`pay-${option.value}`}
                  className="cursor-pointer flex-col items-start gap-0.5 font-normal"
                >
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-muted-foreground text-xs">{option.hint}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>
      </div>

      <aside className="bg-card h-fit rounded-xl border p-5 lg:sticky lg:top-32">
        <h2 className="mb-4 font-bold">Your order</h2>

        <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
          {items.map((item) => (
            <li key={item.slug} className="flex justify-between gap-3">
              <span className="line-clamp-2 min-w-0">
                {item.name}{" "}
                <span className="text-muted-foreground">× {item.quantity}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="tabular-nums">
              {delivery === 0 ? (
                <span className="text-success">Free</span>
              ) : (
                formatPrice(delivery)
              )}
            </dd>
          </div>
        </dl>

        <Separator className="my-4" />

        <div className="flex items-baseline justify-between">
          <span className="font-bold">Total</span>
          <span className="text-brand-strong dark:text-brand text-xl font-extrabold tabular-nums">
            {formatPrice(subtotal + delivery)}
          </span>
        </div>

        <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Lock />}
          {loading ? "Placing order…" : "Place order"}
        </Button>

        <p className="text-muted-foreground mt-3 text-center text-xs">
          You need an account to place an order — the final price is confirmed
          server-side.
        </p>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-destructive text-xs font-medium">{error}</p>}
    </div>
  );
}
