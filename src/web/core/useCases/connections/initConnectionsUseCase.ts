import logger from '../../../../shared/utils/logger';
import type { DBConnection } from "../../../../shared/types";
import { useConnectionsStore } from '../../stores/connectionsStore';
import { storageProvider } from '@/src/web/providers/apiProvider';

export const initConnectionsUseCase = {
  execute: async (connections: DBConnection[]): Promise<void> => {
    const store = useConnectionsStore.getState();

    try {
        const connectionsData = connections || await storageProvider.getAllConnections();

        store.setConnections(connectionsData);
    } catch (error: unknown) {
        logger.error('initConnections', error);
    }
  }
};
