-- RLS (Row Level Security) pour dashboards, charts, connections
-- Lecture: SELECT pour read, edit, admin | Modification: INSERT/UPDATE/DELETE pour edit, admin

ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards FORCE ROW LEVEL SECURITY;
CREATE POLICY dashboards_select ON dashboards FOR SELECT USING (
  current_setting('app.user_role', true) IN ('read', 'edit', 'admin')
);
CREATE POLICY dashboards_modify ON dashboards FOR INSERT WITH CHECK (
  current_setting('app.user_role', true) IN ('edit', 'admin')
);
CREATE POLICY dashboards_update ON dashboards FOR UPDATE USING (
  current_setting('app.user_role', true) IN ('edit', 'admin')
) WITH CHECK (current_setting('app.user_role', true) IN ('edit', 'admin'));
CREATE POLICY dashboards_delete ON dashboards FOR DELETE USING (
  current_setting('app.user_role', true) IN ('edit', 'admin')
);

ALTER TABLE charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE charts FORCE ROW LEVEL SECURITY;
CREATE POLICY charts_select ON charts FOR SELECT USING (
  current_setting('app.user_role', true) IN ('read', 'edit', 'admin')
);
CREATE POLICY charts_modify ON charts FOR INSERT WITH CHECK (
  current_setting('app.user_role', true) IN ('edit', 'admin')
);
CREATE POLICY charts_update ON charts FOR UPDATE USING (
  current_setting('app.user_role', true) IN ('edit', 'admin')
) WITH CHECK (current_setting('app.user_role', true) IN ('edit', 'admin'));
CREATE POLICY charts_delete ON charts FOR DELETE USING (
  current_setting('app.user_role', true) IN ('edit', 'admin')
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections FORCE ROW LEVEL SECURITY;
CREATE POLICY connections_select ON connections FOR SELECT USING (
  current_setting('app.user_role', true) IN ('read', 'edit', 'admin')
);
CREATE POLICY connections_modify ON connections FOR INSERT WITH CHECK (
  current_setting('app.user_role', true) IN ('edit', 'admin')
);
CREATE POLICY connections_update ON connections FOR UPDATE USING (
  current_setting('app.user_role', true) IN ('edit', 'admin')
) WITH CHECK (current_setting('app.user_role', true) IN ('edit', 'admin'));
CREATE POLICY connections_delete ON connections FOR DELETE USING (
  current_setting('app.user_role', true) IN ('edit', 'admin')
);