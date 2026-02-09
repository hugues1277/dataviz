"use client";

import { createAuthClient } from "better-auth/react";

const baseURL =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    : null) ?? (typeof window !== "undefined" ? window.location.origin : "");

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include", // Important : envoyer les cookies avec chaque requête
  },
});

export const { signIn, signOut, useSession } = authClient;
