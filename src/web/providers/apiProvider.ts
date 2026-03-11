import type {
  AppDatas,
  Dashboard,
  ChartConfig,
  DBConnection,
} from "../../shared/types";
import { IStorageProvider } from '../interfaces/IStorageProvider';
import { t } from '../../i18n/i18n';

const API_BASE = ''; // Utilise le même serveur

/**
 * Provider sécurisé qui passe par l'API avec authentification
 * Toutes les requêtes incluent automatiquement les cookies de session
 */
export const storageProvider: IStorageProvider = {

    async getAppDatas(): Promise<AppDatas> {
        const response = await fetch(`${API_BASE}/api/app-datas`, {
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.loadAppDataError'));
        }

        const data = await response.json();
        return data;
    },

    async getAllDashboards(): Promise<Dashboard[]> {
        const response = await fetch(`${API_BASE}/api/dashboards`, {
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.loadDashboardsError'));
        }

        const data = await response.json();
        return data;
    },

    async putDashboard(dashboard: Dashboard): Promise<void> {
        const response = await fetch(`${API_BASE}/api/dashboards`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dashboard),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.saveDashboardError'));
        }
    },

    async deleteDashboard(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/api/dashboards/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.deleteDashboardError'));
        }
    },

    // Charts
    async getAllCharts(): Promise<ChartConfig[]> {
        const response = await fetch(`${API_BASE}/api/charts`, {
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.loadChartsError'));
        }

        const data = await response.json();
        return data.charts;
    },

    async getChartsByDashboard(dashboardId: string): Promise<ChartConfig[]> {
        const response = await fetch(`${API_BASE}/api/dashboards/${dashboardId}/charts`, {
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.loadChartsError'));
        }

        const data = await response.json();
        return data.charts;
    },

    async putChart(chart: ChartConfig): Promise<void> {
        const response = await fetch(`${API_BASE}/api/charts`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chart),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.saveChartError'));
        }
    },

    async deleteChart(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/api/charts/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.deleteChartError'));
        }
    },

    async deleteChartsByDashboard(dashboardId: string): Promise<void> {
        const response = await fetch(`${API_BASE}/api/dashboards/${dashboardId}/charts`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.deleteChartsError'));
        }
    },

    // Connections
    async getAllConnections(): Promise<DBConnection[]> {
        const response = await fetch(`${API_BASE}/api/connections`, {
            credentials: 'include',
        });


        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.loadConnectionsError'));
        }

        const data = await response.json();
        return data as DBConnection[];
    },

    async putConnection(connection: DBConnection): Promise<void> {
        const response = await fetch(`${API_BASE}/api/connections`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(connection),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.saveConnectionError'));
        }
    },

    async updateConnection(connection: DBConnection): Promise<void> {
        const response = await fetch(`${API_BASE}/api/connections`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(connection),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.saveConnectionError'));
        }
    },

    async deleteConnection(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/api/connections/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.deleteConnectionError'));
        }
    },

    async importAppDatas(appDatas: AppDatas): Promise<void> {
        const response = await fetch(`${API_BASE}/api/settings/import`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appDatas),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.importAppDataError'));
        }
    },

    async exportAppDatas(): Promise<AppDatas> {
        const response = await fetch(`${API_BASE}/api/settings/export`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(t('exceptions.api.exportAppDataError'));
        }

        const data = await response.json();
        return data;
    },

    async clearAll(): Promise<void> {
        const response = await fetch(`${API_BASE}/api/settings/clear`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(t('exceptions.api.sessionExpired'));
            }
            throw new Error(t('exceptions.api.clearAllError'));
        }
    },
};



