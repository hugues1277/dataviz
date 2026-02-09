import { auth } from '../../../../lib/auth';
import { getUserCountUseCase } from './getUserCountUseCase';
import i18n from '../../../i18n/i18n-server';

export interface CreateFirstUserInput {
  email: string;
  password: string;
  name: string;
}

export interface CreateFirstUserOutput {
  user: any;
  success: boolean;
  message: string;
}

/**
 * Use case: Créer le premier utilisateur admin
 * Vérifie qu'aucun utilisateur n'existe avant de créer
 */
export const createFirstUserUseCase = {
  execute: async (input: CreateFirstUserInput): Promise<CreateFirstUserOutput> => {
    if (!input.email || !input.password) {
      throw new Error(i18n.t('exceptions.createFirstUser.emailPasswordRequired'));
    }

    // Vérifier d'abord s'il y a déjà des utilisateurs
    const { hasUsers } = await getUserCountUseCase.execute();

    if (hasUsers) {
      throw new Error(i18n.t('exceptions.createFirstUser.usersAlreadyExist'));
    }

    // Créer le premier utilisateur en utilisant l'API serveur Better Auth
    // auth.api.signUpEmail gère automatiquement le hash du mot de passe
    const response = await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.name || 'Admin',
      },
    });

    return {
      success: true,
      user: response.user,
      message: i18n.t('exceptions.createFirstUser.successMessage'),
    };
  },
};

