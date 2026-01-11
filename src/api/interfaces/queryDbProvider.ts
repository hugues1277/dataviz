import { DBConnection, QueryResult } from '../../shared/types/types';

export interface QueryDbProvider {
    execute: (connection: DBConnection, query: string) => Promise<QueryResult>;
}