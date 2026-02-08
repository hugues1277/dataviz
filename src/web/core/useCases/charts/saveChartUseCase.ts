import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { upsertChartInList } from '../../utils/storeUtils';
import { ChartConfig } from '../../../../shared/types/types';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../../i18n';

export const saveChartUseCase = {
  execute: async (chart: ChartConfig | ChartConfig[]): Promise<void> => {
    const store = useDashboardsStore.getState();

    try {
        const charts = Array.isArray(chart) ? chart : [chart];
        let updatedCharts = [...store.allCharts];

        for (const chart of charts) {
            await storageProvider.putChart(chart);
            updatedCharts = upsertChartInList(updatedCharts, chart);
        }

        store.setAllCharts(updatedCharts);
    } catch (error: unknown) {
        logger.error('saveChart', error);
        toast.error(i18n.t('common.errorOccurred'));
    }
  }
};
