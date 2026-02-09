import { toast } from 'react-toastify';
import { DBConnection } from '../../../../shared/types/types';
import { queryRequestProvider } from '../../../providers/queryRequestProvider';
import i18n from '../../../../i18n/i18n';

export const testConnectionUseCase = {
  execute: async (connection: DBConnection): Promise<void> => {
    if ((connection.type === "postgres" && !connection.host) || (connection.type === "api" && !connection.apiUrl)) return;

    try {
      const result = await queryRequestProvider.testConnection(connection);
      if (!result) {
        toast.error(i18n.t('connections.connectionTestFailed'));
      } else {
        toast.success(i18n.t('connections.connectionTestSuccess'));
      }
    } catch (error) {
      toast.error(i18n.t('connections.connectionTestError'));
    }
  }
};
