import { PGlite } from '@electric-sql/pglite';
import type { QueryResult } from 'pg';
import logger from '../../../shared/utils/logger';

// Détection de l'environnement
const isBrowser = typeof window !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions?.node;

// Instance singleton de PGLite
let pgliteInstance: PGlite | null = null;
let isInitialized = false;
let migrationPromise: Promise<void> | null = null;

/**
 * Détermine le chemin de stockage de la base de données selon l'environnement
 */
async function getDataDir(): Promise<string> {
    if (isBrowser) {
        // Dans le navigateur, utilise IndexedDB
        return 'idb://dataviz-pglite';
    } else if (isNode) {
        // En Node.js, utilise le système de fichiers
        // Import dynamique pour éviter les erreurs dans le navigateur
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const { existsSync, mkdirSync } = await import('fs');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const dataDir = path.join(__dirname, '../../../.pglite');

        // Créer le répertoire s'il n'existe pas
        if (!existsSync(dataDir)) {
            mkdirSync(dataDir, { recursive: true });
        }

        return `file://${dataDir}`;
    } else {
        // Fallback : mémoire (non persistant)
        return 'memory://dataviz-pglite';
    }
}

/**
 * Nettoie le répertoire de données PGlite en cas de corruption
 */
async function cleanupDataDir(): Promise<void> {
    if (isBrowser) {
        // Dans le navigateur, nettoyer IndexedDB
        try {
            const dbName = 'dataviz-pglite';
            const deleteReq = indexedDB.deleteDatabase(dbName);
            await new Promise<void>((resolve, reject) => {
                deleteReq.onsuccess = () => resolve();
                deleteReq.onerror = () => reject(deleteReq.error);
            });
            logger.info('pgLiteDatabaseProvider: IndexedDB nettoyé');
        } catch (error) {
            logger.error('pgLiteDatabaseProvider', `Erreur lors du nettoyage IndexedDB: ${error}`);
        }
    } else if (isNode) {
        // En Node.js, supprimer le répertoire
        try {
            const path = await import('path');
            const { fileURLToPath } = await import('url');
            const { existsSync, rmSync } = await import('fs');

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const dataDir = path.join(__dirname, '../../../.pglite');

            if (existsSync(dataDir)) {
                rmSync(dataDir, { recursive: true, force: true });
                logger.info('pgLiteDatabaseProvider: Répertoire de données nettoyé');
            }
        } catch (error) {
            logger.error('pgLiteDatabaseProvider', `Erreur lors du nettoyage du répertoire: ${error}`);
        }
    }
}

/**
 * Requêtes de migration SQL pour créer les tables nécessaires
 */
const migrationRequests = [
    `
    CREATE TABLE IF NOT EXISTS dashboards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      order_index INT DEFAULT 0,
      variables JSONB DEFAULT '[]',
      default_preset TEXT
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS charts (
      id TEXT PRIMARY KEY,
      dashboard_id TEXT NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
      title TEXT,
      query TEXT,
      connection_id TEXT,
      type TEXT,
      config JSONB DEFAULT '{}'
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      config JSONB DEFAULT '{}'
    );
    `,
    `create table if not exists "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);`,
    `create table if not exists "session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id") on delete cascade);`,
    `create table if not exists "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);`,
    `create table if not exists "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);`,
    `create index if not exists "session_userId_idx" on "session" ("userId");`,
    `create index if not exists "account_userId_idx" on "account" ("userId");`,
    `create index if not exists "verification_identifier_idx" on "verification" ("identifier");`,
];

/**
 * Initialise l'instance PGLite et exécute les migrations
 */
async function initializePGlite(): Promise<PGlite> {
    if (pgliteInstance) {
        return pgliteInstance;
    }

    // Si une migration est en cours, attendre qu'elle se termine
    if (migrationPromise) {
        await migrationPromise;
        if (pgliteInstance) {
            return pgliteInstance;
        }
    }

    // Créer une nouvelle instance
    migrationPromise = (async () => {
        let retryCount = 0;
        const maxRetries = 1; // Une seule tentative de récupération

        while (retryCount <= maxRetries) {
            try {
                const dataDir = await getDataDir();

                logger.info(`pgLiteDatabaseProvider: Initialisation de PGLite avec dataDir: ${dataDir}`);

                // Créer l'instance PGLite
                pgliteInstance = new PGlite(dataDir, {
                    debug: process.env.NODE_ENV === 'development' ? 1 : 0,
                });

                // Attendre que la base soit prête
                await pgliteInstance.waitReady;

                logger.info('pgLiteDatabaseProvider: PGLite initialisé avec succès');

                // Exécuter les migrations
                logger.info('pgLiteDatabaseProvider: Exécution des migrations...');

                for (const request of migrationRequests) {
                    try {
                        await pgliteInstance.query(request);
                    } catch (error: unknown) {
                        // Ignorer les erreurs de table déjà existante
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        if (!errorMessage.includes('already exists') && !errorMessage.includes('duplicate')) {
                            logger.error('pgLiteDatabaseProvider', `Erreur lors de la migration: ${errorMessage}`);
                            throw error;
                        }
                    }
                }

                logger.info('pgLiteDatabaseProvider: Migrations terminées avec succès');
                isInitialized = true;
                break; // Succès, sortir de la boucle
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);

                // Détecter l'erreur de bundle FS corrompu
                const isBundleError = errorMessage.includes('Invalid FS bundle size') ||
                    errorMessage.includes('bundle size');

                if (isBundleError && retryCount < maxRetries) {
                    logger.info(`pgLiteDatabaseProvider: Bundle FS corrompu détecté, nettoyage et nouvelle tentative...`);

                    // Fermer l'instance si elle existe
                    if (pgliteInstance) {
                        try {
                            await pgliteInstance.close();
                        } catch {
                            // Ignorer les erreurs de fermeture
                        }
                        pgliteInstance = null;
                    }

                    // Nettoyer le répertoire de données corrompu
                    await cleanupDataDir();

                    retryCount++;
                    continue; // Réessayer
                } else {
                    logger.error('pgLiteDatabaseProvider', `Erreur lors de l'initialisation: ${error}`);
                    pgliteInstance = null;
                    throw error;
                }
            } finally {
                if (retryCount > maxRetries) {
                    migrationPromise = null;
                }
            }
        }

        migrationPromise = null;
    })();

    await migrationPromise;

    if (!pgliteInstance) {
        throw new Error('Échec de l\'initialisation de PGLite');
    }

    return pgliteInstance;
}

