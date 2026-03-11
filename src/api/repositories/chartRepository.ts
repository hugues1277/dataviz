import { databaseProvider } from '../providers/databaseProvider';

const { queryWithRole } = databaseProvider;
import type { ChartConfig, ChartType } from '../../shared/types/types';
import ChartRepositoryInterface from '../interfaces/chartRepositoryInterface';

class ChartRepository extends ChartRepositoryInterface {

    private createRequest = `INSERT INTO charts (id, dashboard_id, title, query, connection_id, type, config) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
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
        const result = await queryWithRole<{ id: string; dashboard_id: string; title: string; query: string; connection_id: string; type: string; config: Record<string, unknown> }>(`SELECT id, dashboard_id, title, query, connection_id, type, config FROM charts WHERE id = $1`, [id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return {
            id: row.id,
            dashboardId: row.dashboard_id,
            title: row.title,
            query: row.query,
            connectionId: row.connection_id,
            type: row.type as ChartType,
            ...row.config
        };
    }

    async getAll(): Promise<ChartConfig[]> {
        type ChartRow = { id: string; dashboard_id: string; title: string; query: string; connection_id: string; type: string; config: Record<string, unknown> };
        const result = await queryWithRole<ChartRow>(`SELECT id, dashboard_id, title, query, connection_id, type, config FROM charts`, []);
        return result.rows.map(row => ({
            id: row.id,
            dashboardId: row.dashboard_id,
            title: row.title,
            query: row.query,
            connectionId: row.connection_id,
            type: row.type as ChartType,
            ...row.config
        }));
    }

    /**
     * Récupérer les charts d'un dashboard spécifique
     */
    async getByDashboard(id: string): Promise<ChartConfig[]> {
        type ChartRow = { id: string; dashboard_id: string; title: string; query: string; connection_id: string; type: string; config: Record<string, unknown> };
        const result = await queryWithRole<ChartRow>(`
            SELECT id, dashboard_id, title, query, connection_id, type, config
            FROM charts 
            WHERE dashboard_id = $1
        `, [id]);
        return result.rows.map(row => ({
            id: row.id,
            dashboardId: row.dashboard_id,
            title: row.title,
            query: row.query,
            connectionId: row.connection_id,
            type: row.type as ChartType,
            ...row.config
        }));
    }

    async create(chart: ChartConfig): Promise<void> {
        const { id, dashboardId, title, query, connectionId, type, ...config } = chart;
        await queryWithRole(this.createRequest, [
            id,
            dashboardId,
            title,
            query,
            connectionId,
            type,
            JSON.stringify(config),
        ]);
    }

    async createMany(objects: ChartConfig[]): Promise<void> {
        const values = objects.map(object => {
            const { id, dashboardId, title, query, connectionId, type, ...config } = object;
            return [id, dashboardId, title, query, connectionId, type, JSON.stringify(config)];
        });
        const ids = values.map(v => v[0]);
        const dashboardIds = values.map(v => v[1]);
        const titles = values.map(v => v[2]);
        const queries = values.map(v => v[3]);
        const connectionIds = values.map(v => v[4]);
        const types = values.map(v => v[5]);
        const configs = values.map(v => v[6]);
        await queryWithRole(this.createManyRequest, [ids, dashboardIds, titles, queries, connectionIds, types, configs]);
    }

    async update(object: ChartConfig): Promise<void> {
        const { id, dashboardId, title, query, connectionId, type, ...config } = object;
        await queryWithRole(this.createRequest, [id, dashboardId, title, query, connectionId, type, JSON.stringify(config)]);
    }

    async delete(id: string): Promise<void> {
        await queryWithRole(`DELETE FROM charts WHERE id = $1`, [id]);
    }

    /**
     * Supprimer tous les charts d'un dashboard
     */
    async deleteByDashboardId(dashboardId: string): Promise<void> {
        await queryWithRole(`DELETE FROM charts WHERE dashboard_id = $1`, [dashboardId]);
    }

    async clear(): Promise<void> {
        await queryWithRole(`DELETE FROM charts`, []);
    }
};

export default ChartRepository;