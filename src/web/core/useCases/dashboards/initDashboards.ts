import { storageProvider } from '../../../providers/apiProvider';
import logger from '../../../../shared/utils/logger';
import { Dashboard, ChartConfig } from '../../../../shared/types/types';
import { useDashboardsStore } from '../../stores/dashboardsStore';

export async function initDashboards(
    dashboardsData?: Dashboard[],
    chartsData?: ChartConfig[]
): Promise<void> {
    const store = useDashboardsStore.getState();

    if (store.isLoading) return;

    try {
        const dashData = dashboardsData || await storageProvider.getAllDashboards();
        const chartData = chartsData || await storageProvider.getAllCharts();
        const sortedDashboards = dashData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        store.setDashboards(sortedDashboards);
        store.setAllCharts(chartData);

        logger.info('initDashboards ended');
    } catch (error: unknown) {
        logger.error('initDashboards', error);
        store.setIsLoading(false);
    }
}