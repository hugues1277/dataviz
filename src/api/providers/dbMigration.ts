import "dotenv/config";
import { databaseProvider } from './databaseProvider';
import logger from '../../shared/utils/logger';

const requests = [
  `
    CREATE TABLE IF NOT EXISTS dashboards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      order_index INT DEFAULT 0,
      variables JSONB DEFAULT '[]',
      default_preset TEXT
    );
    `,
  `
    CREATE TABLE IF NOT EXISTS charts (
      id TEXT PRIMARY KEY,
      dashboard_id TEXT NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
      title TEXT,
      query TEXT,
      connection_id TEXT,
      type TEXT,
      config JSONB DEFAULT '{}'
    );
    `,
  `
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      config JSONB DEFAULT '{}'
    );
    `,
  `create table if not exists "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);`,
  `create table if not exists "session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id") on delete cascade);`,
  `create table if not exists "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);`,
  `create table if not exists "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);`,
  `create index if not exists "session_userId_idx" on "session" ("userId");`,
  `create index if not exists "account_userId_idx" on "account" ("userId");`,
  `create index if not exists "verification_identifier_idx" on "verification" ("identifier");`,

  // Champ role pour les droits utilisateur (admin, read, edit)
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'edit';`,
  // Le premier utilisateur (par createdAt) devient admin
  `UPDATE "user" SET "role" = 'admin' WHERE "id" = (SELECT "id" FROM "user" ORDER BY "createdAt" ASC LIMIT 1);`,

  `INSERT INTO dashboards (id, name, order_index, variables) VALUES ('019c03d0-bdae-7154-9ff0-5b7d00d62db2', 'Nouveau Dashboard', 0, '[]')`,

  // RLS (Row Level Security) - lecture: SELECT uniquement, edit/admin: SELECT + INSERT + UPDATE + DELETE
  `ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE dashboards FORCE ROW LEVEL SECURITY`,
  `CREATE POLICY dashboards_select ON dashboards FOR SELECT USING (
    current_setting('app.user_role', true) IN ('read', 'edit', 'admin')
  )`,
  `CREATE POLICY dashboards_modify ON dashboards FOR INSERT WITH CHECK (
    current_setting('app.user_role', true) IN ('edit', 'admin')
  )`,
  `CREATE POLICY dashboards_update ON dashboards FOR UPDATE USING (
    current_setting('app.user_role', true) IN ('edit', 'admin')
  ) WITH CHECK (current_setting('app.user_role', true) IN ('edit', 'admin'))`,
  `CREATE POLICY dashboards_delete ON dashboards FOR DELETE USING (
    current_setting('app.user_role', true) IN ('edit', 'admin')
  )`,

  `ALTER TABLE charts ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE charts FORCE ROW LEVEL SECURITY`,
  `CREATE POLICY charts_select ON charts FOR SELECT USING (
    current_setting('app.user_role', true) IN ('read', 'edit', 'admin')
  )`,
  `CREATE POLICY charts_modify ON charts FOR INSERT WITH CHECK (
    current_setting('app.user_role', true) IN ('edit', 'admin')
  )`,
  `CREATE POLICY charts_update ON charts FOR UPDATE USING (
    current_setting('app.user_role', true) IN ('edit', 'admin')
  ) WITH CHECK (current_setting('app.user_role', true) IN ('edit', 'admin'))`,
  `CREATE POLICY charts_delete ON charts FOR DELETE USING (
    current_setting('app.user_role', true) IN ('edit', 'admin')
  )`,

  `ALTER TABLE connections ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE connections FORCE ROW LEVEL SECURITY`,
  `CREATE POLICY connections_select ON connections FOR SELECT USING (
    current_setting('app.user_role', true) IN ('read', 'edit', 'admin')
  )`,
  `CREATE POLICY connections_modify ON connections FOR INSERT WITH CHECK (
    current_setting('app.user_role', true) IN ('edit', 'admin')
  )`,
  `CREATE POLICY connections_update ON connections FOR UPDATE USING (
    current_setting('app.user_role', true) IN ('edit', 'admin')
  ) WITH CHECK (current_setting('app.user_role', true) IN ('edit', 'admin'))`,
  `CREATE POLICY connections_delete ON connections FOR DELETE USING (
    current_setting('app.user_role', true) IN ('edit', 'admin')
  )`,
];

export const runDbMigration = async () => {
  const pool = databaseProvider.createPool();

  try {
    console.log('🔄 Migration de la base de données...');

    for (const request of requests) {
      await pool.query(request);
    }

    console.log('✅ Migration terminée avec succès');
  } catch (error: unknown) {
    logger.error('runDbMigration', error);
  } finally {
    await pool.end();
  }
}


