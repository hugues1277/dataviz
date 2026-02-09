import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Route API Better Auth pour Next.js App Router
 * Gère tous les endpoints Better Auth (sign-in, sign-up, get-session, etc.)
 */
export const { GET, POST } = toNextJsHandler(auth);
