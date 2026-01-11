import { AppDatas } from "../../../shared/types/types";
import { chartRepository } from "../../repositories/chartRepository";
import { connectionRepository } from "../../repositories/connectionRepository";
import { dashboardRepository } from "../../repositories/dashboardRepository";

export const importAppDatasUseCase = {
    execute: async (appDatas: AppDatas) => {
        await connectionRepository.putConnections(appDatas.connections, { encrypt: false });
        await dashboardRepository.putDashboards(appDatas.dashboards);
        await chartRepository.putCharts(appDatas.charts);
    },
};