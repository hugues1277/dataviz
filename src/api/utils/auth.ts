import { auth } from "@/lib/auth";
import logger from "@/src/shared/utils/logger";
import { getServerMessage } from "@/src/shared/messages/serverMessages";

export interface AuthenticatedRequest {
  sessionToken: string;
  userId: string;
  userEmail: string;
}

/**
 * Vérifie l'authentification via Better Auth à partir des headers HTTP
 * Lève une erreur si l'utilisateur n'est pas authentifié
 * 
 * Pour les server components/actions Next.js, utilisez directement:
 * const session = await auth.api.getSession({ headers: await headers() });
 */
export async function getAuthenticationData(headersRecord: Record<string, any>): Promise<AuthenticatedRequest> {
  try {
    // Utiliser l'API Better Auth avec les headers fournis
    const session = await auth.api.getSession({
      headers: headersRecord as HeadersInit,
    });

    if (!session?.user) {
      throw new Error(getServerMessage("exceptions.auth.invalidSession"));
    }

    // Extraire le token de session depuis les cookies pour compatibilité
    const cookieHeader = headersRecord.cookie || '';
    const sessionToken = cookieHeader
      .split(';')
      .map((c: string) => c.trim())
      .find((c: string) => c.startsWith('better-auth.session_token='))
      ?.split('=')[1] || '';

    return {
      sessionToken,
      userId: session.user.id,
      userEmail: session.user.email || '',
    };
  } catch (error: unknown) {
    logger.error('getAuthenticationData', error);
    throw new Error(getServerMessage("exceptions.auth.invalidSession"));
  }
}

/**
 * Middleware pour gérer les erreurs d'authentification de manière uniforme
 */
export function isAuthenticationError(error: Error): boolean {
  return (
    error.message.includes("authentifié") ||
    error.message.includes("Session") ||
    error.message.includes("token")
  );
}