/**
 * Wrapper qui simule l'interface Pool de pg pour compatibilité
 */
class PGLitePool {
    private pglitePromise: Promise<PGlite> | null = null;

    constructor() {
        // L'initialisation sera faite de manière lazy lors du premier query()
    }

    /**
     * Obtient l'instance PGLite (initialise si nécessaire)
     */
    private async getPGlite(): Promise<PGlite> {
        if (!this.pglitePromise) {
            this.pglitePromise = initializePGlite();
        }
        return await this.pglitePromise;
    }

    /**
     * Exécute une requête SQL
     * Compatible avec l'interface pg.Pool.query()
     */
    async query(text: string, params?: unknown[]): Promise<QueryResult> {
        try {
            const pglite = await this.getPGlite();
            const result = await pglite.query(text, params || []);

            // Convertir le résultat PGLite au format pg.QueryResult
            const rows = result.rows || [];
            return {
                rows,
                rowCount: rows.length || 0,
                command: this.extractCommand(text),
                oid: 0,
                fields: rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null
                    ? Object.keys(rows[0] as Record<string, unknown>).map((name, index) => ({
                        name,
                        tableID: 0,
                        columnID: index,
                        dataTypeID: 0,
                        dataTypeSize: 0,
                        dataTypeModifier: 0,
                        format: 'text',
                    }))
                    : [],
            } as QueryResult;
        } catch (error: unknown) {
            logger.error('pgLiteDatabaseProvider', `Erreur lors de l'exécution de la requête: ${error}`);
            throw error;
        }
    }

    /**
     * Ferme la connexion (no-op pour PGLite car c'est une instance singleton)
     * Compatible avec l'interface pg.Pool.end()
     */
    async end(): Promise<void> {
        // Ne pas fermer l'instance singleton, juste logger
        // Note: Pool.end() est appelé mais l'instance reste ouverte pour réutilisation
    }

    /**
     * Extrait la commande SQL (SELECT, INSERT, UPDATE, DELETE, etc.)
     */
    private extractCommand(text: string): string {
        const trimmed = text.trim().toUpperCase();
        if (trimmed.startsWith('SELECT')) return 'SELECT';
        if (trimmed.startsWith('INSERT')) return 'INSERT';
        if (trimmed.startsWith('UPDATE')) return 'UPDATE';
        if (trimmed.startsWith('DELETE')) return 'DELETE';
        if (trimmed.startsWith('CREATE')) return 'CREATE';
        if (trimmed.startsWith('DROP')) return 'DROP';
        if (trimmed.startsWith('ALTER')) return 'ALTER';
        return 'UNKNOWN';
    }
}

/**
 * Provider pour la connexion à la base de données PGLite locale
 * Centralise la configuration de la connexion et gère l'initialisation
 */
export const pgLiteDatabaseProvider = {
    /**
     * Crée un pool de connexion (wrapper autour de l'instance PGLite singleton)
     * Compatible avec l'interface de pgDatabaseProvider
     * L'initialisation de PGLite se fait de manière lazy lors du premier query()
     */
    createPool: (): PGLitePool => {
        return new PGLitePool();
    },

    /**
     * Ferme l'instance PGLite et libère les ressources
     * Utile pour les tests ou le nettoyage
     */
    close: async (): Promise<void> => {
        if (pgliteInstance) {
            await pgliteInstance.close();
            pgliteInstance = null;
            isInitialized = false;
            logger.info('pgLiteDatabaseProvider: Instance PGLite fermée');
        }
    },

    /**
     * Réinitialise la base de données (supprime toutes les données)
     * ATTENTION: Cette opération est destructive
     */
    reset: async (): Promise<void> => {
        await pgLiteDatabaseProvider.close();
        pgliteInstance = null;
        isInitialized = false;
        migrationPromise = null;

        // Recréer l'instance qui va recréer les tables
        await initializePGlite();
        logger.info('pgLiteDatabaseProvider: Base de données réinitialisée');
    },

    /**
     * Vérifie si la base de données est initialisée
     */
    isInitialized: (): boolean => {
        return isInitialized && pgliteInstance !== null;
    },

    /**
     * Obtient l'instance PGLite directement (pour usage avancé)
     */
    getInstance: async (): Promise<PGlite> => {
        return await initializePGlite();
    },
};
