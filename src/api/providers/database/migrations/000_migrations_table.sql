-- Migration 000: Table pour suivre l'historique des migrations
-- Cette migration doit toujours être exécutée en premier
CREATE TABLE
  IF NOT EXISTS migrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
  );