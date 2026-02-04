import logger from '../../../shared/utils/logger';
import { isTauri } from '../../../shared/utils/platform';
import { DbQueryProviderInterface } from '../../interfaces/dbQueryProviderInterface';

async function getPostgresQueryProvider(): Promise<DbQueryProviderInterface> {
    if (isTauri) {
        return (await import('./postgresQueryProviderTauri')).postgresQueryProviderTauri;
    }
    return (await import('./postgresQueryProviderNode')).postgresQueryProvider;
}

export const postgresQueryProvider = await getPostgresQueryProvider();