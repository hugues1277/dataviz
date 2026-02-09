import { Pool } from 'pg';
import { DBConnection, QueryResult } from '../../../shared/types/types';
import { DbQueryProviderInterface } from '../../interfaces/dbQueryProviderInterface';

export const postgresQueryProvider: DbQueryProviderInterface = {
    execute: async (connection: DBConnection, query: string): Promise<QueryResult> => {
        if (!connection.host || !connection.database || !connection.user) {
            throw new Error('Connexion PostgreSQL non définie');
        }

        const pool = new Pool({
            host: connection.host,
            port: connection.port || 5432,
            database: connection.database,
            user: connection.user,
            password: connection.password || '',
            ssl: connection.ssl ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 10000,
        });

        try {
            const result = await pool.query(query);
            const columns = result.rows.length > 0 ? Object.keys(result.rows[0]) : [];

            return {
                columns,
                rows: result.rows,
            };
        } finally {
            await pool.end();
        }
    },
}