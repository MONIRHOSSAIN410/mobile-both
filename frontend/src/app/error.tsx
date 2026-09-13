"use client";

import * as React from "react";
import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <Button onClick={reset}>
        <RefreshCcw /> Try again
      </Button>
    </div>
  );
}
