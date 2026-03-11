import type { DBConnection, QueryResult } from "@/src/shared/types";

export interface DbQueryProviderInterface {
  execute(connection: DBConnection, query: string): Promise<QueryResult>;
}