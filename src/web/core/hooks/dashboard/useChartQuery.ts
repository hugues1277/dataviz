import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryResult, DateRange } from '../../../../shared/types/types';
import { queryRequestProvider } from '../../../providers/queryRequestProvider';
import { useConnectionsStore } from '../../stores/connectionsStore';
import { getQueryVariablesValues } from '../../utils/variableUtils';
import { useMemo, useCallback } from 'react';
import { QUERY_CACHE_TTL } from '../../../../shared/constants';

export const useChartQuery = (
  chartConnectionId: string,
  chartId: string,
  query: string,
  dateRange?: DateRange,
  variableValues?: Record<string, string>,
) => {
  const { connections } = useConnectionsStore();
  const connection = connections.find((c) => c.id === chartConnectionId);

  const queryVariablesValues = useMemo(() => {
    return getQueryVariablesValues(variableValues || {}, query, dateRange);
  }, [variableValues, query, dateRange]);

  const key = useMemo(() => queryRequestProvider.getQueryKey(chartId, query, queryVariablesValues), [chartId, query, queryVariablesValues]);

  return useQuery<QueryResult>({
    queryKey: key,
    queryFn: async () => {
      if (!connection) {
        return { columns: [], rows: [], error: 'Aucune connexion' };
      }
      return await queryRequestProvider.executeQuery(connection, query, queryVariablesValues);
    },
    staleTime: QUERY_CACHE_TTL * 1000, // Convertir secondes en millisecondes
    gcTime: QUERY_CACHE_TTL * 1000,
  });
};

/**
 * Hook pour refetch tous les charts d'un dashboard
 * Invalide toutes les queries qui commencent par 'query' avec refetchType: 'active'
 * Cela force le refetch même si staleTime est élevé
 */
export const useRefetchDashboardCharts = () => {
  const queryClient = useQueryClient();
  const refetchDashboardCharts = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['query'],
      refetchType: 'active'
    });
  }, [queryClient]);

  return refetchDashboardCharts;
};
