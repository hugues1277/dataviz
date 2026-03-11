import ConnectionRepository from "@/src/api/repositories/connectionRepository";
import DashboardRepository from "@/src/api/repositories/dashboardRepository";
import ChartRepository from "@/src/api/repositories/chartRepository";
import type { AppDatas } from "@/src/shared/types";
import logger from "@/src/shared/utils/logger";

/**
 * Use case: Récupérer les données de l'application
 */
export const getAppDatasUseCase = {
  execute: async (): Promise<AppDatas> => {
    try {
      const connectionRepository = new ConnectionRepository();
      const dashboardRepository = new DashboardRepository();
      const chartRepository = new ChartRepository();

      const connections = await connectionRepository.getAll();
      const dashboards = await dashboardRepository.getAll();
      const charts = await chartRepository.getAll();

      return {
        connections,
        dashboards,
        charts,
      };
    } catch (error: unknown) {
      logger.error("getAppDatasUseCase", error);
      return {
        connections: [],
        dashboards: [],
        charts: [],
      };
    }
  },
};
