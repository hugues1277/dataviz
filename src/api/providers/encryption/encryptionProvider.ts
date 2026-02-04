import { isTauri } from '../../../shared/utils/platform';

async function getEncryptionProvider(): Promise<any> {
    if (isTauri) {
        return (await import('./encryptionMockProvider')).encryptionMockProvider;
    }
    return (await import('./encryptionMockProvider')).encryptionMockProvider;
    // return (await import('./encryptionCryptoProvider')).encryptionCryptoProvider;
}

export const encryptionProvider = await getEncryptionProvider();