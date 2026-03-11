import { NextRequest, NextResponse } from "next/server";
import DashboardRepository from "@/src/api/repositories/dashboardRepository";
import { getAuthWithRole, requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";

/**
 * GET /api/dashboards - Récupère tous les dashboards (auth requise)
 */
export async function GET(request: NextRequest) {
  try {
    await getAuthWithRole(request.headers);
    const dashboardRepository = new DashboardRepository();
    const dashboards = await dashboardRepository.getAll();
    return NextResponse.json(dashboards, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "dashboards GET",
      defaultStatus: 500,
    });
  }
}

/**
 * POST /api/dashboards - Crée un nouveau dashboard (edit ou admin)
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditOrAdmin(request.headers);
    const body = await request.json();
    const dashboardRepository = new DashboardRepository();
    await dashboardRepository.create(body);
    return NextResponse.json(null, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "dashboards POST",
      defaultStatus: 400,
    });
  }
}
