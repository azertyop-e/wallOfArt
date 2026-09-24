import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Every Better Auth endpoint (sign-up, sign-in, sign-out, get-session…) is
// served from this catch-all route: /api/auth/*.
export const { GET, POST } = toNextJsHandler(auth);
