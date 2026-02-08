import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { DashboardVariable } from '../../../../shared/types/types';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../../i18n';

export const saveDashboardVariablesUseCase = {
  execute: async (variables: DashboardVariable[]): Promise<void> => {
    const store = useDashboardsStore.getState();
    const dashboard = store.activeDashboard;

    if (!dashboard) return;

    try {
        // update the dashboard in the store
        const updatedDashboard = { ...dashboard, variables };
        await storageProvider.putDashboard(updatedDashboard);

        // update the dashboard in the list
        const updatedDashboards = store.dashboards.map(d => d.id === dashboard.id ? updatedDashboard : d)
        store.setDashboards(updatedDashboards);
    } catch (error: unknown) {
        logger.error('saveDashboardVariables', error);
        toast.error(i18n.t('common.errorOccurred'));
    }
  }
};
