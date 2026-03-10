import { CONNECTION_TYPES, DBConnection } from '../../../shared/types/types';
import ConnectionRepository from '../../repositories/connectionRepository';
import { postgresQueryProvider } from '../../providers/queryDbConnectors/postgresQueryProvider';
import { apiQueryProvider } from '../../providers/queryDbConnectors/apiQueryProvider';
/**
 * Use case: Tester une connexion à une base de données ou une API
 * Vérifie que les paramètres de connexion sont valides
 */
export const testConnectionUseCase = {
  execute: async (connection: DBConnection): Promise<boolean> => {

    // Récupérer la connexion existante
    const existingConnection = await (new ConnectionRepository()).get(connection.id);

    if (connection.type === CONNECTION_TYPES.POSTGRES) {
      // Ajouter le mot de passe existant s'il manque
      if ((connection.password ?? "") === "") {
        connection.password = existingConnection?.password ?? "";
      }

      const result = await postgresQueryProvider.execute(connection, 'SELECT 1');
      if (!result) {
        throw new Error('Échec du test de connexion');
      }
    } else if (connection.type === CONNECTION_TYPES.API) {
      // Ajouter le mot de passe ou token existant s'il manque
      if ((connection.apiToken ?? "") === "") {
        connection.apiToken = existingConnection?.apiToken ?? "";
      }

      const result = await apiQueryProvider.execute(connection, 'SELECT 1');
      if (!result) {
        throw new Error('Échec du test de connexion');
      }
    }

    return true;
  },
};
