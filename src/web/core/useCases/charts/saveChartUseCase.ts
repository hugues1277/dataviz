import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { upsertChartInList } from '../../utils/storeUtils';
import { ChartConfig } from '../../../../shared/types/types';

export async function saveChartUseCase(chart: ChartConfig | ChartConfig[]): Promise<void> {
    const store = useDashboardsStore.getState();

    const charts = Array.isArray(chart) ? chart : [chart];
    let updatedCharts = [...store.allCharts];

    for (const chart of charts) {
        await storageProvider.putChart(chart);
        updatedCharts = upsertChartInList(updatedCharts, chart);
    }

    store.setAllCharts(updatedCharts);
}
