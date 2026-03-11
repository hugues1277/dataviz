/**
 * Messages serveur pour les API routes et use cases.
 * Utilisé à la place de i18n (client-only) pour éviter "t() from server" errors.
 * Langue par défaut : fr
 */
const messages: Record<string, string> = {
  "exceptions.auth.invalidSession": "Session invalide ou expirée",
  "exceptions.createFirstUser.emailPasswordRequired": "Email et mot de passe sont requis",
  "exceptions.createFirstUser.usersAlreadyExist":
    "Des utilisateurs existent déjà. Cette fonctionnalité n'est disponible que pour créer le premier utilisateur.",
  "exceptions.createFirstUser.successMessage": "Premier utilisateur admin créé avec succès",
  "exceptions.users.forbidden":
    "Accès refusé. Seul l'administrateur peut gérer les utilisateurs.",
  "exceptions.users.readOnly":
    "Droits insuffisants. Les utilisateurs en lecture seule ne peuvent pas modifier les données.",
  "exceptions.users.lastAdmin":
    "Il doit rester au moins un administrateur.",
  "auth.getUserCountError": "Erreur lors de la vérification des utilisateurs",
  "exceptions.apiQueryProvider.apiUrlNotDefined": "API URL non définie",
  "exceptions.apiQueryProvider.apiError": "Erreur API {{status}}",
  "exceptions.encryption.invalidPayloadTooShort":
    "Charge utile chiffrée invalide : charge utile trop courte",
  "exceptions.encryption.invalidPayloadEmptyTag":
    "Charge utile chiffrée invalide : tag d'authentification vide",
};

/**
 * Récupère un message serveur par clé, avec remplacement optionnel des placeholders.
 * Placeholders au format {{key}} (ex: {{status}}).
 */
export function getServerMessage(
  key: string,
  params?: Record<string, string | number>
): string {
  let msg = messages[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      msg = msg.replace(new RegExp(`{{${k}}}`, "g"), String(v));
    }
  }
  return msg;
}
