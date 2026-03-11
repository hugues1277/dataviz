import { AsyncLocalStorage } from "async_hooks";
import type { UserRole } from "@/src/api/types";

const asyncLocalStorage = new AsyncLocalStorage<UserRole>();

/**
 * Définit le rôle de l'utilisateur pour le contexte de requête.
 * Utilisé par getAuthWithRole pour que les policies RLS puissent lire app.user_role.
 */
export function setRequestRole(role: UserRole): void {
  asyncLocalStorage.enterWith(role);
}

/**
 * Récupère le rôle du contexte de requête actuel.
 */
export function getRequestRole(): UserRole | undefined {
  return asyncLocalStorage.getStore();
}
