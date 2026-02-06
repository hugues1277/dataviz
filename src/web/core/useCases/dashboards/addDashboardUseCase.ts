import { useDashboardsStore } from '../../stores/dashboardsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { DEFAULT_DASHBOARD } from '../../../../shared/constants';

export async function addDashboardUseCase(): Promise<string> {
    const store = useDashboardsStore.getState();

    const id = crypto.randomUUID();
    const newDash = {
        ...DEFAULT_DASHBOARD,
        id,
        order: store.dashboards.length,
    };

    await storageProvider.putDashboard(newDash);

    store.setDashboards([...store.dashboards, newDash]);

    return id;
}