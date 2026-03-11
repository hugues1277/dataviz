import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { DEFAULT_DASHBOARD } from '../../../../shared/constants';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import { t } from '../../../../i18n/i18n';

export const addDashboardUseCase = {
  execute: async (): Promise<string> => {
    const store = useDashboardsStore.getState();

    try {
      const id = crypto.randomUUID();
      const newDash = {
        ...DEFAULT_DASHBOARD,
        id,
        order: store.dashboards.length,
      };

      await storageProvider.putDashboard(newDash);

      store.setDashboards([...store.dashboards, newDash]);

      return id;
    } catch (error: unknown) {
      logger.error('addDashboard', error);
      toast.error(t('common.errorOccurred'));
    }

    return "";
  }
};