import { getAuthenticationData } from "./auth";
import UserRepository, { UserWithRole } from "../repositories/userRepository";
import { getServerMessage } from "../../shared/messages/serverMessages";
import { setRequestRole } from "./requestContext";

export type UserRole = "admin" | "edit" | "read";

export interface AuthWithRole {
  userId: string;
  userEmail: string;
  role: UserRole;
}

/**
 * Récupère l'auth + le rôle de l'utilisateur connecté.
 * Définit le rôle dans le contexte pour les policies RLS.
 */
export async function getAuthWithRole(headers: HeadersInit): Promise<AuthWithRole> {
  const headersRecord =
    headers instanceof Headers
      ? Object.fromEntries((headers as Headers).entries())
      : (headers as Record<string, any>);
  const auth = await getAuthenticationData(headersRecord);
  const userRepository = new UserRepository();
  const user = (await userRepository.get(auth.userId)) as UserWithRole | null;

  const role = (user?.role as UserRole) || "edit";
  setRequestRole(role);

  return {
    userId: auth.userId,
    userEmail: auth.userEmail,
    role,
  };
}

/**
 * Vérifie que l'utilisateur a le droit d'écriture (edit ou admin).
 * Les utilisateurs "read" ne peuvent pas modifier dashboards, charts, connections.
 */
export async function requireEditOrAdmin(headers: HeadersInit): Promise<AuthWithRole> {
  const auth = await getAuthWithRole(headers);
  if (auth.role === "read") {
    throw new Error(getServerMessage("exceptions.users.readOnly"));
  }
  return auth;
}
