import { databaseProvider } from '../providers/databaseProvider';
import type { Dashboard, ChartConfig } from '../../shared/types/types';

/**
 * Repositories pour les dashboards
 */
export const dashboardRepository = {
    /**
     * Récupérer tous les dashboards de l'utilisateur authentifié
     */
    async getAllDashboards(): Promise<Dashboard[]> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`
        SELECT id, name, order_index, variables
        FROM dashboards 
        ORDER BY order_index ASC
      `, []);

            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                order: row.order_index,
                variables: row.variables || [],
            }));
        } finally {
            await pool.end();
        }
    },

    /**
     * Récupérer tous les dashboards avec leurs charts
     */
    async getAllDashboardsWithCharts(): Promise<{ dashboards: Dashboard[], charts: ChartConfig[] }> {
        const pool = databaseProvider.createPool();
        try {
            const [dashboardsResult, chartsResult] = await Promise.all([
                pool.query(`
          SELECT id, name, order_index, variables
          FROM dashboards 
          ORDER BY order_index ASC
        `, []),
                pool.query(`
          SELECT id, dashboard_id, title, query, connection_id, type, config
          FROM charts 
        `, [])
            ]);

            const dashboards = dashboardsResult.rows.map(row => ({
                id: row.id,
                name: row.name,
                order: row.order_index,
                variables: row.variables || [],
                charts: chartsResult.rows.filter(chart => chart.dashboard_id === row.id).map(chart => ({
                    id: chart.id,
                    dashboardId: chart.dashboard_id,
                    title: chart.title,
                    query: chart.query,
                    connectionId: chart.connection_id,
                    type: chart.type,
                    ...chart.config
                }))
            }));

            const charts = chartsResult.rows.map(row => ({
                id: row.id,
                dashboardId: row.dashboard_id,
                title: row.title,
                query: row.query,
                connectionId: row.connection_id,
                type: row.type,
                ...row.config
            }));

            return { dashboards, charts };
        } finally {
            await pool.end();
        }
    },

    /**
     * Créer ou mettre à jour un dashboard
     */
    async putDashboard(dashboard: Dashboard): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`
        INSERT INTO dashboards (id, name, order_index, variables)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          order_index = EXCLUDED.order_index,
          variables = EXCLUDED.variables
      `, [
                dashboard.id,
                dashboard.name,
                dashboard.order || 0,
                JSON.stringify(dashboard.variables || []),
            ]);
        } finally {
            await pool.end();
        }
    },

    async putDashboards(dashboards: Dashboard[]): Promise<void> {
        const pool = databaseProvider.createPool();

        try {
            const ids: string[] = [];
            const names: string[] = [];
            const orders: number[] = [];
            const variables: string[] = [];

            for (const dashboard of dashboards) {
                ids.push(dashboard.id);
                names.push(dashboard.name);
                orders.push(dashboard.order ?? 0);
                variables.push(JSON.stringify(dashboard.variables ?? []));
            }

            await pool.query(`
            INSERT INTO dashboards (id, name, order_index, variables)
            SELECT *
            FROM UNNEST(
              $1::uuid[],
              $2::text[],
              $3::int[],
              $4::jsonb[]
            )
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              order_index = EXCLUDED.order_index,
              variables = EXCLUDED.variables
          `, [ids, names, orders, variables]);

        } finally {
            await pool.end();
        }
    },

    /**
     * Supprimer un dashboard (et ses charts en cascade)
     */
    async deleteDashboard(dashboardId: string): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`
        DELETE FROM dashboards 
        WHERE id = $1
      `, [dashboardId]);
        } finally {
            await pool.end();
        }
    },

    /**
     * Supprimer tous les dashboards
     */
    async clearAll(): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`
        DELETE FROM dashboards 
      `, []);
        } finally {
            await pool.end();
        }
    },
};

