import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.VITE_BETTER_AUTH_URL ?? window.location.origin;

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include", // Important : envoyer les cookies avec chaque requête
  },
});

export const { signIn, signOut, useSession } = authClient;
