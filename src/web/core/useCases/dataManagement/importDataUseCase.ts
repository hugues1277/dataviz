import { AppDatas } from '../../../../shared/types/types';
import { storageProvider } from '../../../providers/apiProvider';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../../i18n';
import { initConnectionsUseCase } from '../connections/initConnectionsUseCase';
import { initDashboardsUseCase } from '../dashboards/initDashboardsUseCase';

/**
 * Importe des données dans l'application et met à jour les stores.
 * @returns Les données importées pour permettre la navigation dans le composant appelant
 */
export async function importDataUseCase(data: AppDatas): Promise<AppDatas | null> {
  try {
    await storageProvider.importAppDatas(data);

    const appDatas = await storageProvider.getAppDatas();

    // Mise à jour des stores avec les nouvelles données
    await Promise.all([
      initDashboardsUseCase(appDatas.dashboards, appDatas.charts),
      initConnectionsUseCase(appDatas.connections),
    ]);

    toast.success(i18n.t('settings.importSuccess'));

    return appDatas;
  } catch (error: unknown) {
    logger.error('importData', error);
    toast.error(i18n.t('settings.importError'));
  }

  return null;
}
