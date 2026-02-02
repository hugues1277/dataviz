import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/storage/storageProvider';
import { Dashboard } from '@/src/shared/types/types';

export async function deleteDashboard(dashboardId: string): Promise<Dashboard[]> {
    const store = useDashboardsStore.getState();

    // delete the dashboard from the API
    await storageProvider.deleteDashboard(dashboardId);
    await storageProvider.deleteChartsByDashboard(dashboardId);

    // delete the dashboard from the store
    const dashboards = store.dashboards.filter(d => d.id !== dashboardId);
    const allCharts = store.allCharts.filter(c => c.dashboardId !== dashboardId);

    // update the dashboards and charts in the store
    store.setDashboards(dashboards);
    store.setAllCharts(allCharts);

    return dashboards;
}