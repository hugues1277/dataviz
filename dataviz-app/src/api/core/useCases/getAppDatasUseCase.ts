import ConnectionRepository from '../../repositories/connectionRepository';
import { AppDatas } from '../../../shared/types/types';
import DashboardRepository from '../../repositories/dashboardRepository';
import ChartRepository from '../../repositories/chartRepository';
import logger from '../../../shared/utils/logger';

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
      logger.error('getAppDatasUseCase', error);

      return {
        connections: [],
        dashboards: [],
        charts: [],
      };
    }

  }
};
