-- Migration 001: Tables initiales pour dashboards, charts et connections
CREATE TABLE
  IF NOT EXISTS dashboards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    order_index INT DEFAULT 0,
    variables JSONB DEFAULT '[]',
    default_preset TEXT
  );

CREATE TABLE
  IF NOT EXISTS charts (
    id TEXT PRIMARY KEY,
    dashboard_id TEXT NOT NULL REFERENCES dashboards (id) ON DELETE CASCADE,
    title TEXT,
    query TEXT,
    connection_id TEXT,
    type TEXT,
    config JSONB DEFAULT '{}'
  );

CREATE TABLE
  IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    config JSONB DEFAULT '{}'
  );