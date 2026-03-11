import { useConnectionsStore } from '../../stores/connectionsStore';
import { storageProvider } from '../../../providers/apiProvider';
import type { DBConnection } from "../../../../shared/types";
import { t } from '../../../../i18n/i18n';
import { toast } from 'react-toastify';
import logger from '@/src/shared/utils/logger';

export const setDefaultConnectionUseCase = {
  execute: async (connectionId: string): Promise<void> => {
    const store = useConnectionsStore.getState();
    const connections = store.connections || [];

    try {
      const updatedConnections: DBConnection[] = connections.map((c) => ({
        ...c,
        isDefault: c.id === connectionId,
      }));

      for (const conn of updatedConnections) {
        await storageProvider.updateConnection(conn);
      }

      store.setConnections(updatedConnections);
    } catch (error: unknown) {
      logger.error('setDefaultConnection', error);
      toast.error(t('common.errorOccurred'));
    }
  },
};
