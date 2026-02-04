import { DBConnection, QueryResult } from '../../../shared/types/types';

/**
 * Interface commune pour les providers de requêtes
 */
export interface IQueryProvider {
  /**
   * Exécute une requête SQL via une connexion
   */
  executeQuery(
    connection: DBConnection,
    sql: string,
    variables?: Record<string, string>
  ): Promise<QueryResult>;

  /**
   * Génère une clé de cache pour une requête en filtrant les variables non utilisées
   */
  getQueryKey(chartId: string, query: string, variables: Record<string, string>): string[];
}
