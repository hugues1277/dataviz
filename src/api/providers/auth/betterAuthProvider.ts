// import { betterAuth } from "better-auth";
// import { databaseProvider } from "./databaseProvider";

// const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3001";

// // Secret pour signer les tokens JWT
// // En production, utilisez une valeur sécurisée générée aléatoirement
// // Vous pouvez générer un secret avec: openssl rand -base64 32
// const secret = process.env.BETTER_AUTH_SECRET || process.env.VITE_BETTER_AUTH_SECRET || "dev-secret-change-in-production-minimum-32-characters";

// /**
//  * Instance Better Auth serveur
//  * Utilisée pour les appels API côté serveur (pas de requête HTTP)
//  */
// export const betterAuthProvider = betterAuth({
//     secret,
//     baseURL,
//     database: databaseProvider.createPool(),
//     emailAndPassword: {
//         enabled: true,
//         disableSignUp: false, // Désactive le sign up, seul le sign in est autorisé
//     },
//     trustedOrigins: [baseURL],
//     advanced: {
//         // Configuration des cookies pour le développement local
//         crossSubDomainCookies: {
//             enabled: false, // Désactivé pour localhost
//         },
//         cookiePrefix: "better-auth",
//     },
//     session: {
//         expiresIn: 60 * 60 * 24 * 7, // 7 jours
//         updateAge: 60 * 60 * 24, // Mettre à jour la session tous les jours
//     },
// });

