import { AnnotationConfig, ChartConfig, Dashboard, DBConnection } from "./types/types";

export const ALL_TIME_FROM = new Date("2000-01-01T00:00:00");
export const ALL_TIME_TO = new Date("2100-12-31T23:59:00");

export const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f43f5e",
  "#6b7280",
  "#a855f7",
  "#d946ef",
  "#f87171",
  "#fbbf24",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export const ANNOTATION_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];

export const DEFAULT_CHART_QUERY = "SELECT current_timestamp as time, floor(random() * 100) as value";


export const QUERY_CACHE_TTL = 3600; // 1 heure de cache par défaut

// Nombre de jours par défaut pour la plage de dates initiale
export const DEFAULT_DATE_RANGE_DAYS = 7;

export const DEFAULT_DASHBOARD_NAME = "Nouveau Dashboard";

export const DEFAULT_DASHBOARD: Dashboard = {
  id: crypto.randomUUID(),
  name: DEFAULT_DASHBOARD_NAME,
  order: 0,
  variables: [],
};

export const DEFAULT_CHART: ChartConfig = {
  id: crypto.randomUUID(),
  dashboardId: "",
  title: "Graphique",
  query: "SELECT current_timestamp as time, floor(random() * 100) as value",
  type: "line",
  connectionId: "",
  yAxisKeys: [],
  xAxisFormat: "string",
  rotateXLabels: false,
  xAxisTitle: "",
  yAxisTitle: "",
  refreshInterval: 0,
  xAxisKey: "",
  yAxisFormats: {},
  annotations: [],
};

export const DEFAULT_ANNOTATION: AnnotationConfig = {
  id: crypto.randomUUID(),
  type: "x",
  value: "",
  label: "",
  color: "#ef4444",
};

export const DEFAULT_CONNECTION: DBConnection = {
  id: crypto.randomUUID(),
  name: "",
  type: "postgres",
  host: "localhost",
  port: 5432,
  database: "",
  user: "postgres",
  ssl: false,
  apiUrl: "",
  apiToken: "",
};