import { databaseProvider } from '../providers/databaseProvider';
import { encryptionService } from '../core/services/encryptionService';
import type { DBConnection, DBConnectionConfig } from '../../shared/types/types';
import ConnectionRepositoryInterface from '../interfaces/connectionRepositoryInterface';

const SENSITIVE_FIELDS: (keyof DBConnectionConfig)[] = ['password', 'apiToken'];

/**
 * Repositories pour les connections
 */
class ConnectionRepository extends ConnectionRepositoryInterface {

    private createRequest = `INSERT INTO connections (id, name, type, config) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        config = EXCLUDED.config
    `;

    private createManyRequest = `INSERT INTO connections (id, name, type, config)
        SELECT *
        FROM UNNEST($1::uuid[], $2::text[], $3::text[], $4::jsonb[])
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          config = EXCLUDED.config
    `;

    async getAll({ fullConfig = false, decrypt = false }: { fullConfig?: boolean, decrypt?: boolean } = {}): Promise<DBConnection[]> {

        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`SELECT id, name, type, config FROM connections`, []);

            const connections = result.rows.map(row => ({
                id: row.id,
                name: row.name,
                type: row.type,
                host: row.config.host,
                port: row.config.port,
                database: row.config.database,
                apiUrl: row.config.apiUrl,
                user: row.config.user,
                ssl: row.config.ssl,
                ...(fullConfig || decrypt ? row.config : {})
            }));

            if (!decrypt) {
                return connections as DBConnection[];
            }

            return await Promise.all(connections.map(async conn => ({
                id: conn.id,
                name: conn.name,
                type: conn.type,
                ...await this.decryptConnection(conn.config as DBConnectionConfig)
            } as DBConnection)));
        } finally {
            await pool.end();
        }
    }

    async get(id: string, { decrypt = true }: { decrypt?: boolean } = {}): Promise<DBConnection> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`SELECT id, name, type, config FROM connections WHERE id = $1`, [id]);

            return decrypt ? {
                id: result.rows[0].id,
                name: result.rows[0].name,
                type: result.rows[0].type,
                ...await this.decryptConnection(result.rows[0].config as DBConnectionConfig)
            } : {
                id: result.rows[0].id,
                name: result.rows[0].name,
                type: result.rows[0].type,
                ...result.rows[0].config
            } as DBConnection;

        } finally {
            await pool.end();
        }
    }

    /**
     * Créer ou mettre à jour une connection
     */
    async create(connection: DBConnection, { encrypt = true }: { encrypt?: boolean } = {}): Promise<void> {
        const { id, name, type, ...config } = connection;

        // Chiffrer les champs sensibles avant stockage
        const encryptedConfig = encrypt ? await this.encryptConnection(config) : config;

        const pool = databaseProvider.createPool();
        try {
            await pool.query(this.createRequest, [
                id,
                name,
                type,
                JSON.stringify(encryptedConfig)
            ]);
        } finally {
            await pool.end();
        }
    }

    async createMany(connections: DBConnection[], { encrypt = true }: { encrypt?: boolean } = {}): Promise<void> {
        const pool = databaseProvider.createPool();

        const values = await Promise.all(connections.map(async connection => {
            const { id, name, type, ...config } = connection;
            const encryptedConfig = encrypt ? await this.encryptConnection(config) : config;
            return [id, name, type, JSON.stringify(encryptedConfig)];
        }));

        // Transformer le tableau de tableaux en 4 tableaux séparés pour UNNEST
        const ids = values.map(v => v[0]);
        const names = values.map(v => v[1]);
        const types = values.map(v => v[2]);
        const configs = values.map(v => v[3]);

        try {
            await pool.query(this.createManyRequest, [ids, names, types, configs]);
        } finally {
            await pool.end();
        }
    }

    async update(connection: DBConnection, { encrypt = true }: { encrypt?: boolean } = {}): Promise<void> {
        const { id, name, type, ...config } = connection;

        // get the existing connection (sans déchiffrement pour éviter les problèmes)
        const existingConnection = await this.get(id, { decrypt: false });

        // if password or apiToken is not set, use the existing connection (déjà chiffrée)
        if (existingConnection !== null) {
            const existingConfig = existingConnection as DBConnectionConfig;
            if ((config.password ?? "") === "") {
                config.password = existingConfig.password as string;
            }
            if ((config.apiToken ?? "") === "") {
                config.apiToken = existingConfig.apiToken as string;
            }
        }

        // Toujours chiffrer les champs sensibles avant stockage si encrypt est true
        const encryptedConfig = encrypt ? await this.encryptConnection(config) : config;

        const pool = databaseProvider.createPool();
        try {
            await pool.query(`UPDATE connections SET name = $1, type = $2, config = $3 WHERE id = $4`, [name, type, JSON.stringify(encryptedConfig), id]);
        } finally {
            await pool.end();
        }
    }

    async delete(id: string): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`DELETE FROM connections WHERE id = $1`, [id]);
        } finally {
            await pool.end();
        }
    }

    async clear(): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`DELETE FROM connections`, []);
        } finally {
            await pool.end();
        }
    }

    private async encryptConnection(connection: DBConnectionConfig): Promise<DBConnectionConfig> {
        let encrypted: DBConnectionConfig = { ...connection };
        for (const field of SENSITIVE_FIELDS) {
            if (encrypted[field]) {
                const value = encrypted[field] as string;
                // Ne chiffrer que si la valeur n'est pas déjà chiffrée
                if (!encryptionService.isEncrypted(value)) {
                    encrypted = {
                        ...encrypted,
                        [field]: await encryptionService.encrypt(value)
                    };
                }
                // Sinon, garder la valeur telle quelle (déjà chiffrée)
            }
        }
        return encrypted;
    }

    private async decryptConnection(connection: DBConnectionConfig): Promise<DBConnectionConfig> {
        let decrypted: DBConnectionConfig = { ...connection };
        for (const field of SENSITIVE_FIELDS) {
            if (decrypted[field]) {
                const value = decrypted[field] as string;
                // Ne déchiffrer que si la valeur est réellement chiffrée
                if (encryptionService.isEncrypted(value)) {
                    decrypted = {
                        ...decrypted,
                        [field]: await encryptionService.decrypt(value)
                    };
                }
                // Sinon, garder la valeur telle quelle (déjà déchiffrée ou non chiffrée)
            }
        }
        return decrypted;
    }
};

export default ConnectionRepository;

