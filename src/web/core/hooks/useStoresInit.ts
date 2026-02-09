"use client";
import { useCallback, useEffect } from 'react';
// import { useSession } from '../../providers/betterAuthWebClient';
import { useDashboardsStore } from '../stores/dashboardsStore';
import { storageProvider } from '../../providers/apiProvider';
import { initDashboardsUseCase } from '../useCases/dashboards/initDashboardsUseCase';
import { initConnectionsUseCase } from '../useCases/connections/initConnectionsUseCase';

/**
 * Hook pour initialiser les stores au démarrage de l'application
 * Charge les données uniquement si une session utilisateur existe
 */
export const useStoresInit = () => {
  //const { data: session, isPending } = useSession();

  const { dashboards } = useDashboardsStore();


  const initAppDatas = useCallback(async () => {
    const { connections, dashboards, charts } = await storageProvider.getAppDatas();
    initDashboardsUseCase.execute(dashboards, charts);
    initConnectionsUseCase.execute(connections);
  }, []);

  useEffect(() => {
    // Attendre que la vérification de session soit terminée
    // if (isPending) {
    //   return;
    // }

    // Charger les données dans les stores uniquement si l'utilisateur est connecté
    // if (session?.user && !dashboards.length) {
    initAppDatas();
    //}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initAppDatas, dashboards.length]);
};

