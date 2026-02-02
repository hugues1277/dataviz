import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.VITE_BETTER_AUTH_URL ?? window.location.origin;

export const betterAuthWebClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include", // important : send cookies with each request
  },
});