import { PlugZap } from "lucide-react";

import { API_URL } from "@/lib/api";

/**
 * Shown when the storefront could not reach the Express API at all. It is
 * deliberately specific — "no products found" would send you hunting through
 * filters when the real problem is that the backend is not running.
 *
 * There are two very different versions of "not running", and telling them
 * apart is the whole point: on your laptop the backend is usually just not
 * started, while on a deployment it is almost always that NEXT_PUBLIC_API_URL
 * was never set, so the server is dutifully calling its own localhost.
 */
export function ApiOffline({ className }: { className?: string }) {
  const isDeployed = process.env.NODE_ENV === "production";
  const apiUrlUnset = !process.env.NEXT_PUBLIC_API_URL;
  const misconfiguredDeployment = isDeployed && apiUrlUnset;

  const box =
    className ??
    "border-warning/50 bg-warning/10 flex flex-col items-start gap-3 rounded-xl border p-6";
  const code = "bg-muted rounded px-1.5 py-0.5 text-xs";

  return (
    <div className={box}>
      <span className="flex items-center gap-2 font-bold">
        <PlugZap className="text-warning size-5" />
        {misconfiguredDeployment
          ? "This deployment has no API address"
          : "Cannot reach the API"}
      </span>

      {misconfiguredDeployment ? (
        <>
          <p className="text-muted-foreground text-sm">
            <code className={code}>NEXT_PUBLIC_API_URL</code> is not set, so the
            site fell back to <code className={code}>{API_URL}</code> — which,
            from a server, means the server itself. Nothing is wrong with the
            build or your filters.
          </p>

          <ol className="text-muted-foreground list-decimal space-y-1.5 pl-5 text-sm">
            <li>Deploy the backend (see section 3 of the README).</li>
            <li>
              In your hosting dashboard add{" "}
              <code className={code}>NEXT_PUBLIC_API_URL</code> ={" "}
              <code className={code}>https://your-backend/api</code>.
            </li>
            <li>
              Redeploy — <code className={code}>NEXT_PUBLIC_*</code> values are
              baked in at build time, so a restart alone is not enough.
            </li>
          </ol>
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            The storefront asked <code className={code}>{API_URL}</code> for
            products and got no answer. Nothing is wrong with your filters.
          </p>

          <ol className="text-muted-foreground list-decimal space-y-1.5 pl-5 text-sm">
            <li>
              Create the environment files once —{" "}
              <code className={code}>npm run setup</code> in the project root.
            </li>
            <li>Start MongoDB (or check your Atlas connection string).</li>
            <li>
              <code className={code}>cd backend</code> →{" "}
              <code className={code}>npm run seed</code> →{" "}
              <code className={code}>npm run dev</code>
            </li>
            <li>
              Confirm it is up: <code className={code}>{API_URL}/health</code>
            </li>
          </ol>
        </>
      )}
    </div>
  );
}
