import { databaseProvider } from '../../providers/databaseProvider';
import { runDbMigration } from '../../providers/dbMigration';
import logger from '../../../shared/utils/logger';

/**
 * Use case: Récupérer le nombre d'utilisateurs
 * Vérifie si des utilisateurs existent dans la base de données
 */
export const getUserCountUseCase = {
    execute: async (): Promise<{ hasUsers: boolean; userCount: number }> => {
        try {
            const pool = databaseProvider.createPool();

            try {
                const result = await pool.query(`
                    SELECT COUNT(*) as count 
                    FROM "user"
                `);

                const userCount = parseInt(result.rows[0]?.count || "0", 10);
                const hasUsers = userCount > 0;

                await pool.end();
                return { hasUsers, userCount };
            } catch (error: any) {
                logger.error('getUserCountUseCase', error);

                if (error.code === "42P01" || error.message?.includes("does not exist")) {
                    // Les tables n'existent pas encore
                    await pool.end();
                    // Créer les tables nécessaires
                    await runDbMigration();

                    return { hasUsers: false, userCount: 0 };
                } else {
                    throw error;
                }
            }
        } catch (error: unknown) {
            logger.error('getUserCountUseCase', error);
            throw new Error("Erreur lors de la vérification des utilisateurs");
        }
    }
};

