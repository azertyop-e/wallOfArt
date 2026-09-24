import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  // Resolved from the request host, so the same config works locally, on
  // Vercel previews and in production. Unlisted hosts are rejected.
  baseURL: {
    allowedHosts: ["localhost:*", "*.vercel.app"],
  },
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // Lets Server Actions set the session cookie; must stay the last plugin.
  plugins: [nextCookies()],
});
