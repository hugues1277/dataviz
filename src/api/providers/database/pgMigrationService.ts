import { Pool, PoolClient } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import logger from '../../../shared/utils/logger';

/**
 * Interface pour représenter une migration
 */
export interface Migration {
    id: string;
    name: string;
    sql: string;
}

// Détection de l'environnement pour PGLite
const isBrowser = typeof window !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions?.node;

/**
 * Obtient le chemin du dossier de migrations PostgreSQL
 */
async function getPgMigrationsDir(): Promise<string> {
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, 'migrations');
}

/**
 * Lit tous les fichiers de migration depuis le dossier migrations
 */
async function loadPgMigrations(): Promise<Migration[]> {
    const path = await import('path');
    const { readdirSync, readFileSync } = await import('fs');
    const migrationsDir = await getPgMigrationsDir();

    // Lire tous les fichiers .sql du dossier migrations
    const files = readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Trier par ordre alphabétique (000, 001, 002, etc.)

    const migrations: Migration[] = [];

    for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const sql = readFileSync(filePath, 'utf-8');
        const name = file.replace('.sql', '');

        // Extraire l'ID de migration depuis le nom du fichier (ex: 001_initial_tables -> 001)
        const id = name.split('_')[0];

        migrations.push({
            id,
            name,
            sql: sql.trim(),
        });
    }

    return migrations;
}

/**
 * Vérifie quelles migrations ont déjà été exécutées
 */
async function getExecutedPgMigrations(client: PoolClient): Promise<Set<string>> {
    try {
        const result = await client.query('SELECT id FROM migrations ORDER BY id');
        return new Set(result.rows.map((row: any) => row.id));
    } catch (error: unknown) {
        // Si la table migrations n'existe pas encore, retourner un Set vide
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
            return new Set();
        }
        throw error;
    }
}

/**
 * Enregistre une migration comme exécutée
 */
