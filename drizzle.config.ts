import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Reads .env.local like Next does (DATABASE_URL comes from `vercel env pull`).
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Direct (unpooled) connection, recommended by Neon for migrations.
    url: (process.env.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL) as string,
  },
});
