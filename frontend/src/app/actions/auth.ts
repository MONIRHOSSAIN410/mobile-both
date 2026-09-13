"use server";

import { signIn, signOut } from "@/auth";

/** Kicks off the Google OAuth round-trip. */
export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: callbackUrl || "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