async function markPgMigrationAsExecuted(client: PoolClient, migration: Migration): Promise<void> {
    try {
        await client.query(
            'INSERT INTO migrations (id, name) VALUES ($1, $2)',
            [migration.id, migration.name]
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Si la table migrations n'existe pas encore (cas de la migration 000), la créer d'abord
        if (errorMessage.includes('does not exist') || (errorMessage.includes('relation') && errorMessage.includes('does not exist'))) {
            // Créer la table migrations si elle n'existe pas
            await client.query(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
                )
            `);
            // Réessayer l'insertion
            await client.query(
                'INSERT INTO migrations (id, name) VALUES ($1, $2)',
                [migration.id, migration.name]
            );
        } else {
            throw error;
        }
    }
}

/**
 * Exécute les migrations non exécutées
 */
async function runPgMigrations(pool: Pool): Promise<void> {
    logger.info('pgMigrationService: Chargement des migrations...');

    const migrations = await loadPgMigrations();

    // S'assurer que la migration 000 (table migrations) est en premier
    migrations.sort((a, b) => a.id.localeCompare(b.id));

    // Obtenir une connexion client du pool
    const client = await pool.connect();

    try {
        // Vérifier si la table migrations existe
        let executedMigrations: Set<string>;
        try {
            executedMigrations = await getExecutedPgMigrations(client);
        } catch (error: unknown) {
            // Si la table migrations n'existe pas, on commence avec un Set vide
            executedMigrations = new Set();
        }

        logger.info(`pgMigrationService: ${migrations.length} migration(s) trouvée(s), ${executedMigrations.size} déjà exécutée(s)`);

        for (const migration of migrations) {
            // Vérifier si la migration a déjà été exécutée
            if (executedMigrations.has(migration.id)) {
                logger.info(`pgMigrationService: Migration ${migration.id} (${migration.name}) déjà exécutée, ignorée`);
                continue;
            }

            logger.info(`pgMigrationService: Exécution de la migration ${migration.id} (${migration.name})...`);

            try {
                // Pour la migration 000 (création de la table migrations), ne pas utiliser de transaction
                // car si la transaction échoue, la table ne sera jamais créée
                const isMigration000 = migration.id === '000';

                if (!isMigration000) {
                    // Démarrer une transaction pour les autres migrations
                    await client.query('BEGIN');
                }

                try {
                    // Séparer le SQL en requêtes individuelles (séparées par des points-virgules)
                    // et exécuter chaque requête séparément
                    // On divise par ';' mais on garde les requêtes multi-lignes intactes
                    const sqlLines = migration.sql.split('\n');
                    const queries: string[] = [];
                    let currentQuery = '';

                    for (const line of sqlLines) {
                        const trimmedLine = line.trim();
                        // Ignorer les lignes vides et les commentaires
                        if (!trimmedLine || trimmedLine.startsWith('--')) {
                            continue;
                        }

                        currentQuery += (currentQuery ? '\n' : '') + line;

                        // Si la ligne se termine par un point-virgule, c'est la fin d'une requête
                        if (trimmedLine.endsWith(';')) {
                            const query = currentQuery.trim();
                            if (query) {
                                queries.push(query);
                            }
                            currentQuery = '';
                        }
                    }

                    // Ajouter la dernière requête si elle n'a pas de point-virgule final
                    if (currentQuery.trim()) {
                        queries.push(currentQuery.trim());
                    }

                    logger.info(`pgMigrationService: Migration ${migration.id} - ${queries.length} requête(s) à exécuter`);

                    for (let i = 0; i < queries.length; i++) {
                        const query = queries[i];
                        if (query.trim()) {
                            try {
                                await client.query(query);
                            } catch (queryError: unknown) {
                                const queryErrorMessage = queryError instanceof Error ? queryError.message : String(queryError);
                                logger.error('pgMigrationService', `Erreur lors de l'exécution de la requête ${i + 1}/${queries.length} de la migration ${migration.id}: ${queryErrorMessage}`);
                                logger.error('pgMigrationService', `Requête problématique (premiers 300 caractères): ${query.substring(0, 300)}...`);
                                throw queryError;
                            }
                        }
                    }

                    // Enregistrer la migration comme exécutée
                    await markPgMigrationAsExecuted(client, migration);
                    executedMigrations.add(migration.id); // Mettre à jour le Set local

                    // Commiter la transaction (seulement si on en a une)
                    if (!isMigration000) {
                        await client.query('COMMIT');
                    }
                    logger.info(`pgMigrationService: Migration ${migration.id} (${migration.name}) exécutée avec succès`);
                } catch (error: unknown) {
                    // Rollback en cas d'erreur (seulement si on a une transaction)
                    if (!isMigration000) {
                        try {
                            await client.query('ROLLBACK');
                        } catch (rollbackError) {
                            logger.error('pgMigrationService', `Erreur lors du rollback: ${rollbackError}`);
                        }
                    }
                    throw error;
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);

                // Ignorer les erreurs de table/index déjà existant(e)
                if (errorMessage.includes('already exists') ||
                    errorMessage.includes('duplicate') ||
                    errorMessage.includes('duplicate key') ||
                    (errorMessage.includes('relation') && errorMessage.includes('already exists'))) {
                    logger.info(`pgMigrationService: Migration ${migration.id} (${migration.name}) - ${errorMessage}, mais continuons...`);

                    // Marquer comme exécutée même en cas d'erreur "already exists"
                    try {
                        await markPgMigrationAsExecuted(client, migration);
                        executedMigrations.add(migration.id);
                    } catch {
                        // Ignorer les erreurs d'insertion si la migration est déjà enregistrée
                    }
                } else {
                    logger.error('pgMigrationService', `Erreur lors de l'exécution de la migration ${migration.id}: ${errorMessage}`);
                    throw error;
                }
            }
        }

        logger.info('pgMigrationService: Toutes les migrations ont été exécutées');
    } finally {
        // Libérer la connexion client
        client.release();
    }
}

// Variable pour suivre si les migrations sont en cours d'exécution
let migrationPromise: Promise<void> | null = null;
let migrationsExecuted = false;

/**
 * Exécute les migrations de manière non bloquante
 */
