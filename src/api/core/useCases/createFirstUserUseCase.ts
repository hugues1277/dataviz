import { auth } from "@/lib/auth";
import { databaseProvider } from "@/src/api/providers/databaseProvider";
import { getUserCountUseCase } from "@/src/api/core/useCases/getUserCountUseCase";
import { getServerMessage } from "@/src/shared/messages/serverMessages";
import type { User } from "better-auth";

export interface CreateFirstUserInput {
  email: string;
  password: string;
  name?: string;
}

export interface CreateFirstUserOutput {
  user: User;
  success: boolean;
  message: string;
}

/**
 * Use case: Créer le premier utilisateur admin
 * Vérifie qu'aucun utilisateur n'existe avant de créer
 */
export const createFirstUserUseCase = {
  execute: async (
    input: CreateFirstUserInput
  ): Promise<CreateFirstUserOutput> => {
    if (!input.email || !input.password) {
      throw new Error(
        getServerMessage("exceptions.createFirstUser.emailPasswordRequired")
      );
    }

    const { hasUsers } = await getUserCountUseCase.execute();
    if (hasUsers) {
      throw new Error(
        getServerMessage("exceptions.createFirstUser.usersAlreadyExist")
      );
    }

    const response = await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.name || "Admin",
      },
    });

    if (!response?.user) {
      throw new Error("Erreur lors de la création de l'utilisateur");
    }

    const pool = databaseProvider.createPool();
    try {
      await pool.query(
        `UPDATE "user" SET "role" = 'admin' WHERE "id" = $1`,
        [response.user.id]
      );
    } finally {
      await pool.end();
    }

    return {
      success: true,
      user: response.user,
      message: getServerMessage("exceptions.createFirstUser.successMessage"),
    };
  },
};

