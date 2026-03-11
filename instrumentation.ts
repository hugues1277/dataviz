/**
 * Hook d'instrumentation Next.js - exécuté au démarrage du serveur.
 * Lance les migrations DB automatiquement.
 */
export async function register() {
  const { runDbMigration } = await import("@/src/api/providers/dbMigration");
  await runDbMigration();
}
