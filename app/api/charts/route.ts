import { NextRequest, NextResponse } from "next/server";
import ChartRepository from "@/src/api/repositories/chartRepository";
import { getAuthWithRole, requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * GET /api/charts - Récupère tous les charts (auth requise)
 */
export async function GET(request: NextRequest) {
  try {
    await getAuthWithRole(request.headers);
    const chartRepository = new ChartRepository();
    const result = await chartRepository.getAll();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "charts GET",
      defaultStatus: 500,
    });
  }
}

/**
 * POST /api/charts - Crée un nouveau chart (edit ou admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const body = await request.json();
    const chartRepository = new ChartRepository();
    await chartRepository.create(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "charts POST",
      defaultStatus: 400,
    });
  }
}