export function runMigrationsAsync(pool: Pool): void {
    if (migrationsExecuted || migrationPromise) {
        return;
    }

    migrationPromise = (async () => {
        try {
            await runPgMigrations(pool);
            migrationsExecuted = true;
        } catch (error: unknown) {
            logger.error('pgMigrationService', `Erreur lors de l'exécution des migrations: ${error}`);
            // Ne pas bloquer si les migrations échouent
        } finally {
            migrationPromise = null;
        }
    })();
}

/**
 * Vérifie quelles migrations ont déjà été exécutées (version PGlite)
 */
async function getExecutedPgLiteMigrations(db: PGlite): Promise<Set<string>> {
    try {
        const result = await db.query('SELECT id FROM migrations ORDER BY id');
        // PGlite retourne un tableau directement
        const rows = Array.isArray(result) ? result : [];
        return new Set(rows.map((row: any) => row.id));
    } catch (error: unknown) {
        // Si la table migrations n'existe pas encore, retourner un Set vide
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
            return new Set();
        }
        throw error;
    }
}

/**
 * Enregistre une migration comme exécutée (version PGlite)
 */
async function markPgLiteMigrationAsExecuted(db: PGlite, migration: Migration): Promise<void> {
    try {
        await db.query(
            'INSERT INTO migrations (id, name) VALUES ($1, $2)',
            [migration.id, migration.name]
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Si la table migrations n'existe pas encore (cas de la migration 000), la créer d'abord
        if (errorMessage.includes('does not exist') || (errorMessage.includes('relation') && errorMessage.includes('does not exist'))) {
            // Créer la table migrations si elle n'existe pas
            await db.query(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
                )
            `);
            // Réessayer l'insertion
            await db.query(
                'INSERT INTO migrations (id, name) VALUES ($1, $2)',
                [migration.id, migration.name]
            );
        } else {
            throw error;
        }
    }
}

/**
 * Exécute les migrations non exécutées (version PGlite)
 */
export async function runPgLiteMigrations(db: PGlite): Promise<void> {
    logger.info('pgMigrationService: Chargement des migrations pour PGlite...');

    const migrations = await loadPgMigrations();

    // S'assurer que la migration 000 (table migrations) est en premier
    migrations.sort((a, b) => a.id.localeCompare(b.id));

    try {
        // Vérifier si la table migrations existe
        let executedMigrations: Set<string>;
        try {
            executedMigrations = await getExecutedPgLiteMigrations(db);
        } catch (error: unknown) {
            // Si la table migrations n'existe pas, on commence avec un Set vide
            executedMigrations = new Set();
        }

        logger.info(`pgMigrationService: ${migrations.length} migration(s) trouvée(s), ${executedMigrations.size} déjà exécutée(s)`);

        for (const migration of migrations) {
            // Vérifier si la migration a déjà été exécutée
            if (executedMigrations.has(migration.id)) {
                logger.info(`pgMigrationService: Migration ${migration.id} (${migration.name}) déjà exécutée, ignorée`);
                continue;
            }

            logger.info(`pgMigrationService: Exécution de la migration ${migration.id} (${migration.name})...`);

            try {
                // Pour la migration 000 (création de la table migrations), ne pas utiliser de transaction
                // car si la transaction échoue, la table ne sera jamais créée
                const isMigration000 = migration.id === '000';

                if (!isMigration000) {
                    // Démarrer une transaction pour les autres migrations
                    await db.query('BEGIN');
                }

                try {
                    // Séparer le SQL en requêtes individuelles (séparées par des points-virgules)
                    // et exécuter chaque requête séparément
                    // On divise par ';' mais on garde les requêtes multi-lignes intactes
                    const sqlLines = migration.sql.split('\n');
                    const queries: string[] = [];
                    let currentQuery = '';

                    for (const line of sqlLines) {
                        const trimmedLine = line.trim();
                        // Ignorer les lignes vides et les commentaires
                        if (!trimmedLine || trimmedLine.startsWith('--')) {
                            continue;
                        }

                        currentQuery += (currentQuery ? '\n' : '') + line;

                        // Si la ligne se termine par un point-virgule, c'est la fin d'une requête
                        if (trimmedLine.endsWith(';')) {
                            const query = currentQuery.trim();
                            if (query) {
                                queries.push(query);
                            }
                            currentQuery = '';
                        }
                    }

                    // Ajouter la dernière requête si elle n'a pas de point-virgule final
                    if (currentQuery.trim()) {
                        queries.push(currentQuery.trim());
                    }

                    logger.info(`pgMigrationService: Migration ${migration.id} - ${queries.length} requête(s) à exécuter`);

                    for (let i = 0; i < queries.length; i++) {
                        const query = queries[i];
                        if (query.trim()) {
                            try {
                                await db.query(query);
                            } catch (queryError: unknown) {
                                const queryErrorMessage = queryError instanceof Error ? queryError.message : String(queryError);
                                logger.error('pgMigrationService', `Erreur lors de l'exécution de la requête ${i + 1}/${queries.length} de la migration ${migration.id}: ${queryErrorMessage}`);
                                logger.error('pgMigrationService', `Requête problématique (premiers 300 caractères): ${query.substring(0, 300)}...`);
                                throw queryError;
                            }
                        }
                    }

                    // Enregistrer la migration comme exécutée
                    await markPgLiteMigrationAsExecuted(db, migration);
                    executedMigrations.add(migration.id); // Mettre à jour le Set local

                    // Commiter la transaction (seulement si on en a une)
                    if (!isMigration000) {
                        await db.query('COMMIT');
                    }
                    logger.info(`pgMigrationService: Migration ${migration.id} (${migration.name}) exécutée avec succès`);
                } catch (error: unknown) {
                    // Rollback en cas d'erreur (seulement si on a une transaction)
                    if (!isMigration000) {
                        try {
                            await db.query('ROLLBACK');
                        } catch (rollbackError) {
                            logger.error('pgMigrationService', `Erreur lors du rollback: ${rollbackError}`);
                        }
                    }
                    throw error;
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);

                // Ignorer les erreurs de table/index déjà existant(e)
                if (errorMessage.includes('already exists') ||
                    errorMessage.includes('duplicate') ||
                    errorMessage.includes('duplicate key') ||
                    (errorMessage.includes('relation') && errorMessage.includes('already exists'))) {
                    logger.info(`pgMigrationService: Migration ${migration.id} (${migration.name}) - ${errorMessage}, mais continuons...`);

                    // Marquer comme exécutée même en cas d'erreur "already exists"
                    try {
                        await markPgLiteMigrationAsExecuted(db, migration);
                        executedMigrations.add(migration.id);
                    } catch {
                        // Ignorer les erreurs d'insertion si la migration est déjà enregistrée
                    }
                } else {
                    logger.error('pgMigrationService', `Erreur lors de l'exécution de la migration ${migration.id}: ${errorMessage}`);
                    throw error;
                }
            }
        }

        logger.info('pgMigrationService: Toutes les migrations PGlite ont été exécutées');
    } catch (error: unknown) {
        logger.error('pgMigrationService', `Erreur lors de l'exécution des migrations PGlite: ${error}`);
        throw error;
    }
}

// Variable pour suivre si les migrations PGlite sont en cours d'exécution
let pgliteMigrationPromise: Promise<void> | null = null;
let pgliteMigrationsExecuted = false;

/**
 * Exécute les migrations PGlite de manière non bloquante
 */
export function runPgLiteMigrationsAsync(db: PGlite): void {
    if (pgliteMigrationsExecuted || pgliteMigrationPromise) {
        return;
    }

    pgliteMigrationPromise = (async () => {
        try {
            await runPgLiteMigrations(db);
            pgliteMigrationsExecuted = true;
        } catch (error: unknown) {
            logger.error('pgMigrationService', `Erreur lors de l'exécution des migrations PGlite: ${error}`);
            // Ne pas bloquer si les migrations échouent
        } finally {
            pgliteMigrationPromise = null;
        }
    })();
}
