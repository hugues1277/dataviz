import { getAuthenticationData } from "@/src/api/utils/auth";
import UserRepository, { UserWithRole } from "@/src/api/repositories/userRepository";
import { getServerMessage } from "@/src/shared/messages/serverMessages";
import type { UserRole } from "@/src/api/types";

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
