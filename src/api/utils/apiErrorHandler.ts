import { NextResponse } from "next/server";
import logger from "@/src/shared/utils/logger";

/** Indicateurs pour déterminer le code HTTP à retourner selon le type d'erreur */
const AUTH_ERROR_INDICATORS = ["Session", "authentifié"];
const FORBIDDEN_INDICATORS = ["lecture seule", "Droits", "forbidden", "autorisé"];
const CONFLICT_INDICATORS = ["unique", "duplicate"];

/**
 * Extrait le message d'erreur d'une exception inconnue.
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erreur serveur";
}

/**
 * Détermine le code HTTP approprié selon le message d'erreur.
 */
function getStatusCode(message: string, defaultStatus: number): number {
  if (AUTH_ERROR_INDICATORS.some((ind) => message.includes(ind))) {
    return 401;
  }
  if (FORBIDDEN_INDICATORS.some((ind) => message.includes(ind))) {
    return 403;
  }
  if (CONFLICT_INDICATORS.some((ind) => message.includes(ind))) {
    return 409;
  }
  return defaultStatus;
}

export interface HandleApiErrorOptions {
  /** Nom de la route pour le logging (ex: "connections GET") */
  routeName: string;
  /** Code HTTP par défaut si l'erreur n'est pas auth/forbidden/conflict (400, 403 ou 500) */
  defaultStatus?: 400 | 403 | 500;
  /** Message personnalisé pour les erreurs 409 (conflit) */
  conflictMessage?: string;
}

/**
 * Gère les erreurs des routes API de manière centralisée.
 * Log l'erreur, détermine le code HTTP (401/403/409/400/500) et retourne une NextResponse.
 */
export function handleApiError(
  error: unknown,
  options: HandleApiErrorOptions
): NextResponse {
  const { routeName, defaultStatus = 500, conflictMessage } = options;
  logger.error(`${routeName} API route`, error);

  const message = getErrorMessage(error);
  const status = getStatusCode(message, defaultStatus);
  const responseMessage =
    status === 409 && conflictMessage ? conflictMessage : message;

  return NextResponse.json({ error: responseMessage }, { status });
}
