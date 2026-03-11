import { databaseProvider } from "@/src/api/providers/databaseProvider";
import type { Dashboard, DashboardVariable } from "@/src/shared/types";
import ObjectRepositoryInterface from "@/src/api/interfaces/objectRepositoryInterface";

const { queryWithRole } = databaseProvider;

class DashboardRepository extends ObjectRepositoryInterface<Dashboard> {
    private createRequest = `INSERT INTO dashboards (id, name, order_index, variables) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET
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
        type DashboardRow = { id: string; name: string; order_index: number; variables: unknown[] };
        const result = await queryWithRole<DashboardRow>(`SELECT id, name, order_index, variables FROM dashboards ORDER BY order_index ASC`, []);
        return result.rows.map(row => ({
            id: row.id,
            name: row.name,
            order: row.order_index,
            variables: (row.variables || []) as DashboardVariable[],
        }));
    }

    async get(id: string): Promise<Dashboard | null> {
        const result = await queryWithRole<{ id: string; name: string; order_index: number; variables: unknown[] }>(`SELECT id, name, order_index, variables FROM dashboards WHERE id = $1`, [id]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            order: row.order_index,
            variables: (row.variables || []) as DashboardVariable[],
        };
    }

    async create(dashboard: Dashboard): Promise<void> {
        await queryWithRole(this.createRequest, [
            dashboard.id,
            dashboard.name,
            dashboard.order || 0,
            JSON.stringify(dashboard.variables || []),
        ]);
    }

    async createMany(dashboards: Dashboard[]): Promise<void> {
        const values = dashboards.map(dashboard => {
            const { id, name, order, variables } = dashboard;
            return [id, name, order ?? 0, JSON.stringify(variables ?? [])];
        });
        const ids = values.map(v => v[0]);
        const names = values.map(v => v[1]);
        const orders = values.map(v => v[2]);
        const variables = values.map(v => v[3]);
        await queryWithRole(this.createManyRequest, [ids, names, orders, variables]);
    }

    async delete(id: string): Promise<void> {
        await queryWithRole(`DELETE FROM dashboards WHERE id = $1`, [id]);
    }

    async clear(): Promise<void> {
        await queryWithRole(`DELETE FROM dashboards`, []);
    }
};

export default DashboardRepository;