import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Neon's HTTP driver: one stateless request per query, no connection pool to
// keep alive between function invocations.
export const db = drizzle({
  client: neon(process.env.DATABASE_URL as string),
  schema,
});
