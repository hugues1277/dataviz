import { connectionRepository } from '../../repositories/connectionRepository';
import { AppDatas } from '../../../shared/types/types';
import { dashboardRepository } from '../../repositories/dashboardRepository';
import { chartRepository } from '../../repositories/chartRepository';
import logger from '../../../shared/utils/logger';

/**
 * Use case: Récupérer les données de l'application
 */
export const getAppDatasUseCase = {
  execute: async (): Promise<AppDatas> => {
    try {
      const connections = await connectionRepository.getAllConnections();
      const dashboards = await dashboardRepository.getAllDashboards();
      const charts = await chartRepository.getAllCharts();

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
