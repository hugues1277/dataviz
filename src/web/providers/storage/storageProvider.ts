import { apiStorageProvider } from './apiStorageProvider';
import { tauriStorageProvider } from './tauriStorageProvider';

const isTauri = true;

export const storageProvider = isTauri ? tauriStorageProvider : apiStorageProvider;