import { Pool } from 'pg';
import "dotenv/config";
import { runMigrationsAsync } from './pgMigrationService';

const DATABASE_URL = process.env.DATABASE_URL;

/**
 * Provider pour la connexion à la base de données PostgreSQL
 * Centralise la configuration de la connexion et gère les migrations
 */
export const databaseProvider = {
    createPool: () => {
        const pool = new Pool({
            connectionString: DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
        });

        // Exécuter les migrations de manière non bloquante lors de la première création du pool
        runMigrationsAsync(pool);

        return pool;
    },
};

