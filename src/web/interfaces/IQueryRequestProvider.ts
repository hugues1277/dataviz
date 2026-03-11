import type { DBConnection, QueryResult } from "../../shared/types";

export interface IQueryRequestProvider {
  getQueryKey: (chartId: string, query: string, variables: Record<string, string>) => string[];
  executeQuery: (
    connection: DBConnection,
    sql: string,
    variables?: Record<string, string>
  ) => Promise<QueryResult>;
}
