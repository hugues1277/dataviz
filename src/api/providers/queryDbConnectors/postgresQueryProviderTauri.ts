import { invoke } from '@tauri-apps/api/core';
import { DBConnection, QueryResult } from '../../../shared/types/types';
import { DbQueryProviderInterface } from '../../interfaces/dbQueryProviderInterface';

/**
 * Provider PostgreSQL compatible Tauri
 * Appelle une commande Tauri (Rust) pour exécuter les requêtes PostgreSQL
 */
export const postgresQueryProviderTauri: DbQueryProviderInterface = {
    execute: async (connection: DBConnection, query: string): Promise<QueryResult> => {
        if (!connection.host || !connection.database || !connection.user) {
            throw new Error('Connexion PostgreSQL non définie');
        }

        console.log('execute: postgresQueryProviderTauri', { connection, query });
        try {
            // Appeler la commande Tauri pour exécuter la requête PostgreSQL
            const result = await invoke<QueryResult>('execute_postgres_query', {
                connection: {
                    host: connection.host,
                    port: connection.port || 5432,
                    database: connection.database,
                    user: connection.user,
                    password: connection.password || '',
                    ssl: connection.ssl || false,
                },
                query: query,
            });

            return result;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Erreur lors de l'exécution de la requête PostgreSQL: ${errorMessage}`);
        }
    },
}
