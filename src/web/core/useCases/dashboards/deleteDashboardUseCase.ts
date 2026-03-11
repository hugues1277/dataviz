import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { Dashboard } from '@/src/shared/types/types';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import { t } from '../../../../i18n/i18n';

export const deleteDashboardUseCase = {
  execute: async (dashboardId: string): Promise<Dashboard[]> => {
    const store = useDashboardsStore.getState();

    try {
      // delete charts first, then the dashboard (to respect FK constraints)
      await storageProvider.deleteChartsByDashboard(dashboardId);
      await storageProvider.deleteDashboard(dashboardId);

      // delete the dashboard from the store
      const dashboards = store.dashboards.filter(d => d.id !== dashboardId);
      const allCharts = store.allCharts.filter(c => c.dashboardId !== dashboardId);

      // update the dashboards and charts in the store
      store.setDashboards(dashboards);
      store.setAllCharts(allCharts);

      return dashboards;
    } catch (error: unknown) {
      logger.error('deleteDashboard', error);
      toast.error(t('common.errorOccurred'));
    }
    return [];
  }
};
