/**
 * Mock provider pour le chiffrement/déchiffrement utilisé en environnement web (non-Tauri).
 * Simule le comportement sans vraie sécurité cryptographique - uniquement pour le développement.
 * 
 * ATTENTION: Ce mock n'offre AUCUNE sécurité réelle. Ne pas utiliser en production.
 */
export const encryptionMockProvider = {
  KEY: new Uint8Array(32).fill(0), // Clé factice pour compatibilité d'interface

  /**
   * Simule le chiffrement en encodant simplement le texte en base64 avec un préfixe.
   * Le format simule celui du vrai provider (iv + tag + data).
   */
  encrypt(text: string): string {
    // Simule un IV de 12 bytes et un tag de 16 bytes (comme AES-GCM)
    const mockIv = new Uint8Array(12).fill(0);
    const mockTag = new Uint8Array(16).fill(0);

    // Encode le texte en base64
    const encodedText = btoa(unescape(encodeURIComponent(text)));

    // Combine iv (12) + tag (16) + données encodées
    // On crée un buffer avec iv + tag + le texte encodé en bytes
    const textBytes = Uint8Array.from(encodedText, c => c.charCodeAt(0));
    const combined = new Uint8Array(mockIv.length + mockTag.length + textBytes.length);
    combined.set(mockIv, 0);
    combined.set(mockTag, mockIv.length);
    combined.set(textBytes, mockIv.length + mockTag.length);

    // Convertit en base64
    const base64 = btoa(String.fromCharCode(...combined));
    return base64;
  },

  /**
   * Simule le déchiffrement en décodant le base64 et extrayant les données.
   */
  decrypt(payload: string): string {
    try {
      // Décode le base64
      const decoded = atob(payload);
      const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));

      // Extrait les données (après iv: 12 bytes + tag: 16 bytes = 28 bytes)
      const dataStart = 28;
      const dataBytes = bytes.slice(dataStart);

      // Convertit les bytes en string base64 et décode
      const encodedText = String.fromCharCode(...dataBytes);
      const decodedText = decodeURIComponent(escape(atob(encodedText)));

      return decodedText;
    } catch (error) {
      throw new Error(`Erreur lors du déchiffrement mock: ${error}`);
    }
  }
};
