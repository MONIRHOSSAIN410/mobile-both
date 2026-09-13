"use client";

import * as React from "react";

const noopSubscribe = () => () => {};

/**
 * `false` during SSR and the hydration pass, `true` afterwards.
 * Built on useSyncExternalStore so it never triggers a cascading re-render —
 * use it before reading persisted client state (cart, wishlist, theme).
 */
export function useMounted() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
