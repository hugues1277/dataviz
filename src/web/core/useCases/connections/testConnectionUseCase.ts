import { toast } from 'react-toastify';
import { DBConnection, isApiType, isDatabaseType } from '../../../../shared/types/types';
import { queryRequestProvider } from '../../../providers/queryRequestProvider';
import { t } from '../../../../i18n/i18n';

export const testConnectionUseCase = {
  execute: async (connection: DBConnection): Promise<void> => {
    if (isDatabaseType(connection.type) && !connection.host) return;
    if (isApiType(connection.type) && !connection.apiUrl) return;

    try {
      const result = await queryRequestProvider.testConnection(connection);
      if (!result) {
        toast.error(t('connections.connectionTestFailed'));
      } else {
        toast.success(t('connections.connectionTestSuccess'));
      }
    } catch (error) {
      toast.error(t('connections.connectionTestError'));
    }
  }
};
