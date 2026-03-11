import { NextRequest, NextResponse } from "next/server";
import DashboardRepository from "@/src/api/repositories/dashboardRepository";
import { requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";
import type { RouteParamsWithId } from "@/src/api/utils/routeParams";

/**
 * DELETE /api/dashboards/[id] - Supprime un dashboard (edit ou admin)
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

    const dashboardRepository = new DashboardRepository();
    await dashboardRepository.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "dashboards DELETE",
      defaultStatus: 400,
    });
  }
}
