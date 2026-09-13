import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Sends signed-out visitors to /login before they reach an account page, with
 * a callbackUrl so they land back where they were headed.
 *
 * This only checks that a session cookie exists — the real check happens in
 * the API, which validates the JWT on every protected route.
 */
const PROTECTED = ["/account", "/checkout"];

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const signedIn = SESSION_COOKIES.some((name) =>
    Boolean(request.cookies.get(name)?.value)
  );
  if (signedIn) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?callbackUrl=${encodeURIComponent(pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*"],
};
