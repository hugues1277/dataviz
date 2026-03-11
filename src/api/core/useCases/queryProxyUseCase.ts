import ConnectionRepository from "@/src/api/repositories/connectionRepository";
import {
  CONNECTION_TYPES,
  type QueryResult,
  isDatabaseType,
} from "@/src/shared/types";
import { queryProxyService } from "@/src/api/core/services/queryProxyService";
import { apiQueryProvider } from "@/src/api/providers/queryDbConnectors/apiQueryProvider";
import { postgresQueryProvider } from "@/src/api/providers/queryDbConnectors/postgresQueryProvider";
import { mysqlQueryProvider } from "@/src/api/providers/queryDbConnectors/mysqlQueryProvider";

export interface QueryProxyInput {
  connectionId: string;
  query: string;
}

function removeCommentsFromQuery(query: string): string {
  return query.replace(/--.*\n/g, "");
}

/**
 * Use case: Exécuter une requête SQL sur une base de données externe
 * Établit une connexion temporaire et exécute la requête
 */
export const queryProxyUseCase = {
  execute: async (input: QueryProxyInput): Promise<QueryResult> => {
    const query = removeCommentsFromQuery(input.query);

    const connectionRepository = new ConnectionRepository();
    const connection = await connectionRepository.get(input.connectionId, {
      decrypt: true,
    });

    if (!connection) {
      throw new Error("Connexion non trouvée");
    }

    if (
      isDatabaseType(connection.type) &&
      !queryProxyService.isAllowedQuery(
        query,
        connection.type as "postgres" | "mysql"
      )
    ) {
      throw new Error("Requête non autorisée ou au mauvais format");
    }

    if (!input.connectionId || !query) {
      throw new Error("Paramètres de connexion ou requête manquants");
    }

    switch (connection.type) {
      case CONNECTION_TYPES.API:
        return await apiQueryProvider.execute(connection, query);
      case CONNECTION_TYPES.POSTGRES:
        return await postgresQueryProvider.execute(connection, query);
      case CONNECTION_TYPES.MYSQL:
        return await mysqlQueryProvider.execute(connection, query);
      default:
        throw new Error("Type de connexion non supporté");
    }
  },
};
