import { AppDatas, Dashboard, ChartConfig, DBConnection } from '../../../shared/types/types';
import { IStorageProvider } from '../../interfaces/IStorageProvider';

// Use cases
import { getAppDatasUseCase } from '../../../api/core/useCases/getAppDatasUseCase';
import { importAppDatasUseCase } from '../../../api/core/useCases/importAppDatasUseCase';
import exportDataUseCase from '../../../api/core/useCases/exportDataUseCase';
import clearAllDatasUseCase from '../../../api/core/useCases/clearAllDatasUseCase';

// Repositories
import DashboardRepository from '../../../api/repositories/dashboardRepository';
import ChartRepository from '../../../api/repositories/chartRepository';
import ConnectionRepository from '../../../api/repositories/connectionRepository';

/**
 * Provider pour Tauri qui appelle directement les fonctions backend
 * sans passer par HTTP. Utilise les use cases et repositories directement.
 */
export const tauriStorageProvider: IStorageProvider = {
    async init() {
        // L'initialisation des tables est gérée côté serveur
        // Cette méthode n'est plus nécessaire côté client
    },

    async getAppDatas(): Promise<AppDatas> {
        return await getAppDatasUseCase.execute();
    },

    async getAllDashboards(): Promise<Dashboard[]> {
        const dashboardRepository = new DashboardRepository();
        return await dashboardRepository.getAll();
    },

    async putDashboard(dashboard: Dashboard): Promise<void> {
        const dashboardRepository = new DashboardRepository();
        return await dashboardRepository.create(dashboard);
    },

    async deleteDashboard(id: string): Promise<void> {
        const dashboardRepository = new DashboardRepository();
        return await dashboardRepository.delete(id);
    },

    // Charts
    async getAllCharts(): Promise<ChartConfig[]> {
        const chartRepository = new ChartRepository();
        return await chartRepository.getAll();
    },

    async putChart(chart: ChartConfig): Promise<void> {
        const chartRepository = new ChartRepository();
        return await chartRepository.create(chart);
    },

    async deleteChart(id: string): Promise<void> {
        const chartRepository = new ChartRepository();
        return await chartRepository.delete(id);
    },

    async getChartsByDashboard(dashboardId: string): Promise<ChartConfig[]> {
        const chartRepository = new ChartRepository();
        return await chartRepository.getByDashboard(dashboardId);
    },

    async deleteChartsByDashboard(dashboardId: string): Promise<void> {
        const chartRepository = new ChartRepository();
        return await chartRepository.deleteByDashboard(dashboardId);
    },

    // Connections
    async getAllConnections(): Promise<DBConnection[]> {
        const connectionRepository = new ConnectionRepository();
        return await connectionRepository.getAll();
    },

    async putConnection(connection: DBConnection): Promise<void> {
        const connectionRepository = new ConnectionRepository();
        return await connectionRepository.create(connection);
    },

    async deleteConnection(id: string): Promise<void> {
        const connectionRepository = new ConnectionRepository();
        return await connectionRepository.delete(id);
    },

    async importAppDatas(appDatas: AppDatas): Promise<void> {
        return await importAppDatasUseCase.execute(appDatas);
    },

    async exportAppDatas(): Promise<AppDatas> {
        return await exportDataUseCase.execute();
    },

    async clearAll(): Promise<void> {
        return await clearAllDatasUseCase.execute();
    },
};
