import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { DashboardVariable } from '../../../../shared/types/types';

export async function saveDashboardVariablesUseCase(variables: DashboardVariable[]): Promise<void> {
    const store = useDashboardsStore.getState();
    const dashboard = store.activeDashboard;

    if (!dashboard) return;

    // update the dashboard in the store
    const updatedDashboard = { ...dashboard, variables };
    await storageProvider.putDashboard(updatedDashboard);

    // update the dashboard in the list
    const updatedDashboards = store.dashboards.map(d => d.id === dashboard.id ? updatedDashboard : d)
    store.setDashboards(updatedDashboards);
}
