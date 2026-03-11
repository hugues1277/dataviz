import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runDbMigration } from "@/src/api/providers/dbMigration";
import logger from "@/src/shared/utils/logger";

function isTablesMissingError(error: unknown): boolean {
  const err = error as {
    code?: string;
    body?: { code?: string };
    message?: string;
    cause?: unknown;
  };
  const msg = String(err?.message ?? (err?.cause as Error)?.message ?? "");
  const bodyCode = (err?.body as { code?: string })?.code;
  return (
    err?.code === "42P01" ||
    bodyCode === "42P01" ||
    msg.includes("does not exist") ||
    msg.includes('relation "')
  );
}

async function getSessionWithMigration(
  headers: Headers
): Promise<Awaited<ReturnType<typeof auth.api.getSession>> | null> {
  try {
    return await auth.api.getSession({ headers });
  } catch (error) {
    if (isTablesMissingError(error)) {
      await runDbMigration();
      return await auth.api.getSession({ headers });
    }
    throw error;
  }
}

/**
 * Proxy avec validation de session Better Auth.
 * Exécute la migration DB si les tables n'existent pas (première requête).
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const publicRoutes = ["/api/auth"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (pathname === "/sign-in") {
    try {
      const session = await getSessionWithMigration(request.headers);

      if (session?.user) {
        const redirectParam = request.nextUrl.searchParams.get("redirect");
        let redirectPath = "/";
        if (redirectParam?.startsWith("/") && !redirectParam.startsWith("//")) {
          redirectPath = redirectParam;
        }
        return NextResponse.redirect(new URL(redirectPath, request.url), { status: 308 });
      }

      return NextResponse.next();
    } catch (error) {
      logger.error("Proxy auth error for sign-in", error);
      return NextResponse.next();
    }
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    const session = await getSessionWithMigration(request.headers);

    if (!session?.user) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (error) {
    logger.error("Proxy auth error", error);
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }
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
