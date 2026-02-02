import { databaseProvider } from '../providers/database/databaseProvider';
import type { Dashboard } from '../../shared/types/types';
import ObjectRepositoryInterface from '../interfaces/objectRepositoryInterface';

class DashboardRepository extends ObjectRepositoryInterface<Dashboard> {
    private createRequest = `INSERT INTO dashboards (id, name, order_index, variables)
        VALUES ($1::uuid, $2::text, $3::int, $4::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          order_index = EXCLUDED.order_index,
          variables = EXCLUDED.variables
    `;

    private createManyRequest = `INSERT INTO dashboards (id, name, order_index, variables)
        SELECT *
        FROM UNNEST($1::uuid[], $2::text[], $3::int[], $4::jsonb[])
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          order_index = EXCLUDED.order_index,
          variables = EXCLUDED.variables
    `;

    async getAll(): Promise<Dashboard[]> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`SELECT id, name, order_index, variables FROM dashboards ORDER BY order_index ASC`, []);

            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                order: row.order_index,
                variables: row.variables || [],
            }));
        } finally {
            await pool.end();
        }
    }

    async get(id: string): Promise<Dashboard | null> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`SELECT id, name, order_index, variables FROM dashboards WHERE id = $1`, [id]);

            return {
                id: result.rows[0].id,
                name: result.rows[0].name,
                order: result.rows[0].order_index,
                variables: result.rows[0].variables || [],
            };
        } finally {
            await pool.end();
        }
    }

    async create(dashboard: Dashboard): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(this.createRequest, [
                dashboard.id,
                dashboard.name,
                dashboard.order || 0,
                JSON.stringify(dashboard.variables || []),
            ]);
        } finally {
            await pool.end();
        }
    }

    async createMany(dashboards: Dashboard[]): Promise<void> {
        const pool = databaseProvider.createPool();

        try {
            const ids: string[] = [];
            const names: string[] = [];
            const orders: number[] = [];
            const variables: string[] = [];

            dashboards.forEach(dashboard => {
                ids.push(dashboard.id);
                names.push(dashboard.name);
                orders.push(dashboard.order ?? 0);
                variables.push(JSON.stringify(dashboard.variables ?? []));
            });

            await pool.query(this.createManyRequest, [ids, names, orders, variables]);

        } finally {
            await pool.end();
        }
    }

    async delete(id: string): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`DELETE FROM dashboards WHERE id = $1`, [id]);
        } finally {
            await pool.end();
        }
    }

    async clear(): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`DELETE FROM dashboards`, []);
        } finally {
            await pool.end();
        }
    }
};

export default DashboardRepository;