import { DBConnection, QueryResult } from '../../shared/types/types';
import logger from '../../shared/utils/logger';
import { IQueryRequestProvider } from '../interfaces/IQueryRequestProvider';

export class QueryRequestProvider implements IQueryRequestProvider {
  /**
   * Exécute une requête via le proxy API
   */
  private async executeQueryProxy(connection: DBConnection, sql: string): Promise<QueryResult> {
    try {
      const response = await fetch('/api/query-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: connection.id,
          query: sql
        })
      });

      if (!response.ok) {
        let errorMessage = `Erreur Proxy ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Si la réponse n'est pas du JSON, utiliser le texte
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error: unknown) {
      logger.error('executeQueryProxy', error);

      // Améliorer les messages d'erreur pour les erreurs réseau
      const errorMessage = logger.getErrorMessage(error);
      throw new Error(`Impossible de se connecter au proxy de requête. Error: ${errorMessage}`);
    }
  }

  /**
   * Formate une valeur pour l'injection SQL sécurisée
   */
  private formatSqlValue(value: string): string {
    if (value === 'true' || value === 'false') {
      return value.toUpperCase();
    }
    if (isNaN(Number(value)) || value === '') {
      return `'${value}'`;
    }
    return value;
  }

  /**
   * Remplace les variables dans une requête SQL par leurs valeurs formatées
   */
  private replaceVariablesInQuery(sql: string, variables: Record<string, string>): string {
    let processedSql = sql;

    Object.entries(variables).forEach(([name, value]) => {
      const regex = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
      const formattedValue = this.formatSqlValue(value);
      processedSql = processedSql.replace(regex, formattedValue);
    });

    // Vérifier qu'il ne reste plus de variables non remplacées
    if (processedSql.includes('{') || processedSql.includes('}')) {
      throw new Error('Une variable n\'existe pas dans la requête');
    }

    return processedSql;
  }

  /**
   * Génère une clé de cache pour une requête en filtrant les variables non utilisées
   */
  getQueryKey(chartId: string, query: string, variables: Record<string, string>): string[] {
    const filteredVariables = Object.fromEntries(
      Object.entries(variables).filter(([key, value]) => {
        if ((value ?? '') === '') return false;
        return query.includes(`{{${key}}}`);
      }),
    );

    return ['query', chartId, query, JSON.stringify(filteredVariables)];
  }

  /**
   * Exécute une requête SQL via une connexion (API ou PostgreSQL)
   */
  async executeQuery(
    connection: DBConnection,
    sql: string,
    variables?: Record<string, string>
  ): Promise<QueryResult> {
    try {
      // Remplacement des variables dans la requête
      const processedSql = variables
        ? this.replaceVariablesInQuery(sql, variables)
        : sql;

      return await this.executeQueryProxy(connection, processedSql);

    } catch (error: unknown) {
      logger.error('executeQuery', error);

      return {
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : (error as string),
      };
    }
  }

  async testConnection(connection: DBConnection): Promise<boolean> {
    try {
      const response = await fetch(`/api/connections/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connection),
      });

      if (!response.ok) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

export const queryRequestProvider = new QueryRequestProvider();