import { logger, User } from "better-auth";
import { databaseProvider } from "../providers/database/databaseProvider";
import UserRepositoryInterface from "../interfaces/userRepositoryInterface";

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

    async get(id: string): Promise<User | null> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`SELECT id, name, email FROM "user" WHERE id = $1`, [id]);
            return result.rows[0] as User;
        } finally {
            await pool.end();
        }
    }

    async getAll(): Promise<User[]> {
        const pool = databaseProvider.createPool();
        try {
            const result = await pool.query(`SELECT id, name, email FROM "user"`, []);
            return result.rows.map(row => row as User);
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