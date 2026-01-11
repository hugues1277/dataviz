import { Pool } from 'pg';
import { DBConnection, QueryResult } from '../../../shared/types/types';
import { QueryDbProvider } from '../../interfaces/queryDbProvider';

export const postgresQueryProvider: QueryDbProvider = {
    execute: async (connection: DBConnection, query: string): Promise<QueryResult> => {
        const pool = new Pool({
            host: connection.host,
            port: connection.port,
            database: connection.database,
            user: connection.user,
            password: connection.password,
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