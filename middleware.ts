import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Middleware amélioré avec validation complète de session Better Auth
 * Utilise auth.api.getSession() pour valider les sessions avec vérification en base de données
 * 
 * Note: Nécessite runtime: "nodejs" pour Next.js 15.2.0+ avec validation complète de session
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Les routes API ne doivent pas être interceptées par le middleware
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ["/api/auth"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Route sign-in : vérifier si l'utilisateur est déjà connecté et rediriger automatiquement
  if (pathname === "/sign-in") {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // Si l'utilisateur est déjà connecté, rediriger automatiquement vers la page d'accueil ou le paramètre redirect
      if (session?.user) {
        const redirectParam = request.nextUrl.searchParams.get("redirect");
        // Valider que le paramètre redirect est une URL relative sécurisée
        let redirectPath = "/";

        if (redirectParam) {
          // Vérifier que c'est une URL relative qui commence par /
          if (redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
            redirectPath = redirectParam;
          }
        }

        // Utiliser une redirection permanente (308) pour éviter les boucles
        const redirectUrl = new URL(redirectPath, request.url);
        return NextResponse.redirect(redirectUrl, { status: 308 });
      }

      // Sinon, permettre l'accès à la page de connexion
      return NextResponse.next();
    } catch (error) {
      // En cas d'erreur, permettre l'accès à la page de connexion
      console.error("Middleware auth error for sign-in:", error);
      return NextResponse.next();
    }
  }

  // Les autres routes publiques (comme /api/auth) sont autorisées
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Routes protégées : valider la session
  try {
    // Utiliser request.headers directement dans le middleware
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      // Rediriger vers la page de connexion si non authentifié
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // En cas d'erreur, rediriger vers la page de connexion
    console.error("Middleware auth error:", error);
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  runtime: "nodejs", // Nécessaire pour Next.js 15.2.0+ avec validation complète de session
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
