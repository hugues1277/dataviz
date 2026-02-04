import { isTauri } from '../../../shared/utils/platform';

async function getProvider() {
    if (isTauri) {
        return (await import('./pgLiteDatabaseProvider')).pgLiteDatabaseProvider;
    }
    return (await import('./pgDatabaseProvider')).databaseProvider;
}

export const databaseProvider = await getProvider();