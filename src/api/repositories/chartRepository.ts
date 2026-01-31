import { databaseProvider } from '../providers/databaseProvider';
import type { ChartConfig } from '../../shared/types/types';
import ChartRepositoryInterface from '../interfaces/chartRepositoryInterface';

class ChartRepository extends ChartRepositoryInterface {

    private createRequest = `INSERT INTO charts (id, dashboard_id, title, query, connection_id, type, config)
        VALUES ($1::uuid, $2::uuid, $3::text, $4::text, $5::uuid, $6::text, $7::jsonb)
        ON CONFLICT (id) DO UPDATE SET
            dashboard_id = EXCLUDED.dashboard_id,
            title = EXCLUDED.title,
            query = EXCLUDED.query,
            connection_id = EXCLUDED.connection_id,
            type = EXCLUDED.type,
            config = EXCLUDED.config
    `;

    private createManyRequest = `INSERT INTO charts (id, dashboard_id, title, query, connection_id, type, config)
        SELECT *
        FROM UNNEST($1::uuid[], $2::uuid[], $3::text[], $4::text[], $5::uuid[], $6::text[], $7::jsonb[])
        ON CONFLICT (id) DO UPDATE SET
            dashboard_id = EXCLUDED.dashboard_id,
            title = EXCLUDED.title,
            query = EXCLUDED.query,
            connection_id = EXCLUDED.connection_id,
            type = EXCLUDED.type,
            config = EXCLUDED.config
    `;

    async get(id: string): Promise<ChartConfig | null> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`SELECT id, dashboard_id, title, query, connection_id, type, config FROM charts WHERE id = $1`, [id]);

            return {
                id: result.rows[0].id,
                dashboardId: result.rows[0].dashboard_id,
                title: result.rows[0].title,
                query: result.rows[0].query,
                connectionId: result.rows[0].connection_id,
                type: result.rows[0].type,
                ...result.rows[0].config
            };
        } finally {
            await pool.end();
        }
    }

    async getAll(): Promise<ChartConfig[]> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`SELECT id, dashboard_id, title, query, connection_id, type, config FROM charts`, []);

            return result.rows.map(row => ({
                id: row.id,
                dashboardId: row.dashboard_id,
                title: row.title,
                query: row.query,
                connectionId: row.connection_id,
                type: row.type,
                ...row.config
            }));
        } finally {
            await pool.end();
        }
    }

    /**
     * Récupérer les charts d'un dashboard spécifique
     */
    async getByDashboard(id: string): Promise<ChartConfig[]> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`
        SELECT id, dashboard_id, title, query, connection_id, type, config
        FROM charts 
        WHERE dashboard_id = $2
      `, [id]);

            return result.rows.map(row => ({
                id: row.id,
                dashboardId: row.dashboard_id,
                title: row.title,
                query: row.query,
                connectionId: row.connection_id,
                type: row.type,
                ...row.config
            }));
        } finally {
            await pool.end();
        }
    }

    async create(chart: ChartConfig): Promise<void> {
        const { id, dashboardId, title, query, connectionId, type, ...config } = chart;

        const pool = databaseProvider.createPool();
        try {
            await pool.query(this.createRequest, [
                id,
                dashboardId,
                title,
                query,
                connectionId,
                type,
                JSON.stringify(config),
            ]);
        } finally {
            await pool.end();
        }
    }

    async createMany(objects: ChartConfig[]): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            const ids: string[] = [];
            const dashboardIds: string[] = [];
            const titles: string[] = [];
            const queries: string[] = [];
            const connectionIds: string[] = [];
            const types: string[] = [];
            const configs: string[] = [];

            objects.forEach(object => {
                const { id, dashboardId, title, query, connectionId, type, ...config } = object;
                ids.push(id);
                dashboardIds.push(dashboardId);
                titles.push(title);
                queries.push(query);
                connectionIds.push(connectionId);
                types.push(type);
                configs.push(JSON.stringify(config));
            });

            await pool.query(this.createManyRequest, [ids, dashboardIds, titles, queries, connectionIds, types, configs]);
        } finally {
            await pool.end();
        }
    }

    async update(object: ChartConfig): Promise<void> {
        const { id, dashboardId, title, query, connectionId, type, ...config } = object;

        const pool = databaseProvider.createPool();
        try {
            await pool.query(this.createRequest, [id, dashboardId, title, query, connectionId, type, JSON.stringify(config)]
            );
        } finally {
            await pool.end();
        }
    }

    async delete(id: string): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`DELETE FROM charts WHERE id = $1`, [id]);
        } finally {
            await pool.end();
        }
    }

    async clear(): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`DELETE FROM charts`, []);
        } finally {
            await pool.end();
        }
    }
};

export default ChartRepository;