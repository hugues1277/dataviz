import { NextRequest, NextResponse } from "next/server";
import { importAppDatasUseCase } from "@/src/api/core/useCases/importAppDatasUseCase";
import { requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * POST /api/settings/import - Importe les données de l'application (edit ou admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const body = await request.json();
    await importAppDatasUseCase.execute(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "settings/import POST",
      defaultStatus: 400,
    });
  }
}
