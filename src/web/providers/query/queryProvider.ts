import { isTauri } from '@/src/shared/utils/platform';
import { IQueryProvider } from './IQueryProvider';

async function getQueryProvider(): Promise<IQueryProvider> {
    if (isTauri) {
        return (await import('./tauriQueryProvider')).tauriQueryProvider;
    }
    return (await import('./apiQueryProvider')).apiQueryProvider;
}

export const queryProvider = await getQueryProvider();