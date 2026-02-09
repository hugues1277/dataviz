import { auth } from "../../../lib/auth";

/**
 * Instance Better Auth serveur
 * Réexporte l'instance auth depuis lib/auth.ts pour compatibilité avec le code existant
 * Utilisée pour les appels API côté serveur (pas de requête HTTP)
 * 
 * @deprecated Utilisez directement `auth` depuis `@/lib/auth` dans les nouveaux fichiers
 */
export const betterAuthProvider = auth;

