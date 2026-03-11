import { databaseProvider } from '../../providers/databaseProvider';
import { runDbMigration } from '../../providers/dbMigration';
import logger from '../../../shared/utils/logger';
import UserRepository from '../../repositories/userRepository';
import { toast } from 'react-toastify';
import { t } from '../../../i18n/i18n';
/**
 * Use case: Récupérer le nombre d'utilisateurs
 * Vérifie si des utilisateurs existent dans la base de données
 */
export const getUserCountUseCase = {
    execute: async (): Promise<{ hasUsers: boolean; userCount: number }> => {
        try {
            const userRepository = new UserRepository();

            try {
                const userCount = await userRepository.getCount();
                return { hasUsers: userCount > 0, userCount };
            } catch (error: any) {
                if (error.code === "42P01" || error.message?.includes("does not exist")) {
                    // Créer les tables nécessaires
                    await runDbMigration();

                    return { hasUsers: false, userCount: 0 };
                } else {
                    throw error;
                }
            }
        } catch (error: unknown) {
            logger.error('getUserCountUseCase', error);
            toast.error(t('auth.getUserCountError'));
            throw new Error(t('auth.getUserCountError'));
        }
    }
};

