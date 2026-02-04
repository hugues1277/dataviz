import { isTauri } from '@/src/shared/utils/platform';

async function getProvider(): Promise<any> {
    if (isTauri) {
        return (await import('./tauriStorageProvider')).tauriStorageProvider;
    }
    return (await import('./apiStorageProvider')).apiStorageProvider;
}

export const storageProvider = await getProvider();