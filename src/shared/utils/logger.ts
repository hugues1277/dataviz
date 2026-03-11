/**
 * Logger partagé pour le backend (API, services, use cases).
 * Utilise console pour l'instant ; peut être remplacé par un logger structuré.
 */
const logger = {
  info(message: string): void {
    console.log(`[INFO] ${message}`);
  },

  error(context: string, error: unknown): void {
    if (error instanceof Error) {
      console.error(`[ERROR] ${context} ${error.message}`, error.stack);
    } else {
      console.error(`[ERROR] ${context}`, error);
    }
  },

  getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    if (error && typeof error === "object" && "message" in error) {
      return String((error as { message: unknown }).message);
    }
    return "Erreur inconnue";
  },
};

export default logger;