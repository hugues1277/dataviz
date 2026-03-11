import { NextRequest, NextResponse } from "next/server";
import ChartRepository from "@/src/api/repositories/chartRepository";
import { getAuthWithRole, requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";
import type { RouteParamsWithId } from "@/src/api/utils/routeParams";

/**
 * GET /api/dashboards/[id]/charts - Récupère tous les charts d'un dashboard (auth requise)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParamsWithId
): Promise<NextResponse> {
  try {
    await getAuthWithRole(request.headers);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID du dashboard requis" },
        { status: 400 }
      );
    }

    const chartRepository = new ChartRepository();
    const charts = await chartRepository.getByDashboard(id);
    return NextResponse.json({ charts }, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "dashboards charts GET",
      defaultStatus: 500,
    });
  }
}

/**
 * DELETE /api/dashboards/[id]/charts - Supprime tous les charts d'un dashboard (edit ou admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParamsWithId
): Promise<NextResponse> {
  try {
    await requireEditOrAdmin(request.headers);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID du dashboard requis" },
        { status: 400 }
      );
    }

    const chartRepository = new ChartRepository();
    await chartRepository.deleteByDashboardId(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "dashboards charts DELETE",
      defaultStatus: 400,
    });
  }
}
