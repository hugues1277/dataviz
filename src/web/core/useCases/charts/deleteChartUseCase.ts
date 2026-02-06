import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';

export async function deleteChartUseCase(id: string): Promise<void> {
    const store = useDashboardsStore.getState();

    await storageProvider.deleteChart(id);

    const allCharts = store.allCharts.filter(c => c.id !== id);
    store.setAllCharts(allCharts);
}
