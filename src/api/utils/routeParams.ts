/**
 * Types partagés pour les paramètres de route Next.js App Router (v15+).
 * Les params sont asynchrones depuis Next.js 15.
 */

/** Paramètres pour une route avec un segment dynamique [id] */
export type RouteParamsWithId = { params: Promise<{ id: string }> };
