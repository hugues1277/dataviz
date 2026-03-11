import { useConnectionsStore } from '../../stores/connectionsStore';
import { storageProvider } from '../../../providers/apiProvider';
import { DBConnection } from '../../../../shared/types/types';
import { t } from '../../../../i18n/i18n';
import { toast } from 'react-toastify';
import logger from '@/src/shared/utils/logger';

export const updateConnectionUseCase = {
  execute: async (connection: DBConnection): Promise<void> => {
    const store = useConnectionsStore.getState();

    try {
      await storageProvider.updateConnection(connection);

      const connections = (store.connections || []).map(c => c.id === connection.id ? connection : c);
      store.setConnections(connections);
    } catch (error: unknown) {
      logger.error('updateConnection', error);
      toast.error(t('common.errorOccurred'));
    }
  }
};
