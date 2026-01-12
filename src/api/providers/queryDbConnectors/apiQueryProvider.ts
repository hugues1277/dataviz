import { DBConnection, QueryResult } from '../../../shared/types/types';
import { DbQueryProviderInterface } from '../../interfaces/dbQueryProviderInterface';

export const apiQueryProvider: DbQueryProviderInterface = {
    execute: async (connection: DBConnection, query: string): Promise<QueryResult> => {
        if (!connection.apiUrl) {
            throw new Error('API URL non définie');
        }

        const response = await fetch(connection.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(connection.apiToken ? { 'Authorization': `Bearer ${connection.apiToken}` } : {})
            },
            body: JSON.stringify({ query: query })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Erreur API ${response.status}`);
        }

        // Si l'API retourne un tableau direct, on formate comme QueryResult
        if (Array.isArray(result)) {
            return {
                columns: result.length > 0 ? Object.keys(result[0]) : [],
                rows: result
            };
        }

        return result;
    }
}