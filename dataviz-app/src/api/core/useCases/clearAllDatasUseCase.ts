import ChartRepository from "../../repositories/chartRepository";
import ConnectionRepository from "../../repositories/connectionRepository";
import DashboardRepository from "../../repositories/dashboardRepository";

const clearAllDatasUseCase = {
    execute: async () => {
        const connectionRepository = new ConnectionRepository();
        const dashboardRepository = new DashboardRepository();
        const chartRepository = new ChartRepository();

        await connectionRepository.clear();
        await dashboardRepository.clear();
        await chartRepository.clear();
    },
};

export default clearAllDatasUseCase;