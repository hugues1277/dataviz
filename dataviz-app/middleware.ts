import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Les routes API ne doivent pas être interceptées par le middleware
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // La route sign-in est publique
  if (request.nextUrl.pathname === "/sign-in") {
    return NextResponse.next();
  }

  // Pour les autres routes, on laisse Next.js gérer la navigation côté client
  // La protection sera gérée par les composants client avec useSession
  return NextResponse.next();
}

export const config = {
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
