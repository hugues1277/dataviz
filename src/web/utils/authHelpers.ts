import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Utilitaire pour obtenir la session côté serveur dans les Server Components
 * Redirige automatiquement vers /sign-in si non authentifié
 */
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/sign-in");
    }

    return session;
  } catch (error) {
    console.error("getServerSession error:", error);
    redirect("/sign-in");
  }
}

/**
 * Utilitaire pour obtenir la session côté serveur sans redirection automatique
 * Retourne null si non authentifié
 */
export async function getServerSessionOptional() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session;
  } catch (error) {
    console.error("getServerSessionOptional error:", error);
    return null;
  }
}

/**
 * Utilitaire pour vérifier l'authentification dans les Server Actions
 * Lance une erreur si non authentifié
 */
export async function requireServerAuth() {
  const session = await getServerSessionOptional();
  
  if (!session?.user) {
    throw new Error("Non autorisé - authentification requise");
  }

  return session;
}
