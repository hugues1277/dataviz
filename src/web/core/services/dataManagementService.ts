import { AppDatas } from '../../../shared/types/types';
import { storageProvider } from '../../providers/apiProvider';
import { format } from 'date-fns';
import { DEFAULT_DASHBOARD } from '../../../shared/constants';
import logger from '../../../shared/utils/logger';

export const dataManagementService = {
  /**
   * Generates a backup JSON file containing all dashboards, their charts, and connections.
   */
  async exportData(): Promise<void> {
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
    } catch (error: unknown) {
      logger.error('exportData', error);
      throw error;
    }
  },

  /**
   * Imports new data by merging with existing data.
   */
  async importData(data: AppDatas): Promise<AppDatas> {

    try {
      await storageProvider.importAppDatas(data);

      return await storageProvider.getAppDatas();
    } catch (error: unknown) {
      logger.error('importData', error);
      throw error;
    }
  },

  /**
   * Resets the application to a clean state.
   */
  async resetData(): Promise<void> {
    try {
      await storageProvider.clearAll();
      await storageProvider.putDashboard(DEFAULT_DASHBOARD);
    } catch (error: unknown) {
      logger.error('resetData', error);
      throw error;
    }
  }
};
