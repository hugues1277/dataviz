import { DBConnection, QueryResult } from '../../../shared/types/types';
import { DbQueryProviderInterface } from '../../interfaces/dbQueryProviderInterface';
import { t } from '../../../i18n/i18n';

export const apiQueryProvider: DbQueryProviderInterface = {
    execute: async (connection: DBConnection, query: string): Promise<QueryResult> => {
        if (!connection.apiUrl) {
            throw new Error(t('exceptions.apiQueryProvider.apiUrlNotDefined'));
        }

        const apiToken = connection.apiToken?.replace(/^Bearer /, '');

        const response = await fetch(connection.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
            },
            body: JSON.stringify({ query: query })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || t('exceptions.apiQueryProvider.apiError', { status: response.status }));
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