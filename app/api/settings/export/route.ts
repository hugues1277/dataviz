import { NextRequest, NextResponse } from "next/server";
import exportDataUseCase from "@/src/api/core/useCases/exportDataUseCase";
import { requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * GET /api/settings/export - Exporte les données de l'application (edit ou admin)
 */
export async function GET(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const result = await exportDataUseCase.execute();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "settings/export GET",
      defaultStatus: 500,
    });
  }
}
