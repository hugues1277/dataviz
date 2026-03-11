/**
 * Schéma Drizzle ORM pour PostgreSQL
 * Tables métier : dashboards, charts, connections
 * Tables Better Auth : user, session, account, verification
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =============================================================================
// Tables métier
// =============================================================================

export const dashboards = pgTable(
  "dashboards",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    variables: jsonb("variables").default([]).$type<unknown[]>().notNull(),
    defaultPreset: text("default_preset"),
  },
  (t) => [index("dashboards_order_idx").on(t.orderIndex)]
);

export const dashboardsRelations = relations(dashboards, ({ many }) => ({
  charts: many(charts),
}));

export const connections = pgTable("connections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: jsonb("config").default({}).$type<Record<string, unknown>>().notNull(),
});

export const connectionsRelations = relations(connections, ({ many }) => ({
  charts: many(charts),
}));

export const charts = pgTable(
  "charts",
  {
    id: text("id").primaryKey(),
    dashboardId: text("dashboard_id")
      .notNull()
      .references(() => dashboards.id, { onDelete: "cascade" }),
    title: text("title"),
    query: text("query"),
    connectionId: text("connection_id").references(() => connections.id, {
      onDelete: "set null",
    }),
    type: text("type"),
    config: jsonb("config").default({}).$type<Record<string, unknown>>().notNull(),
  },
  (t) => [
    index("charts_dashboard_id_idx").on(t.dashboardId),
    index("charts_connection_id_idx").on(t.connectionId),
  ]
);

export const chartsRelations = relations(charts, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [charts.dashboardId],
    references: [dashboards.id],
  }),
  connection: one(connections, {
    fields: [charts.connectionId],
    references: [connections.id],
  }),
}));

// =============================================================================
// Tables Better Auth (noms de tables préservés pour compatibilité)
// =============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  role: text("role").default("edit"),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_userId_idx").on(t.userId)]
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  },
  (t) => [index("account_userId_idx").on(t.userId)]
);

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)]
);
