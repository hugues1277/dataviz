import { NextResponse } from "next/server";
import { getUserCountUseCase } from "@/src/api/core/useCases/getUserCountUseCase";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * GET /api/admin/check-has-users - Vérifie si des utilisateurs existent dans la base de données
 */
export async function GET() {
  try {
    const { hasUsers } = await getUserCountUseCase.execute();
    return NextResponse.json({ hasUsers }, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "admin/check-has-users GET",
      defaultStatus: 500,
    });
  }
}
