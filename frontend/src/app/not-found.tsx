import Link from "next/link";
import { Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-brand-strong dark:text-brand text-7xl font-extrabold tracking-tight">
        404
      </p>
      <h1 className="text-2xl font-bold">We could not find that page</h1>
      <p className="text-muted-foreground max-w-md">
        The product may have been renamed, sold out permanently, or the link is
        simply mistyped.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home /> Back to home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">
            <Search /> Browse all products
          </Link>
        </Button>
      </div>
    </div>
  );
}
