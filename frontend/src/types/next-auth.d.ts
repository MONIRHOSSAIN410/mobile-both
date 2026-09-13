import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    /** Our own API token, minted by the Express backend at sign-in. */
    backendToken?: string;
    user: {
      id: string;
      role: "customer" | "admin";
      phone: string;
      /** True for a Google sign-in that has no mobile number yet. */
      needsPhone: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    backendToken?: string;
    role?: "customer" | "admin";
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    userId?: string;
    role?: "customer" | "admin";
    phone?: string;
    needsPhone?: boolean;
  }
}

export {};
