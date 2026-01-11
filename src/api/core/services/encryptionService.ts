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

  decrypt(payload: string): string {
    const buf = Buffer.from(payload, 'base64');

    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);

    const decipher = createDecipheriv('aes-256-gcm', this.KEY, iv);
    decipher.setAuthTag(tag);

    return decipher.update(data, undefined, 'utf8') + decipher.final('utf8');
  }
};
