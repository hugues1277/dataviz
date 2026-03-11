import ChartRepository from "@/src/api/repositories/chartRepository";
import ConnectionRepository from "@/src/api/repositories/connectionRepository";
import DashboardRepository from "@/src/api/repositories/dashboardRepository";

/**
 * Use case: Exporter toutes les données de l'application
 */
const exportDataUseCase = {
  execute: async () => {
    const dashboardRepository = new DashboardRepository();
    const chartRepository = new ChartRepository();
    const connectionRepository = new ConnectionRepository();

    const dashboards = await dashboardRepository.getAll();
    const charts = await chartRepository.getAll();
    const connections = await connectionRepository.getAll({ fullConfig: true });

    return {
      dashboards,
      charts,
      connections,
    };
  },
};

export default exportDataUseCase;