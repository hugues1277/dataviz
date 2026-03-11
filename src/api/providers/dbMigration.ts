import "dotenv/config";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import logger from "@/src/shared/utils/logger";

/**
 * Exécute les migrations Drizzle.
 * Utilise le dossier drizzle/ contenant les fichiers SQL générés.
 */
export const runDbMigration = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    logger.error("runDbMigration", new Error("DATABASE_URL is not defined"));
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle({ client: pool });

  try {
    console.log("🔄 Migration de la base de données (Drizzle)...");

    await migrate(db, {
      migrationsFolder: resolve(process.cwd(), "drizzle"),
    });

    console.log("✅ Migration terminée avec succès");
  } catch (error: unknown) {
    logger.error("runDbMigration", error);
    throw error;
  } finally {
    await pool.end();
  }
};
