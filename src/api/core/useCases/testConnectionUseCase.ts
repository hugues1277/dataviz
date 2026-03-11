import type { DBConnection } from "@/src/shared/types";
import { CONNECTION_TYPES } from "@/src/shared/types";
import ConnectionRepository from "@/src/api/repositories/connectionRepository";
import { postgresQueryProvider } from "@/src/api/providers/queryDbConnectors/postgresQueryProvider";
import { mysqlQueryProvider } from "@/src/api/providers/queryDbConnectors/mysqlQueryProvider";
import { apiQueryProvider } from "@/src/api/providers/queryDbConnectors/apiQueryProvider";

/**
 * Use case: Tester une connexion à une base de données ou une API
 * Vérifie que les paramètres de connexion sont valides
 */
export const testConnectionUseCase = {
  execute: async (connection: DBConnection): Promise<boolean> => {
    const connectionRepository = new ConnectionRepository();
    const existingConnection = await connectionRepository.get(connection.id);

    switch (connection.type) {
      case CONNECTION_TYPES.POSTGRES:
        if ((connection.password ?? "") === "") {
          connection.password = existingConnection?.password ?? "";
        }
        if (!(await postgresQueryProvider.execute(connection, "SELECT 1"))) {
          throw new Error("Échec du test de connexion");
        }
        break;
      case CONNECTION_TYPES.MYSQL:
        if ((connection.password ?? "") === "") {
          connection.password = existingConnection?.password ?? "";
        }
        if (!(await mysqlQueryProvider.execute(connection, "SELECT 1"))) {
          throw new Error("Échec du test de connexion");
        }
        break;
      case CONNECTION_TYPES.API:
        if ((connection.apiToken ?? "") === "") {
          connection.apiToken = existingConnection?.apiToken ?? "";
        }
        if (!(await apiQueryProvider.execute(connection, "SELECT 1"))) {
          throw new Error("Échec du test de connexion");
        }
        break;
    }

    return true;
  },
};
