import { NextRequest, NextResponse } from "next/server";
import { getAppDatasUseCase } from "@/src/api/core/useCases/getAppDatasUseCase";
import { getAuthWithRole } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * GET /api/app-datas - Récupère toutes les données de l'application (auth requise)
 */
export async function GET(request: NextRequest) {
  try {
    await getAuthWithRole(request.headers);
    const result = await getAppDatasUseCase.execute();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "app-datas GET",
      defaultStatus: 500,
    });
  }
}
