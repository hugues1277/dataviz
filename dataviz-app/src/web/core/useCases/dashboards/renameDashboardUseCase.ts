import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../i18n/i18n';

export const renameDashboardUseCase = {
  execute: async (id: string, name: string): Promise<void> => {
    const store = useDashboardsStore.getState();
    const dashboard = store.activeDashboard;

    if (!dashboard) return;

    try {
      // update the dashboard in the store
      const updatedDashboard = { ...dashboard, name };
      await storageProvider.putDashboard(updatedDashboard);

      // update the dashboard in the list
      const updatedDashboards = store.dashboards.map(d => d.id === dashboard.id ? updatedDashboard : d)
      store.setDashboards(updatedDashboards);
    } catch (error: unknown) {
      logger.error('renameDashboard', error);
      toast.error(i18n.t('common.errorOccurred'));
    }
  }
};
