import { NextRequest, NextResponse } from "next/server";
import ConnectionRepository from "@/src/api/repositories/connectionRepository";
import { requireEditOrAdmin } from "@/src/api/utils/roleAuth";
import { handleApiError } from "@/src/api/utils/apiErrorHandler";
import type { RouteParamsWithId } from "@/src/api/utils/routeParams";

/**
 * DELETE /api/connections/[id] - Supprime une connexion (edit ou admin)
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
        { error: "ID de la connexion requis" },
        { status: 400 }
      );
    }

    const connectionRepository = new ConnectionRepository();
    await connectionRepository.delete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, {
      routeName: "connections DELETE",
      defaultStatus: 400,
    });
  }
}
