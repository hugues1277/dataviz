import { databaseProvider } from '../providers/databaseProvider';
import type { ChartConfig } from '../../shared/types/types';

/**
 * Repositories pour les charts
 */
export const chartRepository = {
    /**
     * Récupérer tous les charts de l'utilisateur authentifié
     */
    async getAllCharts(): Promise<ChartConfig[]> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`
        SELECT id, dashboard_id, title, query, connection_id, type, config
        FROM charts 
      `, []);

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
    },

    /**
     * Récupérer les charts d'un dashboard spécifique
     */
    async getChartsByDashboard(dashboardId: string): Promise<ChartConfig[]> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`
        SELECT id, dashboard_id, title, query, connection_id, type, config
        FROM charts 
        WHERE dashboard_id = $2
      `, [dashboardId]);

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
    },

    /**
     * Créer ou mettre à jour un chart
     */
    async putChart(chart: ChartConfig): Promise<void> {
        const { id, dashboardId, title, query, connectionId, type, ...config } = chart;

        const pool = databaseProvider.createPool();
        try {
            await pool.query(`
        INSERT INTO charts (id, dashboard_id, title, query, connection_id, type, config)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          dashboard_id = EXCLUDED.dashboard_id,
          title = EXCLUDED.title,
          query = EXCLUDED.query,
          connection_id = EXCLUDED.connection_id,
          type = EXCLUDED.type,
          config = EXCLUDED.config
      `, [
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
    },

    /**
     * Supprimer un chart
     */
    async deleteChart(chartId: string): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`
        DELETE FROM charts 
        WHERE id = $1
      `, [chartId]);
        } finally {
            await pool.end();
        }
    },

    async putCharts(charts: ChartConfig[]): Promise<void> {
        const pool = databaseProvider.createPool();

        const ids: string[] = [];
        const dashboardIds: string[] = [];
        const titles: string[] = [];
        const queries: string[] = [];
        const connectionIds: string[] = [];
        const types: string[] = [];
        const configs: string[] = [];

        for (const chart of charts) {
            const { id, dashboardId, title, query, connectionId, type, ...config } = chart;

            ids.push(id);
            dashboardIds.push(dashboardId);
            titles.push(title);
            queries.push(query);
            connectionIds.push(connectionId);
            types.push(type);
            configs.push(JSON.stringify(config));
        }

        try {
            await pool.query(`
                INSERT INTO charts (id, dashboard_id, title, query, connection_id, type, config)
                SELECT *
                FROM UNNEST(
                $1::uuid[],
                $2::uuid[],
                $3::text[],
                $4::text[],
                $5::uuid[],
                $6::text[],
                $7::jsonb[]
                )
                ON CONFLICT (id) DO UPDATE SET
                  dashboard_id = EXCLUDED.dashboard_id,
                  title = EXCLUDED.title,
                  query = EXCLUDED.query,
                  connection_id = EXCLUDED.connection_id,
                  type = EXCLUDED.type,
                  config = EXCLUDED.config
            `, [ids, dashboardIds, titles, queries, connectionIds, types, configs]
            );
        } finally {
            await pool.end();
        }
    },

    /**
     * Supprimer tous les charts d'un dashboard
     */
    async deleteChartsByDashboard(dashboardId: string): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`
        DELETE FROM charts 
        WHERE dashboard_id = $1
      `, [dashboardId]);
        } finally {
            await pool.end();
        }
    },

    /**
     * Supprimer tous les charts
     */
    async clearAll(): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`
        DELETE FROM charts 
      `, []);
        } finally {
            await pool.end();
        }
    },
};

