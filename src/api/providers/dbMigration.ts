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

  `INSERT INTO dashboards (id, name, order_index, variables) VALUES ('019c03d0-bdae-7154-9ff0-5b7d00d62db2', 'Nouveau Dashboard', 0, '[]')`,
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


