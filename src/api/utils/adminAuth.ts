import { getAuthenticationData } from "./auth";
import UserRepository, { UserWithRole } from "../repositories/userRepository";
import { getServerMessage } from "../../shared/messages/serverMessages";

export type UserRole = "admin" | "read" | "edit";

/**
 * Vérifie que l'utilisateur connecté est admin (role === "admin" en base).
 */
export async function requireAdmin(headers: HeadersInit) {
  const headersRecord =
    headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : (headers as Record<string, any>);
  const auth = await getAuthenticationData(headersRecord);
  const userRepository = new UserRepository();
  const user = (await userRepository.get(auth.userId)) as UserWithRole | null;

  if (!user || user.role !== "admin") {
    throw new Error(getServerMessage("exceptions.users.forbidden"));
  }

  return { auth, user };
}
