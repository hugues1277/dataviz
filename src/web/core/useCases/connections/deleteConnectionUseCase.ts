import { useConnectionsStore } from '../../stores/connectionsStore';
import { storageProvider } from '../../../providers/apiProvider';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../i18n/i18n';

export const deleteConnectionUseCase = {
  execute: async (id: string): Promise<void> => {
    const store = useConnectionsStore.getState();

    try {
      await storageProvider.deleteConnection(id);

      const connections = store.connections?.filter(c => c.id !== id) || [];
      store.setConnections(connections);
    } catch (error: unknown) {
      logger.error('deleteConnection', error);
      toast.error(i18n.t('common.errorOccurred'));
    }
  }
};
