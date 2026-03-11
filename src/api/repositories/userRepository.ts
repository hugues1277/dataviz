import { logger, User } from "better-auth";
import { databaseProvider } from "../providers/databaseProvider";
import UserRepositoryInterface from "../interfaces/userRepositoryInterface";

export type UserRole = "admin" | "read" | "edit";

export interface UserWithRole extends User {
    role?: UserRole;
}

class UserRepository extends UserRepositoryInterface {

    async getCount(): Promise<number> {
        try {
            const pool = databaseProvider.createPool();
            const result = await pool.query(`SELECT COUNT(*) FROM "user"`, []);
            return parseInt(result.rows[0]?.count || "0", 10);
        } catch (error: any) {
            logger.error('UserRepository.getCount', error);
            throw error;
        }
    }

    async getAdminCount(): Promise<number> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(
                `SELECT COUNT(*) FROM "user" WHERE "role" = 'admin'`,
                []
            );
            return parseInt(result.rows[0]?.count || "0", 10);
        } finally {
            await pool.end();
        }
    }

    async getFirstUserId(): Promise<string | null> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(
                `SELECT "id" FROM "user" ORDER BY "createdAt" ASC LIMIT 1`,
                []
            );
            return result.rows[0]?.id ?? null;
        } finally {
            await pool.end();
        }
    }

    async get(id: string): Promise<UserWithRole | null> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`SELECT id, name, email, role FROM "user" WHERE id = $1`, [id]);
            return result.rows[0] as UserWithRole;
        } finally {
            await pool.end();
        }
    }

    async getAll(): Promise<UserWithRole[]> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`SELECT id, name, email, "createdAt", "role" FROM "user" ORDER BY "createdAt" ASC`, []);
            return result.rows.map(row => row as UserWithRole);
        } finally {
            await pool.end();
        }
    }

    async create(user: User): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`INSERT INTO "user" (id, name, email) VALUES ($1, $2, $3)`, [user.id, user.name, user.email]);
        } finally {
            await pool.end();
        }
    }

    async update(user: User): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`UPDATE "user" SET name = $1, email = $2 WHERE id = $3`, [user.name, user.email, user.id]);
        } finally {
            await pool.end();
        }
    }

    async updateById(id: string, data: { name?: string; email?: string }): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            if (data.name !== undefined && data.email !== undefined) {
                await pool.query(`UPDATE "user" SET name = $1, email = $2 WHERE id = $3`, [data.name, data.email, id]);
            } else if (data.name !== undefined) {
                await pool.query(`UPDATE "user" SET name = $1 WHERE id = $2`, [data.name, id]);
            } else if (data.email !== undefined) {
                await pool.query(`UPDATE "user" SET email = $1 WHERE id = $2`, [data.email, id]);
            }
        } finally {
            await pool.end();
        }
    }

    async updateRole(id: string, role: UserRole): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`UPDATE "user" SET "role" = $1 WHERE id = $2`, [role, id]);
        } finally {
            await pool.end();
        }
    }

    async delete(id: string): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`DELETE FROM "user" WHERE id = $1`, [id]);
        } finally {
            await pool.end();
        }
    }

    async clear(): Promise<void> {
        const pool = databaseProvider.createPool();
        try {
            await pool.query(`DELETE FROM "user"`, []);
        } finally {
            await pool.end();
        }
    }
}

export default UserRepository;