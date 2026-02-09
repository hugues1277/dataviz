import { AppDatas } from "../../../shared/types/types";
import ChartRepository from "../../repositories/chartRepository";
import ConnectionRepository from "../../repositories/connectionRepository";
import DashboardRepository from "../../repositories/dashboardRepository";

export const importAppDatasUseCase = {
    execute: async (appDatas: AppDatas) => {
        const connectionRepository = new ConnectionRepository();
        const dashboardRepository = new DashboardRepository();
        const chartRepository = new ChartRepository();

        await connectionRepository.createMany(appDatas.connections);
        await dashboardRepository.createMany(appDatas.dashboards);
        await chartRepository.createMany(appDatas.charts);
    },
};