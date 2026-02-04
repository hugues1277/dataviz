/**
 * Détecte si l'application s'exécute dans Tauri
 */
// export function isTauri(): boolean {
//   return typeof window !== 'undefined' && '__TAURI__' in window;
// }

// /**
//  * Détecte si l'application s'exécute dans un navigateur web
//  */
// export function isWeb(): boolean {
//   return !isTauri();
// }

// /**
//  * Obtient la plateforme actuelle
//  */
// export function getPlatform(): 'tauri' | 'web' {
//   return isTauri() ? 'tauri' : 'web';
// }


// platform.ts
export const isTauri = true;
// typeof window !== 'undefined' &&
// '__TAURI__' in window;

export const isNode =
  typeof process !== 'undefined' &&
  process.versions?.node != null;