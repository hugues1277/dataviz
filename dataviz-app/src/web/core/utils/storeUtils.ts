import { ChartConfig, DBConnection } from '../../../shared/types/types';

/**
 * Ajoute ou met à jour un chart dans une liste
 */
export function upsertChartInList(
  charts: ChartConfig[],
  chart: ChartConfig
): ChartConfig[] {
  const exists = charts.find(c => c.id === chart.id);
  return exists
    ? charts.map(c => c.id === chart.id ? chart : c)
    : [...charts, chart];
}

/**
 * Crée une map d'ID vers connexion depuis une liste de connexions
 */
export function createConnectionsMap(
  connections: DBConnection[]
): Record<string, DBConnection> {
  return connections.reduce((acc, conn) => {
    acc[conn.id] = conn;
    return acc;
  }, {} as Record<string, DBConnection>);
}
