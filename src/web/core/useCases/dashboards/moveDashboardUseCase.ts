import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../i18n/i18n';

export const moveDashboardUseCase = {
  execute: async (id: string, direction: 'up' | 'down'): Promise<void> => {
    const store = useDashboardsStore.getState();

    try {
      const dashboards = [...store.dashboards];

      const currentIndex = dashboards.findIndex(d => d.id === id);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= dashboards.length) return;

      const temp = dashboards[currentIndex];
      dashboards[currentIndex] = dashboards[targetIndex];
      dashboards[targetIndex] = temp;

      const updatedWithOrder = dashboards.map((dash, index) => ({
        ...dash,
        order: index
      }));

      await Promise.all(updatedWithOrder.map(d => storageProvider.putDashboard(d)));

      store.setDashboards(updatedWithOrder);
    } catch (error: unknown) {
      logger.error('moveDashboard', error);
      toast.error(i18n.t('common.errorOccurred'));
    }
  }
};
