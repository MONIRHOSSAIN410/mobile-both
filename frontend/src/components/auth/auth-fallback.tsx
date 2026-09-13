/** Placeholders shown while the search-param-aware auth widgets hydrate. */

export function AuthButtonFallback() {
  return <div className="bg-muted h-11 w-full animate-pulse rounded-md" />;
}

export function AuthFormFallback() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="bg-muted h-3.5 w-24 animate-pulse rounded" />
          <div className="bg-muted h-10 w-full animate-pulse rounded-md" />
        </div>
      ))}
      <div className="bg-muted h-11 w-full animate-pulse rounded-md" />
    </div>
  );
}
