import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { databaseProvider } from "../src/api/providers/databaseProvider";

// BaseURL pour Better Auth - utilise la variable d'environnement ou l'URL de production
// En développement, Next.js utilise généralement le port 3000
const baseURL = process.env.BETTER_AUTH_URL || process.env.PRODUCTION_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

/**
 * Configuration Better Auth pour Next.js App Router
 * Utilise nextCookies() pour gérer les cookies dans les server actions
 */
export const auth = betterAuth({
  baseURL,
  database: databaseProvider.createPool(),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "edit",
        input: false, // Seul l'admin peut modifier via l'API
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
  },
  trustedOrigins: ["*"],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // Mettre à jour la session tous les jours
  },
  plugins: [
    nextCookies() // Enable cookies in server actions
  ],
});
