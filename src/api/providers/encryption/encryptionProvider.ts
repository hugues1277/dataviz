// import { encryptionCryptoProvider } from "./encryptionCryptoProvider";
import { encryptionMockProvider } from "./encryptionMockProvider";

const isTauri = false;// import.meta.env.VITE_IS_TAURI_APP === 'true';

export const encryptionProvider = isTauri ? encryptionMockProvider : encryptionMockProvider;