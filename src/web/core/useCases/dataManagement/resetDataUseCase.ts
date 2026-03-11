import { storageProvider } from '../../../providers/apiProvider';
import { DEFAULT_DASHBOARD } from '../../../../shared/constants';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import { t } from '../../../../i18n/i18n';
import { useDashboardsStore } from '../../stores/dashboardsStore';
import { initConnectionsUseCase } from '../connections/initConnectionsUseCase';
import { initDashboardsUseCase } from '../dashboards/initDashboardsUseCase';

/**
 * Réinitialise l'application à un état propre avec un dashboard par défaut.
 */
export const resetDataUseCase = {
  execute: async (): Promise<boolean> => {
    try {
      await storageProvider.clearAll();
      await storageProvider.putDashboard(DEFAULT_DASHBOARD);

      // Mise à jour des stores avec l'état initial
      await Promise.all([
        initDashboardsUseCase.execute([DEFAULT_DASHBOARD], []),
        initConnectionsUseCase.execute([]),
      ]);

      // Définir le dashboard par défaut comme actif
      const store = useDashboardsStore.getState();
      await store.setActiveDashboard(DEFAULT_DASHBOARD.id);

      toast.success(t('settings.resetSuccess'));
      return true;
    } catch (error: unknown) {
      logger.error('resetData', error);
      toast.error(t('settings.resetError'));
    }

    return false;
  }
};
