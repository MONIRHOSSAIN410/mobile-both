"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import { apiFetch } from "@/lib/api";

/**
 * apiFetch with the signed-in user's backend token attached.
 * Also reports whether a session exists, so callers can prompt for login
 * instead of firing a request that is guaranteed to 401.
 */
export function useApi() {
  const { data: session, status } = useSession();
  const token = session?.backendToken;

  const request = React.useCallback(
    <T,>(path: string, init?: RequestInit) => apiFetch<T>(path, init, token),
    [token]
  );

  return {
    request,
    token,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user,
  };
}
