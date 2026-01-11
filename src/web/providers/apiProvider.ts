import { AppDatas, Dashboard, ChartConfig, DBConnection } from '../../shared/types/types';
import { IStorageProvider } from '../interfaces/IStorageProvider';

const API_BASE = ''; // Utilise le même serveur

/**
 * Provider sécurisé qui passe par l'API avec authentification
 * Toutes les requêtes incluent automatiquement les cookies de session
 */
export const storageProvider: IStorageProvider = {
    async init() {
        // L'initialisation des tables est gérée côté serveur
        // Cette méthode n'est plus nécessaire côté client
    },

    async getAppDatas(): Promise<AppDatas> {
        const response = await fetch(`${API_BASE}/api/app-datas`, {
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors du chargement des données de l\'application');
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
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors du chargement des dashboards et charts');
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
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors de la sauvegarde du dashboard');
        }
    },

    async deleteDashboard(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/api/dashboards/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors de la suppression du dashboard');
        }
    },

    // Charts
    async getAllCharts(): Promise<ChartConfig[]> {
        const response = await fetch(`${API_BASE}/api/charts`, {
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors du chargement des charts');
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
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors du chargement des charts');
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
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors de la sauvegarde du chart');
        }
    },

    async deleteChart(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/api/charts/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors de la suppression du chart');
        }
    },

    async deleteChartsByDashboard(dashboardId: string): Promise<void> {
        const response = await fetch(`${API_BASE}/api/dashboards/${dashboardId}/charts`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors de la suppression des charts');
        }
    },

    // Connections
    async getAllConnections(): Promise<DBConnection[]> {
        const response = await fetch(`${API_BASE}/api/connections`, {
            credentials: 'include',
        });


        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors du chargement des connections');
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
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors de la sauvegarde de la connection');
        }
    },

    async deleteConnection(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/api/connections/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors de la suppression de la connection');
        }
    },

    async importAppDatas(appDatas: AppDatas): Promise<void> {
        const response = await fetch(`${API_BASE}/api/import-app-datas`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appDatas),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors de l\'importation des données de l\'application');
        }
    },

    async exportAppDatas(): Promise<AppDatas> {
        const response = await fetch(`${API_BASE}/api/export-app-datas`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'exportation des données de l\'application');
        }

        const data = await response.json();
        return data;
    },

    async clearAll(): Promise<void> {
        const response = await fetch(`${API_BASE}/api/clear-all`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Session expirée, veuillez vous reconnecter');
            }
            throw new Error('Erreur lors de la suppression des données');
        }
    },
};



