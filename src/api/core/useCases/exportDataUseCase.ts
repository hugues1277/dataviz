import { chartRepository } from "../../repositories/chartRepository";
import { connectionRepository } from "../../repositories/connectionRepository";
import { dashboardRepository } from "../../repositories/dashboardRepository";

const exportDataUseCase = {
    execute: async () => {
        const dashboards = await dashboardRepository.getAllDashboards();
        const charts = await chartRepository.getAllCharts();
        const connections = await connectionRepository.getAllConnections({ fullConfig: true });

        return {
            dashboards,
            charts,
            connections,
        };
    },
};

export default exportDataUseCase;