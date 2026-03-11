import { NextRequest, NextResponse } from "next/server";
import ChartRepository from "@/src/api/repositories/chartRepository";
import { requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";
import type { RouteParamsWithId } from "@/src/api/utils/routeParams";

/**
 * DELETE /api/charts/[id] - Supprime un chart (edit ou admin)
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
        { error: "ID du chart requis" },
        { status: 400 }
      );
    }

    const chartRepository = new ChartRepository();
    await chartRepository.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "charts DELETE",
      defaultStatus: 400,
    });
  }
}
