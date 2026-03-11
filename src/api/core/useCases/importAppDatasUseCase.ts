import ChartRepository from "@/src/api/repositories/chartRepository";
import ConnectionRepository from "@/src/api/repositories/connectionRepository";
import DashboardRepository from "@/src/api/repositories/dashboardRepository";
import type { AppDatas } from "@/src/shared/types";

/**
 * Use case: Importer les données de l'application
 */
export const importAppDatasUseCase = {
  execute: async (appDatas: AppDatas): Promise<void> => {
    const connectionRepository = new ConnectionRepository();
    const dashboardRepository = new DashboardRepository();
    const chartRepository = new ChartRepository();

    await connectionRepository.createMany(appDatas.connections);
    await dashboardRepository.createMany(appDatas.dashboards);
    await chartRepository.createMany(appDatas.charts);
  },
};