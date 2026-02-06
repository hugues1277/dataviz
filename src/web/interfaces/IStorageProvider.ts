import { AppDatas, Dashboard, ChartConfig, DBConnection } from '../../shared/types/types';

export interface IStorageProvider {
  // Optional initialization method for setting up database schemas or connections
  init?: () => Promise<void>;

  // App Datas
  getAppDatas: () => Promise<AppDatas>;
  importAppDatas: (appDatas: AppDatas) => Promise<void>;
  exportAppDatas: () => Promise<AppDatas>;

  // Dashboards
  getAllDashboards: () => Promise<Dashboard[]>;
  putDashboard: (dashboard: Dashboard) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;

  // Charts
  getAllCharts: () => Promise<ChartConfig[]>;
  putChart: (chart: ChartConfig) => Promise<void>;
  deleteChart: (id: string) => Promise<void>;
  getChartsByDashboard: (dashboardId: string) => Promise<ChartConfig[]>;
  deleteChartsByDashboard: (dashboardId: string) => Promise<void>;

  // Connections
  getAllConnections: () => Promise<DBConnection[]>;
  putConnection: (connection: DBConnection) => Promise<void>;
  updateConnection: (connections: DBConnection) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;

  // Global
  clearAll: () => Promise<void>;
}