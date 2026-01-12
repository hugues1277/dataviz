import { DBConnection, QueryResult } from '../../shared/types/types';

export interface DbQueryProviderInterface {
    execute: (connection: DBConnection, query: string) => Promise<QueryResult>;
}