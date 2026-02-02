import { useCallback, useEffect } from 'react';
import { useSession } from '../../providers/auth/authProvider';
import { useConnectionsStore } from '../stores/connectionsStore';
import { useDashboardsStore } from '../stores/dashboardsStore';
import { storageProvider } from '../../providers/storage/storageProvider';
import { initDashboards } from '../useCases/dashboards/initDashboards';

/**
 * Hook pour initialiser les stores au démarrage de l'application
 * Charge les données uniquement si une session utilisateur existe
 */
export const useStoresInit = () => {
  const { data: session, isPending } = useSession();

  const { initConnections } = useConnectionsStore();
  const { dashboards } = useDashboardsStore();


  const initAppDatas = useCallback(async () => {
    const { connections, dashboards, charts } = await storageProvider.getAppDatas();
    initConnections(connections);
    initDashboards(dashboards, charts);
  }, [initConnections, initDashboards]);

  useEffect(() => {
    // Attendre que la vérification de session soit terminée
    if (isPending) {
      return;
    }

    // Charger les données dans les stores uniquement si l'utilisateur est connecté
    if (session?.user && !dashboards.length) {
      initAppDatas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending, initAppDatas, dashboards.length]);
};

