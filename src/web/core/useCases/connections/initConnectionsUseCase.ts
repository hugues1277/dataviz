import logger from '../../../../shared/utils/logger';
import { DBConnection } from '../../../../shared/types/types';
import { useConnectionsStore } from '../../stores/connectionsStore';
import { storageProvider } from '@/src/web/providers/apiProvider';

export async function initConnectionsUseCase(connections: DBConnection[]): Promise<void> {
    const store = useConnectionsStore.getState();

    try {
        const connectionsData = connections || await storageProvider.getAllConnections();

        store.setConnections(connectionsData);
    } catch (error: unknown) {
        logger.error('initConnections', error);
    }
}
