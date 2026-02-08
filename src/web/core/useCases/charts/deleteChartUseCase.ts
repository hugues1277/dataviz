import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../../i18n';

export const deleteChartUseCase = {
  execute: async (id: string): Promise<void> => {
    const store = useDashboardsStore.getState();

    try {
        await storageProvider.deleteChart(id);

        const allCharts = store.allCharts.filter(c => c.id !== id);
        store.setAllCharts(allCharts);
    } catch (error: unknown) {
        logger.error('deleteChart', error);
        toast.error(i18n.t('common.errorOccurred'));
    }
  }
};
