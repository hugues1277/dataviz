import { Pool } from 'pg';
import "dotenv/config";
import { getRequestRole } from '../utils/requestContext';

const DATABASE_URL = process.env.DATABASE_URL;

let sharedPool: Pool | null = null;

function getPool(): Pool {
    if (!sharedPool) {
        sharedPool = new Pool({
            connectionString: DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
        });
    }
    return sharedPool;
}

/**
 * Exécute une requête avec le rôle utilisateur pour les policies RLS.
 * Utilise app.user_role (SET LOCAL) avant la requête.
 */
export async function queryWithRole<T = unknown>(
    text: string,
    values?: unknown[]
): Promise<{ rows: T[] }> {
    const pool = getPool();
    const client = await pool.connect();
    try {
        const role = getRequestRole();
        if (role) {
            await client.query('SET LOCAL app.user_role = $1', [role]);
        }
        const result = await client.query(text, values);
        return { rows: result.rows as T[] };
    } finally {
        client.release();
    }
}

/**
 * Provider pour la connexion à la base de données PostgreSQL
 * Centralise la configuration de la connexion
 */
export const databaseProvider = {
    createPool: () => {
        return new Pool({
            connectionString: DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
        });
    },
    queryWithRole,
};

