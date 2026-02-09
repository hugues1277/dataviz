"use client";
import { useCallback, useEffect } from 'react';
import { useDashboardsStore } from '../stores/dashboardsStore';
import { storageProvider } from '../../providers/apiProvider';
import { initDashboardsUseCase } from '../useCases/dashboards/initDashboardsUseCase';
import { initConnectionsUseCase } from '../useCases/connections/initConnectionsUseCase';

/**
 * Hook pour initialiser les stores au démarrage de l'application
 * Charge les données uniquement si une session utilisateur existe
 */
export const useStoresInit = () => {
  const { dashboards } = useDashboardsStore();

  const initAppDatas = useCallback(async () => {
    const { connections, dashboards, charts } = await storageProvider.getAppDatas();
    initDashboardsUseCase.execute(dashboards, charts);
    initConnectionsUseCase.execute(connections);
  }, []);

  useEffect(() => {
    if (dashboards.length == 0) {
      initAppDatas();
    }
  }, [dashboards.length, initAppDatas]);
};

