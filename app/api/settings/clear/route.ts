import { NextRequest, NextResponse } from "next/server";
import clearAllDatasUseCase from "@/src/api/core/useCases/clearAllDatasUseCase";
import { requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * POST /api/settings/clear - Supprime toutes les données de l'application (edit ou admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    await clearAllDatasUseCase.execute();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "settings/clear POST",
      defaultStatus: 500,
    });
  }
}
