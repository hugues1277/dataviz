import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { Dashboard } from '@/src/shared/types/types';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../../i18n';

export async function deleteDashboardUseCase(dashboardId: string): Promise<Dashboard[]> {
    const store = useDashboardsStore.getState();

    try {
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
    } catch (error: unknown) {
        logger.error('deleteDashboard', error);
        toast.error(i18n.t('common.errorOccurred'));
    }
    return [];
}
