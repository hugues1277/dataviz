import "dotenv/config";
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

const ENCRYPT_KEY = process.env.ENCRYPT_KEY;

/**
 * Service gérant le chiffrement/déchiffrement des données sensibles via Web Crypto API (AES-GCM).
 */
export const encryptionService = {

  KEY: createHash('sha256')
    .update(ENCRYPT_KEY!)
    .digest(),

  encrypt(text: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.KEY, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  },

  /**
   * Vérifie si une chaîne est chiffrée (format base64 avec IV + tag + données)
   */
  isEncrypted(payload: string): boolean {
    try {
      const buf = Buffer.from(payload, 'base64');
      // Format: IV (12 bytes) + tag (16 bytes) + données (au moins 1 byte) = minimum 29 bytes
      return buf.length >= 29;
    } catch {
      return false;
    }
  },

  decrypt(payload: string): string {
    const buf = Buffer.from(payload, 'base64');

    // Vérifier que le buffer a la taille minimale requise
    if (buf.length < 29) {
      throw new Error('Charge utile chiffrée invalide : charge utile trop courte');
    }

    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);

    // Vérifier que le tag n'est pas vide
    if (tag.length === 0) {
      throw new Error('Charge utile chiffrée invalide : tag d\'authentification vide');
    }

    const decipher = createDecipheriv('aes-256-gcm', this.KEY, iv);
    decipher.setAuthTag(tag);

    return decipher.update(data, undefined, 'utf8') + decipher.final('utf8');
  }
};
