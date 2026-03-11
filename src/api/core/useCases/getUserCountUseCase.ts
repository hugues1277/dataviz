import { runDbMigration } from "@/src/api/providers/dbMigration";
import UserRepository from "@/src/api/repositories/userRepository";
import { getServerMessage } from "@/src/shared/messages/serverMessages";
import logger from "@/src/shared/utils/logger";

function isTablesMissingError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  return (
    err?.code === "42P01" ||
    (typeof err?.message === "string" && err.message.includes("does not exist"))
  );
}

/**
 * Use case: Récupérer le nombre d'utilisateurs
 * Vérifie si des utilisateurs existent dans la base de données
 */
export const getUserCountUseCase = {
  execute: async (): Promise<{
    hasUsers: boolean;
    userCount: number;
  }> => {
    try {
      const userRepository = new UserRepository();
      const userCount = await userRepository.getCount();
      return { hasUsers: userCount > 0, userCount };
    } catch (error: unknown) {
      if (isTablesMissingError(error)) {
        await runDbMigration();
        return { hasUsers: false, userCount: 0 };
      }
      logger.error("getUserCountUseCase", error);
      throw new Error(getServerMessage("auth.getUserCountError"));
    }
  },
};

