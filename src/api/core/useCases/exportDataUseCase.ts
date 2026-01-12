import ChartRepository from "../../repositories/chartRepository";
import ConnectionRepository from "../../repositories/connectionRepository";
import DashboardRepository from "../../repositories/dashboardRepository";

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