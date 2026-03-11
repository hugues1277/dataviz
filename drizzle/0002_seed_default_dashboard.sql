-- Seed: dashboard par défaut (idempotent)
INSERT INTO dashboards (id, name, order_index, variables)
VALUES ('019c03d0-bdae-7154-9ff0-5b7d00d62db2', 'Nouveau Dashboard', 0, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Le premier utilisateur (par createdAt) devient admin
UPDATE "user" SET "role" = 'admin'
WHERE "id" = (SELECT "id" FROM "user" ORDER BY "createdAt" ASC LIMIT 1);