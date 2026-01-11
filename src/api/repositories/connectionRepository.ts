import { databaseProvider } from '../providers/databaseProvider';
import { encryptionService } from '../core/services/encryptionService';
import type { DBConnection } from '../../shared/types/types';

const SENSITIVE_FIELDS = ['user', 'password', 'apiToken'];

/**
 * Repositories pour les connections
 */
export const connectionRepository = {
    /**
     * Récupérer toutes les connections de l'utilisateur authentifié
     */
    async getAllConnections({ fullConfig = false, decrypt = false }: { fullConfig?: boolean, decrypt?: boolean } = {}): Promise<DBConnection[]> {

        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`
        SELECT id, name, type, config
        FROM connections
      `, []);

            const connections = result.rows.map(row => ({
                id: row.id,
                name: row.name,
                type: row.type,
                host: row.config.host,
                port: row.config.port,
                database: row.config.database,
                apiUrl: row.config.apiUrl,
                ...(fullConfig || decrypt ? row.config : {})
            }));

            if (!decrypt) {
                return connections;
            }

            return await Promise.all(connections.map(async conn => {
                return await this.decryptConnection(conn);
            }));
        } finally {
            await pool.end();
        }
    },

    async getConnection(connectionId: string, { decrypt = true }: { decrypt?: boolean } = {}): Promise<DBConnection> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`
                SELECT id, name, type, config
                FROM connections
                WHERE id = $1
            `, [connectionId]);

            const connection = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                type: result.rows[0].type,
                ...result.rows[0].config
            } as DBConnection;

            return decrypt ? await this.decryptConnection(connection) : connection;
        } finally {
            await pool.end();
        }
    },

    /**
     * Créer ou mettre à jour une connection
     */
    async putConnection(connection: DBConnection, { encrypt = true }: { encrypt?: boolean } = {}): Promise<void> {
        const { id, name, type, ...config } = connection;

        // Chiffrer les champs sensibles avant stockage
        const encryptedConfig = encrypt ? await this.encryptConnection(config) : config;

        const pool = databaseProvider.createPool();
        try {
            await pool.query(`
        INSERT INTO connections (id, name, type, config)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          config = EXCLUDED.config
      `, [
                id,
                name,
                type,
                JSON.stringify(encryptedConfig),
            ]);
        } finally {
            await pool.end();
        }
    },

    async putConnections(connections: DBConnection[], { encrypt = true }: { encrypt?: boolean } = {}): Promise<void> {
        const pool = databaseProvider.createPool();

        const ids: string[] = [];
        const names: string[] = [];
        const types: string[] = [];
        const configs: string[] = [];

        for (const connection of connections) {
            const { id, name, type, ...config } = connection;
            const encryptedConfig = encrypt ? await this.encryptConnection(config) : config;

            ids.push(id);
            names.push(name);
            types.push(type);
            configs.push(JSON.stringify(encryptedConfig));
        }

        try {
            await pool.query(`
        INSERT INTO connections (id, name, type, config)
        SELECT *
        FROM UNNEST(
          $1::uuid[],
          $2::text[],
          $3::text[],
          $4::jsonb[]
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          config = EXCLUDED.config
      `, [ids, names, types, configs]);

        } finally {
            await pool.end();
        }
    },

    /**
     * Supprimer une connection
     */
    async deleteConnection(connectionId: string): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`
        DELETE FROM connections 
        WHERE id = $1
      `, [connectionId]);
        } finally {
            await pool.end();
        }
    },

    /**
     * Supprimer toutes les connections
     */
    async clearAll(): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`
        DELETE FROM connections 
      `, []);
        } finally {
            await pool.end();
        }
    },

    async encryptConnection(connection: DBConnection): Promise<DBConnection> {
        const encrypted = { ...connection };
        for (const field of SENSITIVE_FIELDS) {
            if (encrypted[field]) {
                encrypted[field] = await encryptionService.encrypt(encrypted[field] as string);
            }
        }
        return encrypted as DBConnection;
    },

    async decryptConnection(connection: DBConnection): Promise<DBConnection> {
        const decrypted = { ...connection };
        for (const field of SENSITIVE_FIELDS) {
            if (decrypted[field]) {
                decrypted[field] = await encryptionService.decrypt(decrypted[field] as string);
            }
        }
        return decrypted as DBConnection;
    },
};



