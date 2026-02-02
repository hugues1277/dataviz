// import { betterAuthProvider } from '../providers/betterAuthProvider';
// import logger from '../../shared/utils/logger';

// export interface AuthenticatedRequest {
//   sessionToken: string;
//   userId: string;
//   userEmail: string;
// }

// /**
//  * Vérifie l'authentification via Better Auth à partir des headers HTTP
//  * Lève une erreur si l'utilisateur n'est pas authentifié
//  */
// export async function getAuthenticationData(headers: Record<string, any>): Promise<AuthenticatedRequest> {
//   const cookieHeader = headers.cookie || '';

//   // Extraire le token de session depuis les cookies
//   const sessionToken = cookieHeader
//     .split(';')
//     .map((c: string) => c.trim())
//     .find((c: string) => c.startsWith('better-auth.session_token='))
//     ?.split('=')[1];

//   if (!sessionToken) {
//     throw new Error('Non authentifié : aucun token de session');
//   }

//   try {
//     // Vérifier la session avec Better Auth
//     const session = await betterAuthProvider.api.getSession({
//       headers: { cookie: `better-auth.session_token=${sessionToken}` },
//     });

//     if (!session?.user) {
//       throw new Error('Session invalide ou expirée');
//     }

//     return {
//       sessionToken,
//       userId: session.user.id,
//       userEmail: session.user.email,
//     };
//   } catch (error: unknown) {
//     logger.error('getAuthenticationData', error);
//     throw new Error('Session invalide ou expirée');
//   }
// }

// /**
//  * Middleware pour gérer les erreurs d'authentification de manière uniforme
//  */
// export function isAuthenticationError(error: Error): boolean {
//   return error.message.includes('authentifié') ||
//     error.message.includes('Session') ||
//     error.message.includes('token');
// }

