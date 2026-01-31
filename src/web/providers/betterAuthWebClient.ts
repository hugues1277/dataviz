import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.VITE_BETTER_AUTH_URL ?? window.location.origin;

const DISABLE_AUTH = import.meta.env.VITE_IS_TAURI_APP === 'true';

const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include", // important : send cookies with each request
  },
});

const mockAuthClient = {
  signIn: async () => {
    return {
      error: null,
      data: null,
    };
  },
  signOut: async () => {
    return {
      error: null,
      data: null,
    };
  },
  useSession: () => {
    return {
      data: {
        user: {
          sessionToken: '1234567890',
          userId: '0',
          userEmail: 'auth@email.com',
        }
      },
      error: null,
      isPending: false,
    };
  },
};

export const { signIn, signOut, useSession } = DISABLE_AUTH ? mockAuthClient : authClient;

export const isDisabledAuth = DISABLE_AUTH;