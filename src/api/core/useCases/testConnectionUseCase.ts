import { CONNECTION_TYPES, DBConnection } from '../../../shared/types/types';
import ConnectionRepository from '../../repositories/connectionRepository';
import { postgresQueryProvider } from '../../providers/queryDbConnectors/postgresQueryProvider';
import { apiQueryProvider } from '../../providers/queryDbConnectors/apiQueryProvider';
/**
 * Use case: Tester une connexion à une base de données ou une API
 * Vérifie que les paramètres de connexion sont valides
 */
export const testConnectionUseCase = {
  execute: async (connection: DBConnection): Promise<void> => {

    // get existing connection
    const existingConnection = await (new ConnectionRepository()).get(connection.id);

    if (connection.type === CONNECTION_TYPES.POSTGRES) {
      // add existing password if missing
      if ((connection.password ?? "") === "") {
        connection.password = existingConnection?.password ?? "";
      }

      const result = await postgresQueryProvider.execute(connection, 'SELECT 1');
      if (!result) {
        throw new Error('Failed to test connection');
      }
    } else

      if (connection.type === CONNECTION_TYPES.API) {
        // add existing pass or token if missing
        if ((connection.apiToken ?? "") === "") {
          connection.apiToken = existingConnection?.apiToken ?? "";
        }

        const result = await apiQueryProvider.execute(connection, 'SELECT 1');
        if (!result) {
          throw new Error('Failed to test connection');
        }
      }
  },
};
