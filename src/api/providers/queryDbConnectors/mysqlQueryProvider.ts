import mysql from 'mysql2/promise';
import { DBConnection, QueryResult } from '../../../shared/types/types';
import { DbQueryProviderInterface } from '../../interfaces/dbQueryProviderInterface';

export const mysqlQueryProvider: DbQueryProviderInterface = {
    execute: async (connection: DBConnection, query: string): Promise<QueryResult> => {
        if (!connection.host || !connection.database || !connection.user) {
            throw new Error('Connexion MySQL non définie');
        }

        const pool = mysql.createPool({
            host: connection.host,
            port: connection.port || 3306,
            database: connection.database,
            user: connection.user,
            password: connection.password || '',
            ssl: connection.ssl ? { rejectUnauthorized: false } : undefined,
            connectTimeout: 10000,
        });

        try {
            const [rows] = await pool.execute(query);
            const rowArray = Array.isArray(rows) ? rows : [];
            const columns = rowArray.length > 0 ? Object.keys((rowArray[0] as Record<string, unknown>)) : [];

            return {
                columns,
                rows: rowArray as Record<string, unknown>[],
            };
        } finally {
            await pool.end();
        }
    },
};
