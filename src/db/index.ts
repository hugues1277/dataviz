/**
 * Client Drizzle ORM pour PostgreSQL
 * Utilise le pool pg existant via databaseProvider pour la compatibilité RLS
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { databaseProvider } from "@/src/api/providers/databaseProvider";
import * as schema from "./schema";

const pool = databaseProvider.createPool();

export const db = drizzle({ client: pool, schema });

export type Database = typeof db;
