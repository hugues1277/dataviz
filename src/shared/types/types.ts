export const CONNECTION_TYPES = {
  POSTGRES: 'postgres',
  MYSQL: 'mysql',
  API: 'api',
} as const;

export const isDatabaseType = (type: ConnectionType) => {
  return type === CONNECTION_TYPES.POSTGRES || type === CONNECTION_TYPES.MYSQL;
};

export const isApiType = (type: ConnectionType) => {
  return type === CONNECTION_TYPES.API;
};

export const DATABASE_TYPES = {
  POSTGRES: 'postgresql',
  MYSQL: 'mysql',
} as const;

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  TABLE: 'table',
  STAT: 'stat',
  RADIAL: 'radial',
  AREA: 'area',
  SCATTER: 'scatter',
} as const;

export const VARIABLE_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  SELECT: 'select',
  BOOLEAN: 'boolean',
} as const;

export const CHART_VERSION = {
  BAR_CLASSIC: 'barClassic',
  BAR_STACKED: 'barStacked',
} as const;


export type ChartType = (typeof CHART_TYPES)[keyof typeof CHART_TYPES];
export type VariableType = (typeof VARIABLE_TYPES)[keyof typeof VARIABLE_TYPES];
export type ChartVersionType = (typeof CHART_VERSION)[keyof typeof CHART_VERSION];
export type XAxisFormat = 'string' | 'date' | 'datetime' | 'time' | 'int';
export type ConnectionType = (typeof CONNECTION_TYPES)[keyof typeof CONNECTION_TYPES];

export interface VariableOption {
  label: string;
  value: string;
}

export interface DashboardVariable {
  id: string;
  name: string; // Utilisé comme {{name}}
  label: string;
  type: VariableType;
  defaultValue: string;
  options?: VariableOption[];
}

/** Pour axe X : top | bottom. Pour axe Y : left | right */
export type AnnotationLabelPosition = 'top' | 'bottom' | 'left' | 'right';

export interface AnnotationConfig {
  id: string;
  type: 'x' | 'y';
  value: string | number;
  label: string;
  color: string;
  labelPosition?: AnnotationLabelPosition;
}

export interface DBConnection {
  id: string;
  name: string;
  type: ConnectionType;
  isDefault?: boolean;
  // Postgres fields
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  // API fields
  apiUrl?: string;
  apiToken?: string;
}

export type DBConnectionConfig = Omit<DBConnection, 'id' | 'name' | 'type'>;

export interface ChartLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChartConfig {
  id: string;
  dashboardId: string;
  title: string;
  query: string;
  connectionId: string;
  type: ChartType;
  version?: ChartVersionType;
  xAxisKey?: string;
  yAxisKeys?: string[];
  xAxisFormat?: XAxisFormat;
  rotateXLabels?: boolean;
  xAxisTitle?: string;
  yAxisTitle?: string;
  refreshInterval?: number;
  layout?: ChartLayout;
  yAxisFormats?: Record<string, XAxisFormat>;
  annotations?: AnnotationConfig[];
}

export interface Dashboard {
  id: string;
  name: string;
  order?: number;
  variables?: DashboardVariable[];
}

export interface DashboardWithCharts extends Dashboard {
  charts: ChartConfig[];
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  error?: string;
}

export interface AppDatas {
  connections: DBConnection[];
  dashboards: Dashboard[];
  charts: ChartConfig[];
}