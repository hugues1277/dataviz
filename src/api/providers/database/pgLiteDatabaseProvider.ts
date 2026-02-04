import { PGlite } from '@electric-sql/pglite';
import { Pool, PoolClient, QueryResult } from 'pg';
import { runPgLiteMigrationsAsync } from './pgMigrationService';
import logger from '../../../shared/utils/logger';
import { isTauri } from '../../../shared/utils/platform';

// Instance globale PGlite
let pgliteInstance: PGlite | null = null;

/**
 * Wrapper pour simuler l'interface PoolClient avec PGlite
 * Implémente uniquement les méthodes nécessaires pour les migrations
 */
class PGlitePoolClient {
    private db: PGlite;
    private released = false;

    constructor(db: PGlite) {
        this.db = db;
    }

    async query(textOrConfig: string | any, params?: any[]): Promise<QueryResult> {
        if (this.released) {
            throw new Error('Client has been released');
        }

        // Gérer les deux formats : string simple ou objet QueryConfig
        let text: string;
        let values: any[] | undefined;

        if (typeof textOrConfig === 'string') {
            text = textOrConfig;
            values = params;
        } else {
            text = textOrConfig.text || textOrConfig.query;
            values = textOrConfig.values || params;
        }

        const result = await this.db.query(text, values || []);

        // Convertir le format de résultat de PGlite vers le format pg
        // PGlite retourne un tableau d'objets directement
        const rows = Array.isArray(result) ? result : [];

        return {
            rows,
            rowCount: rows.length,
            command: text.split(' ')[0].toUpperCase(),
            oid: 0,
            fields: [],
        } as QueryResult;
    }

    release(): void {
        this.released = true;
        // PGlite n'a pas besoin de libération de connexion
    }

    // Implémenter les autres méthodes requises par PoolClient (stubs)
    async connect(): Promise<void> {
        // PGlite est déjà connecté
    }

    get connection(): any {
        return this.db;
    }

    [Symbol.asyncDispose](): Promise<void> {
        this.release();
        return Promise.resolve();
    }
}

/**
 * Wrapper pour simuler l'interface Pool avec PGlite
 * Implémente uniquement les méthodes nécessaires pour les migrations
 */
class PGlitePool {
    private db: PGlite;
    private clients: PGlitePoolClient[] = [];

    constructor(db: PGlite) {
        this.db = db;
    }

    async connect(): Promise<PoolClient> {
        const client = new PGlitePoolClient(this.db) as unknown as PoolClient;
        this.clients.push(client as unknown as PGlitePoolClient);
        return client;
    }

    async query(textOrConfig: string | any, params?: any[]): Promise<QueryResult> {
        // Gérer les deux formats : string simple ou objet QueryConfig
        let text: string;
        let values: any[] | undefined;

        if (typeof textOrConfig === 'string') {
            text = textOrConfig;
            values = params;
        } else {
            text = textOrConfig.text || textOrConfig.query;
            values = textOrConfig.values || params;
        }

        const result = await this.db.query(text, values || []);

        // Convertir le format de résultat de PGlite vers le format pg
        const rows = Array.isArray(result) ? result : [];

        return {
            rows,
            rowCount: rows.length,
            command: text.split(' ')[0].toUpperCase(),
            oid: 0,
            fields: [],
        } as QueryResult;
    }

    async end(): Promise<void> {
        // PGlite n'a pas besoin de fermeture explicite, mais on peut nettoyer
        this.clients = [];
    }

    // Propriétés minimales pour l'interface Pool
    get totalCount(): number {
        return 1;
    }

    get idleCount(): number {
        return 1;
    }

    get waitingCount(): number {
        return 0;
    }
}

/**
 * Obtient ou crée l'instance PGlite
 */
async function getPGliteInstance(): Promise<PGlite> {
    if (pgliteInstance) {
        return pgliteInstance;
    }

    // Déterminer le chemin de stockage selon l'environnement
    let dataDir: string;

    try {
        if (isTauri) {
            // En Tauri, utiliser le système de fichiers local avec BaseDirectory
            const pathModule = await import('@tauri-apps/api/path');
            const { BaseDirectory } = pathModule;
            // Utiliser appDataDir() qui nécessite core:path:allow-resolve-directory
            // Les permissions sont configurées dans src-tauri/capabilities/default.json
            const dataDirPath = await pathModule.appDataDir();
            dataDir = `file://${dataDirPath}/.pglite`;
        } else if (typeof window !== 'undefined') {
            // Dans le navigateur, utiliser IndexedDB
            dataDir = 'idb://pglite';
        } else {
            // En Node.js, utiliser le système de fichiers
            const path = await import('path');
            const os = await import('os');
            const homeDir = os.homedir();
            dataDir = `file://${path.join(homeDir, '.pglite')}`;
        }

        logger.info(`pgLiteDatabaseProvider: Initialisation de PGlite avec dataDir: ${dataDir}`);

        // Créer l'instance PGlite
        pgliteInstance = await PGlite.create(dataDir, {
            // Options de configuration PGlite
        });

        logger.info('pgLiteDatabaseProvider: Instance PGlite créée avec succès');
    } catch (error) {
        logger.error('pgLiteDatabaseProvider', `Erreur lors de la création de l'instance PGlite: ${error}`);
        throw error;
    }

    return pgliteInstance;
}

/**
 * Provider pour la connexion à la base de données PGlite (SQLite avec interface PostgreSQL)
 * Centralise la configuration de la connexion et gère les migrations
 */
export const pgLiteDatabaseProvider = {
    createPool: (): Pool => {
        // Initialiser PGlite de manière asynchrone en arrière-plan
        // Le pool retourné attendra que l'initialisation soit terminée lors du premier usage
        const initPromise = getPGliteInstance();

        // Créer un pool wrapper qui attend l'initialisation
        const pool = new PGlitePoolLazy(initPromise) as unknown as Pool;

        // Exécuter les migrations de manière non bloquante une fois l'instance créée
        initPromise.then(db => {
            runPgLiteMigrationsAsync(db);
        }).catch(error => {
            logger.error('pgLiteDatabaseProvider', `Erreur lors de l'initialisation: ${error}`);
        });

        return pool;
    },
};

/**
 * Pool wrapper qui attend l'initialisation de PGlite de manière lazy
 */
class PGlitePoolLazy {
    private initPromise: Promise<PGlite>;
    private pool: PGlitePool | null = null;

    constructor(initPromise: Promise<PGlite>) {
        this.initPromise = initPromise;
    }

    private async ensureInitialized(): Promise<PGlitePool> {
        if (!this.pool) {
            const db = await this.initPromise;
            this.pool = new PGlitePool(db);
        }
        return this.pool;
    }

    async connect(): Promise<PoolClient> {
        const pool = await this.ensureInitialized();
        return pool.connect();
    }

    async query(textOrConfig: string | any, params?: any[]): Promise<QueryResult> {
        const pool = await this.ensureInitialized();
        return pool.query(textOrConfig, params);
    }

    async end(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
        }
    }

    get totalCount(): number {
        return 1;
    }

    get idleCount(): number {
        return 1;
    }

    get waitingCount(): number {
        return 0;
    }
}
