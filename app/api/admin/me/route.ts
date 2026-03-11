import { NextRequest, NextResponse } from "next/server";
import { getAuthWithRole } from "@/src/api/utils/roleAuth";

/**
 * GET /api/admin/me - Retourne les infos de l'utilisateur connecté, son rôle et si c'est un admin.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthWithRole(request.headers);

    return NextResponse.json({
      user: { id: auth.userId, email: auth.userEmail },
      isAdmin: auth.role === "admin",
      role: auth.role,
      canEdit: auth.role === "edit" || auth.role === "admin",
    });
  } catch {
    return NextResponse.json(
      { isAdmin: false, role: "read", canEdit: false },
      { status: 401 }
    );
  }
}
