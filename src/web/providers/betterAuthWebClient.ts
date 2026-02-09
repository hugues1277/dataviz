"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Client Better Auth pour React
 * Le baseURL est optionnel si le serveur auth est sur le même domaine
 * Par défaut, utilise l'origine de la fenêtre courante
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || undefined, // Optionnel si même domaine
  fetchOptions: {
    credentials: "include", // Important : envoyer les cookies avec chaque requête
  },
});

export const { signIn, signOut, useSession } = authClient;
