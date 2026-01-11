import { Pool } from 'pg';
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;

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
};

