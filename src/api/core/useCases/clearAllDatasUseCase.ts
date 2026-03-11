import ChartRepository from "@/src/api/repositories/chartRepository";
import ConnectionRepository from "@/src/api/repositories/connectionRepository";
import DashboardRepository from "@/src/api/repositories/dashboardRepository";

/**
 * Use case: Supprimer toutes les données de l'application
 */
const clearAllDatasUseCase = {
  execute: async (): Promise<void> => {
    const connectionRepository = new ConnectionRepository();
    const dashboardRepository = new DashboardRepository();
    const chartRepository = new ChartRepository();

    await connectionRepository.clear();
    await dashboardRepository.clear();
    await chartRepository.clear();
  },
};

export default clearAllDatasUseCase;