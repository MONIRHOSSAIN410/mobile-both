import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import { API_URL } from "@/lib/api";

/**
 * One session for both sign-in paths.
 *
 * Google and email/password both end up calling the Express API, which returns
 * OUR JWT. That token rides along in the session as `backendToken`, so the
 * storefront can hit /api/orders on behalf of whoever is signed in — a Google
 * user and an email user are the same user document either way.
 */

interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  avatar: string;
  isVerified: boolean;
  provider?: string;
}

async function exchangeGoogleIdentity(payload: {
  providerAccountId: string;
  email: string;
  name: string;
  image?: string;
}) {
  const res = await fetch(`${API_URL}/auth/oauth`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-oauth-secret": process.env.AUTH_BRIDGE_SECRET ?? "",
    },
    body: JSON.stringify({ provider: "google", ...payload }),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.message ?? "Could not link your Google account");
  }

  const json = await res.json();
  return json.data as { user: BackendUser; token: string; needsPhone: boolean };
}

/**
 * Google is optional. Registering the provider without credentials makes every
 * call to /api/auth/* fail with "There was a problem with the server
 * configuration", which breaks the whole site — so only add it when both
 * values are present. `isGoogleEnabled` lets the UI hide the button to match.
 */
export const isGoogleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

const googleProvider = Google({
  clientId: process.env.AUTH_GOOGLE_ID,
  clientSecret: process.env.AUTH_GOOGLE_SECRET,
  allowDangerousEmailAccountLinking: true,
  authorization: {
    params: { prompt: "consent", access_type: "offline", scope: "openid email profile" },
  },
});

/**
 * Auth.js refuses to start without a secret, and the failure surfaces in the
 * browser as the unhelpful "There was a problem with the server configuration".
 * In development we fall back to a fixed value so a fresh clone just runs.
 */
const DEV_FALLBACK_SECRET = "mobile-shop-development-only-secret-do-not-ship";

/**
 * True when this is a real deployment that was started without AUTH_SECRET.
 * The site still runs (see `resolveSecret`), but sessions only survive as long
 * as the deployment does — so it is worth shouting about.
 */
export const authSecretMissing =
  process.env.NODE_ENV === "production" &&
  !process.env.AUTH_SECRET &&
  process.env.NEXT_PHASE !== "phase-production-build";

/**
 * A sign-in failure the UI can explain. Extending CredentialsSignin keeps
 * Auth.js on its normal error path instead of the "server configuration" one.
 */
export class SignInFailure extends CredentialsSignin {
  constructor(public code: string) {
    super(code);
  }
}

function resolveSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;

  // `next build` imports this module to collect route data. Nothing is signed
  // at that point, so a missing secret must not fail the build.
  const isBuilding = process.env.NEXT_PHASE === "phase-production-build";

  if (authSecretMissing) {
    /**
     * A deployment with no AUTH_SECRET used to throw here. That was worse than
     * the problem: this module is imported by the proxy and by the header, so
     * one missing variable turned every page of the site into a 500 — on
     * Vercel that reads as "the whole deploy is broken" rather than "you forgot
     * one setting". Now the site stays up on a per-deployment key: sign-in
     * works, sessions just do not survive the next deploy, and the log below
     * says exactly what to add and where.
     */
    console.error(
      "\n  ❌  AUTH_SECRET is not set.\n" +
        "      Vercel → Project → Settings → Environment Variables → add AUTH_SECRET,\n" +
        "      then redeploy. Generate one with:  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"\n" +
        "      Until then everyone is signed out again on every deployment.\n"
    );
    return `unset-auth-secret:${process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "local"}`;
  }

  if (!isBuilding) {
    console.warn(
      "\n  ⚠️  AUTH_SECRET is not set — using a development-only fallback.\n" +
        "      Run `npm run setup` in the project root to generate real secrets.\n"
    );
  }
  return DEV_FALLBACK_SECRET;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: resolveSecret(),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },

  providers: [
    ...(isGoogleEnabled ? [googleProvider] : []),

    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Anything thrown here that is NOT a CredentialsSignin surfaces to the
        // browser as "There was a problem with the server configuration",
        // which tells the user nothing. So every failure is classified.
        let res: Response;
        try {
          res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              email: String(credentials?.email ?? ""),
              password: String(credentials?.password ?? ""),
            }),
            cache: "no-store",
          });
        } catch (error) {
          console.error(`[auth] cannot reach ${API_URL}/auth/login —`, error);
          throw new SignInFailure("api_unreachable");
        }

        // Wrong email or password — the ordinary case.
        if (res.status === 401 || res.status === 400) return null;

        if (!res.ok) {
          console.error(`[auth] ${API_URL}/auth/login responded ${res.status}`);
          throw new SignInFailure("api_error");
        }

        const json = await res.json().catch(() => null);
        const user = json?.data?.user as BackendUser | undefined;
        const token = json?.data?.token as string | undefined;

        if (!user || !token) {
          console.error("[auth] login response was missing user or token", json);
          throw new SignInFailure("api_error");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar || null,
          backendToken: token,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Google: trade the verified identity for our own token, once, at sign-in.
      if (account?.provider === "google" && profile?.email) {
        const linked = await exchangeGoogleIdentity({
          providerAccountId: String(account.providerAccountId ?? profile.sub ?? ""),
          email: profile.email,
          name: (profile.name as string) ?? profile.email.split("@")[0],
          image: (profile.picture as string) ?? "",
        });

        token.backendToken = linked.token;
        token.userId = linked.user.id;
        token.role = linked.user.role;
        token.phone = linked.user.phone;
        token.needsPhone = linked.needsPhone;
        token.picture = linked.user.avatar || token.picture;
        token.name = linked.user.name;
      }

      // Credentials: authorize() already returned everything we need.
      if (user && "backendToken" in user) {
        token.backendToken = user.backendToken as string;
        token.userId = user.id as string;
        token.role = (user as { role?: string }).role;
        token.phone = (user as { phone?: string }).phone;
        token.needsPhone = !(user as { phone?: string }).phone;
      }

      return token;
    },

    async session({ session, token }) {
      session.backendToken = token.backendToken as string | undefined;
      if (session.user) {
        session.user.id = (token.userId as string) ?? "";
        session.user.role = (token.role as "customer" | "admin") ?? "customer";
        session.user.phone = (token.phone as string) ?? "";
        session.user.needsPhone = Boolean(token.needsPhone);
      }
      return session;
    },
  },
});
