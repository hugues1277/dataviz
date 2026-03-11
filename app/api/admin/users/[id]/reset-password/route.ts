import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/api/utils/adminAuth";
import { databaseProvider } from "@/src/api/providers/databaseProvider";
import { hashPassword } from "better-auth/crypto";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";
import type { RouteParamsWithId } from "@/src/api/utils/routeParams";

/**
 * POST /api/admin/users/[id]/reset-password - Réinitialise le mot de passe (admin uniquement)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParamsWithId
): Promise<NextResponse> {
  try {
    await requireAdmin(request.headers);
    const { id } = await params;

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Nouveau mot de passe requis" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    const pool = databaseProvider.createPool();
    try {
      const result = await pool.query(
        `UPDATE account SET password = $1 WHERE "userId" = $2 AND "providerId" = 'credential' RETURNING id`,
        [hashedPassword, id]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: "Compte credential non trouvé pour cet utilisateur" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } finally {
      await pool.end();
    }
  } catch (error) {
    return handleApiError(error, {
      routeName: "admin/users reset-password POST",
      defaultStatus: 500,
    });
  }
}
