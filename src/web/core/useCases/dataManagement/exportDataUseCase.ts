import { storageProvider } from '../../../providers/apiProvider';
import { format } from 'date-fns';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../i18n/i18n';

/**
 * Exporte toutes les données de l'application (dashboards, charts, connections) dans un fichier JSON.
 */
export const exportDataUseCase = {
  execute: async (): Promise<void> => {
    try {
      const { dashboards, charts, connections } = await storageProvider.exportAppDatas();

      const backupData = {
        dashboards,
        charts,
        connections,
        version: '1.1',
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dataviz-${format(new Date(), 'yyMMdd-HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(i18n.t('settings.exportSuccess'));
    } catch (error: unknown) {
      logger.error('exportData', error);
      toast.error(i18n.t('settings.exportFailed'));
    }
  }
};
